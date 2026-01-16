/**
 * UserManager - User Management with Auto UUID Generation
 *
 * Provides safe user management with automatic service restart
 *
 * @module services/user-manager
 */

import { randomUUID, createPrivateKey, createPublicKey } from 'crypto';
import { ConfigManager } from './config-manager';
import { SystemdManager } from './systemd-manager';
import { PublicIpManager } from './public-ip-manager';
import { UserMetadataManager } from './user-metadata-manager';
import type { User, CreateUserParams, UserShareInfo } from '../types/user';
import { isValidEmail } from '../utils/validator';

/**
 * Generate X25519 public key from private key
 *
 * @param privateKeyBase64 - Base64URL encoded private key (32 bytes)
 * @returns Base64URL encoded public key
 */
function generatePublicKeyFromPrivate(privateKeyBase64: string): string {
  try {
    // Decode the raw private key (32 bytes)
    const privateKeyBuffer = Buffer.from(privateKeyBase64, 'base64url');

    // X25519 PKCS#8 DER header (for 32-byte raw key)
    const pkcs8Header = Buffer.from([
      0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6e,
      0x04, 0x22, 0x04, 0x20,
    ]);

    const privateKeyDer = Buffer.concat([pkcs8Header, privateKeyBuffer]);

    const privateKey = createPrivateKey({
      key: privateKeyDer,
      format: 'der',
      type: 'pkcs8',
    });

    const publicKey = createPublicKey(privateKey);
    const publicKeySpki = publicKey.export({ type: 'spki', format: 'der' });

    // Extract the raw public key (last 32 bytes of SPKI)
    const publicKeyRaw = publicKeySpki.slice(-32);
    return publicKeyRaw.toString('base64url');
  } catch {
    throw new Error('Failed to generate public key from private key');
  }
}

/**
 * UserManager - Manage Xray users
 */
export class UserManager {
  private configManager: ConfigManager;
  private systemdManager: SystemdManager;
  private publicIpManager: PublicIpManager;
  private metadataManager: UserMetadataManager;
  private serviceName: string;

  /**
   * Create a new UserManager
   *
   * @param configPath - Optional config file path
   * @param serviceName - Service name (default: xray)
   */
  constructor(configPath?: string, serviceName: string = 'xray') {
    this.configManager = new ConfigManager(configPath);
    this.systemdManager = new SystemdManager(serviceName);
    this.publicIpManager = new PublicIpManager();
    this.metadataManager = new UserMetadataManager();
    this.serviceName = serviceName;
  }

  /**
   * Generate a new UUID v4 using crypto.randomUUID()
   *
   * @returns UUID string
   */
  generateUuid(): string {
    return randomUUID();
  }

  /**
   * Validate email address
   *
   * @param email - Email to validate
   * @throws Error if email is invalid
   */
  validateEmail(email: string): void {
    if (!isValidEmail(email)) {
      throw new Error(`无效的邮箱地址: ${email}`);
    }
  }

  /**
   * List all users from config
   *
   * @returns Array of users
   */
  async listUsers(): Promise<User[]> {
    const config = await this.configManager.readConfig();
    const allMetadata = await this.metadataManager.getAllMetadata();
    const users: User[] = [];

    // Extract users from all inbounds
    for (const inbound of config.inbounds || []) {
      if (inbound.settings?.clients) {
        for (const client of inbound.settings.clients) {
          const metadata = allMetadata[client.id];
          users.push({
            id: client.id,
            email: client.email || '',
            level: client.level || 0,
            flow: client.flow,
            createdAt: metadata?.createdAt || new Date().toISOString(),
            status: metadata?.status || 'active',
          });
        }
      }
    }

    return users;
  }

  /**
   * Add a new user with auto-generated UUID
   *
   * @param params - User creation parameters
   * @returns Created user
   */
  async addUser(params: CreateUserParams): Promise<User> {
    // Validate email
    this.validateEmail(params.email);

    // Check for duplicate email
    const existingUsers = await this.listUsers();
    const duplicate = existingUsers.find((u) => u.email === params.email);
    if (duplicate) {
      throw new Error(`邮箱地址已存在: ${params.email}`);
    }

    // Backup config before modification
    await this.configManager.backupConfig();

    // Generate UUID
    const id = this.generateUuid();
    const now = new Date().toISOString();

    // Create user object
    const newUser: User = {
      id,
      email: params.email,
      level: params.level ?? 0,
      flow: params.flow,
      createdAt: now,
      status: 'active',
    };

    // Read config
    const config = await this.configManager.readConfig();

    // Find first VLESS or VMess inbound and add user
    let added = false;
    for (const inbound of config.inbounds || []) {
      if (inbound.protocol === 'vless' || inbound.protocol === 'vmess') {
        if (!inbound.settings) {
          inbound.settings = { clients: [] };
        }
        if (!inbound.settings.clients) {
          inbound.settings.clients = [];
        }

        inbound.settings.clients.push({
          id,
          email: params.email,
          level: params.level,
          flow: params.flow,
        });

        added = true;
        break;
      }
    }

    if (!added) {
      throw new Error('配置文件中未找到 VLESS 或 VMess inbound');
    }

    // Write config
    await this.configManager.writeConfig(config);

    // Create user metadata
    await this.metadataManager.createUser(id);

    // Restart service
    await this.systemdManager.restart();

    return newUser;
  }

