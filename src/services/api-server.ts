/**
 * REST API Server
 *
 * Lightweight HTTP API for external integrations.
 * Zero external dependencies - uses native http module.
 *
 * @module services/api-server
 */

import http from 'http';
import { randomBytes } from 'crypto';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { UserManager } from './user-manager';
import { SystemdManager } from './systemd-manager';
import { QuotaManager } from './quota-manager';
import { OnlineManager } from './online-manager';
import { SystemMonitor } from './system-monitor';

const CONFIG_PATH = join(homedir(), '.xray-manager', 'api.json');

interface ApiConfig {
  port: number;
  enabled: boolean;
  apiKey: string;
  bindAddress: string;
}

const DEFAULT_CONFIG: ApiConfig = {
  port: 8080,
  enabled: false,
  apiKey: '',
  bindAddress: '127.0.0.1',
};

type RouteHandler = (
  _req: http.IncomingMessage,
  _res: http.ServerResponse,
  _params: Record<string, string>
) => Promise<void>;

export class ApiServer {
  private server: http.Server | null = null;
  private config: ApiConfig = DEFAULT_CONFIG;
  private userManager: UserManager;
  private systemdManager: SystemdManager;
  private quotaManager: QuotaManager;
  private onlineManager: OnlineManager;
  private systemMonitor: SystemMonitor;
  private routes: Array<{
    method: string;
    pattern: RegExp;
    paramNames: string[];
    handler: RouteHandler;
  }> = [];

  constructor(
    userManager: UserManager,
    systemdManager: SystemdManager,
    quotaManager: QuotaManager
  ) {
    this.userManager = userManager;
    this.systemdManager = systemdManager;
    this.quotaManager = quotaManager;
    this.onlineManager = new OnlineManager();
    this.systemMonitor = new SystemMonitor();
    this.registerRoutes();
  }

  async loadConfig(): Promise<ApiConfig> {
    try {
      if (existsSync(CONFIG_PATH)) {
        const content = await readFile(CONFIG_PATH, 'utf-8');
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(content) };
      }
    } catch {
      this.config = { ...DEFAULT_CONFIG };
    }
    return this.config;
  }

  async saveConfig(): Promise<void> {
    const dir = dirname(CONFIG_PATH);
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    await writeFile(CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf-8');
  }

  /**
   * Generate a new API key
   */
  async generateApiKey(): Promise<string> {
    const key = `xm_${randomBytes(24).toString('hex')}`;
    await this.loadConfig();
    this.config.apiKey = key;
    await this.saveConfig();
    return key;
  }

  private registerRoutes(): void {
    this.route('GET', '/api/users', async (_req, res) => {
      const users = await this.userManager.listUsers();
      this.json(res, 200, { users });
    });

    this.route('GET', '/api/users/online', async (_req, res) => {
      const online = await this.onlineManager.getOnlineConnections();
      this.json(res, 200, online);
    });

    this.route('POST', '/api/users', async (req, res) => {
      const body = await this.readBody(req);
      const user = await this.userManager.addUser({
        email: String(body.email ?? ''),
        expiryDays: body.expiryDays ? Number(body.expiryDays) : undefined,
        dataLimit: body.dataLimit ? Number(body.dataLimit) : undefined,
        maxConnections: body.maxConnections ? Number(body.maxConnections) : undefined,
      });
      this.json(res, 201, { user });
    });

    this.route('DELETE', '/api/users/:id', async (_req, res, params) => {
      await this.userManager.deleteUser(params.id!);
      this.json(res, 200, { success: true });
    });

    this.route('GET', '/api/users/:id/share', async (_req, res, params) => {
      const info = await this.userManager.getShareInfo(params.id!);
      this.json(res, 200, info);
    });

    this.route('GET', '/api/quotas', async (_req, res) => {
      const quotas = await this.quotaManager.getAllQuotas();
      this.json(res, 200, { quotas });
    });

    this.route('PUT', '/api/quotas/:email', async (req, res, params) => {
      const body = await this.readBody(req);
      const quotaBytes = Number(body.quotaBytes ?? 0);
      await this.quotaManager.setQuota({
        email: params.email!,
        quotaBytes,
        quotaType: quotaBytes > 0 ? 'limited' : 'unlimited',
      });
      this.json(res, 200, { success: true });
    });

    this.route('POST', '/api/quotas/:email/reset', async (_req, res, params) => {
      await this.quotaManager.resetUsage(params.email!);
      this.json(res, 200, { success: true });
    });

    this.route('GET', '/api/service/status', async (_req, res) => {
      const status = await this.systemdManager.getStatus();
      this.json(res, 200, status);
    });

    this.route('POST', '/api/service/:action', async (_req, res, params) => {
      const action = params.action!;
      if (!['start', 'stop', 'restart'].includes(action)) {
        this.json(res, 400, { error: 'Invalid action' });
        return;
      }
      const mgr = this.systemdManager;
      const result =
        action === 'start'
          ? await mgr.start()
          : action === 'stop'
            ? await mgr.stop()
            : await mgr.restart();
      this.json(res, 200, result);
    });

    this.route('GET', '/api/stats/system', async (_req, res) => {
      const metrics = this.systemMonitor.getAll();
      this.json(res, 200, metrics);
    });
  }

  private route(method: string, path: string, handler: RouteHandler): void {
    const paramNames: string[] = [];
    const patternStr = path.replace(/:(\w+)/g, (_match, name) => {
      paramNames.push(name);
      return '([^/]+)';
    });
    this.routes.push({ method, pattern: new RegExp(`^${patternStr}$`), paramNames, handler });
  }

  private json(res: http.ServerResponse, status: number, data: unknown): void {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
  }

  private readBody(req: http.IncomingMessage): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      req.on('data', (chunk: Buffer) => chunks.push(chunk));
      req.on('end', () => {
        try {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve(body ? JSON.parse(body) : {});
        } catch {
          reject(new Error('Invalid JSON'));
        }
      });
      req.on('error', reject);
    });
  }

  private authenticate(req: http.IncomingMessage): boolean {
    if (!this.config.apiKey) return true; // No key configured = open
    const auth = req.headers.authorization ?? '';
    return auth === `Bearer ${this.config.apiKey}`;
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (!this.authenticate(req)) {
      this.json(res, 401, { error: 'Unauthorized' });
      return;
    }

    const url = (req.url ?? '').split('?')[0]!;
    const method = req.method ?? 'GET';

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const match = url.match(route.pattern);
      if (!match) continue;

      const params: Record<string, string> = {};
      route.paramNames.forEach((name, i) => {
        params[name] = decodeURIComponent(match[i + 1] ?? '');
      });

      try {
        await route.handler(req, res, params);
      } catch (e) {
        this.json(res, 500, { error: (e as Error).message });
      }
      return;
    }

    this.json(res, 404, { error: 'Not found' });
  }

  async start(): Promise<number> {
    await this.loadConfig();
    const port = this.config.port;
    const bind = this.config.bindAddress;

    return new Promise((resolve, reject) => {
      this.server = http.createServer((req, res) => {
        this.handleRequest(req, res).catch(() => {
          res.writeHead(500);
          res.end('{"error":"Internal Server Error"}');
        });
      });

      this.server.listen(port, bind, () => {
        this.config.enabled = true;
        this.saveConfig().catch(() => {});
        resolve(port);
      });

      this.server.on('error', reject);
    });
  }

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

  isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  getConfig(): ApiConfig {
    return { ...this.config };
  }
}
