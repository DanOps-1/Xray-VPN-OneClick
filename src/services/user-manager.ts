/**
 * UserManager - User Management with Auto UUID Generation
 *
 * Provides safe user management with automatic service restart
 *
 * @module services/user-manager
 */

import { randomUUID, createPrivateKey, createPublicKey } from 'crypto';
import { URLSearchParams } from 'url';
import { ConfigManager } from './config-manager';
import { SystemdManager } from './systemd-manager';
import { PublicIpManager } from './public-ip-manager';
import { UserMetadataManager } from './user-metadata-manager';
import type { User, CreateUserParams, UserShareInfo } from '../types/user';
import { isValidEmail } from '../utils/validator';
import { UserError, NetworkError } from '../utils/errors';
import { UserErrors, NetworkErrors, ConfigErrors } from '../constants/error-codes';
import { ConfigError } from '../utils/errors';

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
      0x30, 0x2e, 0x02, 0x01, 0x00, 0x30, 0x05, 0x06, 0x03, 0x2b, 0x65, 0x6e, 0x04, 0x22, 0x04,
      0x20,
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
    throw new UserError(UserErrors.KEY_GENERATION_FAILED);
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
      throw new UserError(UserErrors.INVALID_EMAIL, email);
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
      throw new UserError(UserErrors.EMAIL_EXISTS, params.email);
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

        // Determine flow value: use provided, or default for VLESS + REALITY
        let flowValue = params.flow;
        if (!flowValue && inbound.protocol === 'vless') {
          // For VLESS with REALITY or TLS, default to xtls-rprx-vision
          const security = inbound.streamSettings?.security;
          if (security === 'reality' || security === 'tls') {
            flowValue = 'xtls-rprx-vision';
          }
        }

        inbound.settings.clients.push({
          id,
          email: params.email,
          level: params.level,
          flow: flowValue,
        });

        added = true;
        break;
      }
    }

    if (!added) {
      throw new ConfigError(ConfigErrors.CONFIG_INVALID_STRUCTURE, '未找到 VLESS/VMess inbound');
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
      throw new UserError(UserErrors.USER_NOT_FOUND, userId);
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

    // Find user in all inbounds and collect inbound info
    let user: User | undefined;
    let primaryInbound: {
      port: number;
      protocol: string;
      streamSettings?: {
        network?: string;
        security?: string;
        realitySettings?: {
          privateKey: string;
          serverNames: string[];
          shortIds: string[];
        };
        wsSettings?: {
          path: string;
          headers?: Record<string, string>;
        };
      };
    } | undefined;
    let wsInbound: {
      port: number;
      protocol: string;
      streamSettings?: {
        network?: string;
        security?: string;
        wsSettings?: {
          path: string;
          headers?: Record<string, string>;
        };
      };
    } | undefined;

    // Search through all inbounds
    for (const inbound of config.inbounds || []) {
      if (inbound.settings?.clients) {
        const client = inbound.settings.clients.find((c) => c.id === userId);
        if (client) {
          if (!user) {
            user = {
              id: client.id,
              email: client.email || '',
              level: client.level || 0,
              flow: client.flow,
              createdAt: metadata?.createdAt || new Date().toISOString(),
              status: metadata?.status || 'active',
            };
          }

          const network = inbound.streamSettings?.network || 'tcp';
          const security = inbound.streamSettings?.security || 'none';

          // Categorize inbound: WebSocket vs Primary (REALITY/TLS)
          if (network === 'ws') {
            wsInbound = {
              port: inbound.port,
              protocol: inbound.protocol,
              streamSettings: inbound.streamSettings,
            };
          } else if (security === 'reality' || security === 'tls') {
            primaryInbound = {
              port: inbound.port,
              protocol: inbound.protocol,
              streamSettings: inbound.streamSettings,
            };
          } else if (!primaryInbound) {
            // Fallback to first found inbound
            primaryInbound = {
              port: inbound.port,
              protocol: inbound.protocol,
              streamSettings: inbound.streamSettings,
            };
          }
        }
      }
    }

    if (!user) {
      throw new UserError(UserErrors.USER_NOT_FOUND, userId);
    }

    // Get public IP (from cache or detect)
    let serverAddress: string;
    try {
      serverAddress = await this.publicIpManager.getPublicIp();
    } catch {
      throw new NetworkError(NetworkErrors.PUBLIC_IP_FAILED);
    }

    // Use primary inbound for main link, fallback to ws if no primary
    const mainInbound = primaryInbound || wsInbound;
    if (!mainInbound) {
      throw new UserError(UserErrors.USER_NOT_FOUND, userId);
    }

    const port = mainInbound.port || 443;
    const security = mainInbound.streamSettings?.security || 'tls';
    const network = mainInbound.streamSettings?.network || 'tcp';
    const flow = user.flow || 'xtls-rprx-vision';
    const name = encodeURIComponent(user.email);

    let vlessLink: string;
    let publicKey: string | undefined;
    let shortId: string | undefined;
    let serverName: string | undefined;

    if (security === 'reality' && primaryInbound?.streamSettings?.realitySettings) {
      const reality = primaryInbound.streamSettings.realitySettings;

      // Generate public key from private key
      publicKey = generatePublicKeyFromPrivate(reality.privateKey);
      serverName = reality.serverNames[0] || 'www.microsoft.com';
      shortId = reality.shortIds[0] || '';

      const params = new URLSearchParams();
      params.set('encryption', 'none');
      params.set('security', 'reality');
      params.set('type', network);
      params.set('flow', flow);
      params.set('pbk', publicKey);
      params.set('fp', 'chrome');
      params.set('sni', serverName);
      params.set('sid', shortId);
      params.set('spx', '/');

      vlessLink = `vless://${user.id}@${serverAddress}:${port}?${params.toString()}#${name}`;
    } else {
      vlessLink = `vless://${user.id}@${serverAddress}:${port}?encryption=none&security=${security}&type=${network}&flow=${flow}#${name}`;
    }

    // Build CDN (WebSocket) link if ws inbound exists
    let cdnShareLink: string | undefined;
    let wsPath: string | undefined;

    if (wsInbound?.streamSettings?.wsSettings) {
      wsPath = wsInbound.streamSettings.wsSettings.path;
      const wsHost = wsInbound.streamSettings.wsSettings.headers?.Host || serverAddress;
      const wsSecurity = wsInbound.streamSettings.security || 'none';
      const wsPort = wsInbound.port || 443;

      const wsParams = new URLSearchParams({
        encryption: 'none',
        security: wsSecurity === 'tls' ? 'tls' : 'tls', // CDN always uses TLS on client side
        type: 'ws',
        host: wsHost,
        path: wsPath,
        sni: wsHost,
      });

      // CDN link uses domain as server address (user should replace with their CDN domain)
      cdnShareLink = `vless://${user.id}@${wsHost}:${wsPort}?${wsParams.toString()}#${encodeURIComponent(user.email + '-CDN')}`;
    }

    return {
      user,
      shareLink: vlessLink,
      cdnShareLink,
      serverAddress,
      serverPort: port,
      protocol: mainInbound.protocol || 'vless',
      security,
      network,
      serverName,
      publicKey,
      shortId,
      wsPath,
      qrCode: vlessLink,
    };
  }

  /**
   * Get CDN share link for a user with custom domain
   *
   * @param userId - User ID (UUID)
   * @param cdnDomain - CDN domain (e.g., "example.com")
   * @param cdnPort - CDN port (default: 443)
   * @returns CDN share link string or null if no WebSocket inbound
   */
  async getCdnShareLink(userId: string, cdnDomain: string, cdnPort: number = 443): Promise<string | null> {
    const config = await this.configManager.readConfig();

    // Find WebSocket inbound with this user
    for (const inbound of config.inbounds || []) {
      if (inbound.settings?.clients) {
        const client = inbound.settings.clients.find((c) => c.id === userId);
        if (client && inbound.streamSettings?.network === 'ws') {
          const wsPath = inbound.streamSettings.wsSettings?.path || '/ws';

          const params = new URLSearchParams({
            encryption: 'none',
            security: 'tls',
            type: 'ws',
            host: cdnDomain,
            path: wsPath,
            sni: cdnDomain,
          });

          const name = encodeURIComponent((client.email || 'user') + '-CDN');
          return `vless://${client.id}@${cdnDomain}:${cdnPort}?${params.toString()}#${name}`;
        }
      }
    }

    return null;
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