  /**
   * Delete user by ID
   *
   * @param userId - User ID (UUID) to delete
   */
  async deleteUser(userId: string): Promise<void> {
    // Backup config before modification
    await this.configManager.backupConfig();

    // Read config
    const config = await this.configManager.readConfig();

    // Find and remove user
    let found = false;
    for (const inbound of config.inbounds || []) {
      if (inbound.settings?.clients) {
        const index = inbound.settings.clients.findIndex((c) => c.id === userId);
        if (index !== -1) {
          inbound.settings.clients.splice(index, 1);
          found = true;
          break;
        }
      }
    }

    if (!found) {
      throw new Error(`用户不存在: ${userId}`);
    }

    // Write config
    await this.configManager.writeConfig(config);

    // Delete user metadata
    await this.metadataManager.deleteMetadata(userId);

    // Restart service
    await this.systemdManager.restart();
  }

  /**
   * Get share information for a user
   *
   * @param userId - User ID (UUID)
   * @returns Share information including VLESS link
   */
  async getShareInfo(userId: string): Promise<UserShareInfo> {
    const config = await this.configManager.readConfig();
    const metadata = await this.metadataManager.getMetadata(userId);

    // Find user and inbound settings
    let user: User | undefined;
    let inboundPort: number | undefined;
    let inboundProtocol: string | undefined;
    let streamSettings: {
      network?: string;
      security?: string;
      realitySettings?: {
        privateKey: string;
        serverNames: string[];
        shortIds: string[];
      };
    } | undefined;

    for (const inbound of config.inbounds || []) {
      if (inbound.settings?.clients) {
        const client = inbound.settings.clients.find((c) => c.id === userId);
        if (client) {
          user = {
            id: client.id,
            email: client.email || '',
            level: client.level || 0,
            flow: client.flow,
            createdAt: metadata?.createdAt || new Date().toISOString(),
            status: metadata?.status || 'active',
          };
          inboundPort = inbound.port;
          inboundProtocol = inbound.protocol;
          streamSettings = inbound.streamSettings;
          break;
        }
      }
    }

    if (!user) {
      throw new Error(`用户不存在: ${userId}`);
    }

    // Get public IP (from cache or detect)
    let serverAddress: string;
    try {
      serverAddress = await this.publicIpManager.getPublicIp();
    } catch {
      // If detection fails, throw error - caller should handle manual input
      throw new Error('无法获取公网 IP，请手动设置');
    }

    // Build VLESS link based on security type
    const port = inboundPort || 443;
    const encryption = 'none';
    const security = streamSettings?.security || 'tls';
    const network = streamSettings?.network || 'tcp';
    const flow = user.flow || 'xtls-rprx-vision';
    const name = encodeURIComponent(user.email);

    let vlessLink: string;
    let publicKey: string | undefined;
    let shortId: string | undefined;
    let serverName: string | undefined;

    if (security === 'reality' && streamSettings?.realitySettings) {
      const reality = streamSettings.realitySettings;

      // Generate public key from private key
      publicKey = generatePublicKeyFromPrivate(reality.privateKey);
      serverName = reality.serverNames[0] || 'www.microsoft.com';
      shortId = reality.shortIds[0] || '';

      // Build REALITY link
      // Format: vless://UUID@server:port?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&pbk=PUBLIC_KEY&fp=chrome&sni=SNI&sid=SHORT_ID#name
      const params = new URLSearchParams({
        encryption,
        security: 'reality',
        type: network,
        flow,
        pbk: publicKey,
        fp: 'chrome',
        sni: serverName,
        sid: shortId,
        spx: '/',
      });

      vlessLink = `vless://${user.id}@${serverAddress}:${port}?${params.toString()}#${name}`;
    } else {
      // Build standard TLS link
      vlessLink = `vless://${user.id}@${serverAddress}:${port}?encryption=${encryption}&security=${security}&type=${network}&flow=${flow}#${name}`;
    }

    return {
      user,
      shareLink: vlessLink,
      serverAddress,
      serverPort: port,
      protocol: inboundProtocol || 'vless',
      security,
      serverName,
      publicKey,
      shortId,
      qrCode: vlessLink,
    };
  }

  /**
   * Check if public IP needs manual input
   *
   * @returns true if manual input is needed
   */
  async needsPublicIpInput(): Promise<boolean> {
    return this.publicIpManager.needsManualInput();
  }

  /**
   * Set public IP manually
   *
   * @param ip - Public IP address
   */
  async setPublicIp(ip: string): Promise<void> {
    await this.publicIpManager.setPublicIp(ip);
  }

  /**
   * Get current public IP (from cache)
   *
   * @returns Public IP or null if not set
   */
  async getPublicIp(): Promise<string | null> {
    const config = await this.publicIpManager.getConfig();
    return config?.publicIp || null;
  }

  /**
   * Get metadata manager for external access
   *
   * @returns UserMetadataManager instance
   */
  getMetadataManager(): UserMetadataManager {
    return this.metadataManager;
  }
}
