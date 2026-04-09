/**
 * Subscription Server
 *
 * Lightweight HTTP server that serves user subscription links.
 * Each user gets a unique token-based URL that returns their
 * current config in V2RayN-compatible format (base64 encoded VLESS links).
 *
 * @module services/subscription-server
 */

import http from 'http';
import { randomBytes } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { UserManager } from './user-manager';
import { UserMetadataManager } from './user-metadata-manager';

const SUB_CONFIG_PATH = join(homedir(), '.xray-manager', 'subscriptions.json');

interface SubConfig {
  port: number;
  enabled: boolean;
  tokens: Record<string, string>; // token -> userId
}

const DEFAULT_CONFIG: SubConfig = {
  port: 2096,
  enabled: false,
  tokens: {},
};

export class SubscriptionServer {
  private server: http.Server | null = null;
  private userManager: UserManager;
  private metadataManager: UserMetadataManager;
  private config: SubConfig = DEFAULT_CONFIG;

  constructor(userManager: UserManager) {
    this.userManager = userManager;
    this.metadataManager = new UserMetadataManager();
  }

  /**
   * Load subscription config
   */
  async loadConfig(): Promise<SubConfig> {
    try {
      if (existsSync(SUB_CONFIG_PATH)) {
        const content = await readFile(SUB_CONFIG_PATH, 'utf-8');
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
    return this.config;
  }

  /**
   * Save subscription config
   */
  async saveConfig(): Promise<void> {
    const dir = dirname(SUB_CONFIG_PATH);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(SUB_CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  /**
   * Generate a subscription token for a user
   */
  async generateToken(userId: string): Promise<string> {
    const token = randomBytes(16).toString('hex');
    await this.loadConfig();

    // Remove any existing token for this user
    for (const [existingToken, uid] of Object.entries(this.config.tokens)) {
      if (uid === userId) {
        delete this.config.tokens[existingToken];
      }
    }

    this.config.tokens[token] = userId;
    await this.saveConfig();

    // Also store in user metadata
    await this.metadataManager.setMetadata(userId, { subscriptionToken: token });

    return token;
  }

  /**
   * Get token for a user (generate if needed)
   */
  async getOrCreateToken(userId: string): Promise<string> {
    await this.loadConfig();

    // Check existing
    for (const [token, uid] of Object.entries(this.config.tokens)) {
      if (uid === userId) return token;
    }

    return this.generateToken(userId);
  }

  /**
   * Get all user subscription info
   */
  async getAllSubscriptions(): Promise<
    Array<{ userId: string; email: string; token: string; url: string }>
  > {
    await this.loadConfig();
    const users = await this.userManager.listUsers();
    const result: Array<{ userId: string; email: string; token: string; url: string }> = [];

    for (const user of users) {
      if (user.status !== 'active') continue;
      const token = await this.getOrCreateToken(user.id);
      result.push({
        userId: user.id,
        email: user.email,
        token,
        url: `/sub/${token}`,
      });
    }

    return result;
  }

  /**
   * Handle subscription request
   */
  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = req.url ?? '';

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Health check
    if (url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    // Subscription endpoint: /sub/{token}
    const subMatch = url.match(/^\/sub\/([a-f0-9]{32})$/);
    if (!subMatch) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const token = subMatch[1]!;
    await this.loadConfig();
    const userId = this.config.tokens[token];

    if (!userId) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Invalid subscription token');
      return;
    }

    try {
      const shareInfo = await this.userManager.getShareInfo(userId);

      // Build subscription content (base64-encoded links, one per line)
      const links: string[] = [];
      if (shareInfo.shareLink) {
        links.push(shareInfo.shareLink);
      }
      if (shareInfo.cdnShareLink) {
        links.push(shareInfo.cdnShareLink);
      }

      const content = Buffer.from(links.join('\n')).toString('base64');

      // User-Agent detection for format (reserved for future Clash/Surge support)
      const _ua = (req.headers['user-agent'] ?? '').toLowerCase();

      res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${shareInfo.user.email || 'sub'}"`,
        'Profile-Update-Interval': '24',
        'Subscription-Userinfo': `upload=0; download=0; total=0; expire=0`,
      });
      res.end(content);
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`Error: ${(e as Error).message}`);
    }
  }

  /**
   * Start the subscription server
   */
  async start(): Promise<number> {
    await this.loadConfig();
    const port = this.config.port;

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch(() => {
          res.writeHead(500);
          res.end('Internal Server Error');
        });
      });

      this.server.listen(port, '0.0.0.0', () => {
        this.config.enabled = true;
        this.saveConfig().catch(() => {});
        resolve(port);
      });

      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Stop the subscription server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          this.config.enabled = false;
          this.saveConfig().catch(() => {});
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  /**
   * Get configured port
   */
  getPort(): number {
    return this.config.port;
  }

  /**
   * Set port (requires restart)
   */
  async setPort(port: number): Promise<void> {
    await this.loadConfig();
    this.config.port = port;
    await this.saveConfig();
  }
}
