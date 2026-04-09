/**
 * Telegram Notifier Service
 *
 * Sends notifications via Telegram Bot API.
 * Zero external dependencies - uses native https module.
 *
 * @module services/telegram-notifier
 */

import https from 'https';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.xray-manager', 'telegram.json');

export type NotifyEvent =
  | 'quota_warning'
  | 'quota_exceeded'
  | 'user_expiry'
  | 'user_expired'
  | 'service_down'
  | 'service_up'
  | 'user_created'
  | 'user_deleted'
  | 'daily_summary';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
  enabledEvents: NotifyEvent[];
}

const DEFAULT_CONFIG: TelegramConfig = {
  botToken: '',
  chatId: '',
  enabled: false,
  enabledEvents: [
    'quota_warning',
    'quota_exceeded',
    'user_expiry',
    'user_expired',
    'service_down',
    'service_up',
  ],
};

export class TelegramNotifier {
  private config: TelegramConfig = DEFAULT_CONFIG;

  async loadConfig(): Promise<TelegramConfig> {
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

  async setConfig(config: Partial<TelegramConfig>): Promise<void> {
    await this.loadConfig();
    this.config = { ...this.config, ...config };
    await this.saveConfig();
  }

  isConfigured(): boolean {
    return !!(this.config.botToken && this.config.chatId);
  }

  isEventEnabled(event: NotifyEvent): boolean {
    return this.config.enabled && this.config.enabledEvents.includes(event);
  }

  /**
   * Send a message via Telegram Bot API
   */
  async sendMessage(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
    if (!this.isConfigured()) return false;

    return new Promise((resolve) => {
      const data = JSON.stringify({
        chat_id: this.config.chatId,
        text,
        parse_mode: parseMode,
      });

      const req = https.request(
        {
          hostname: 'api.telegram.org',
          path: `/bot${this.config.botToken}/sendMessage`,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(data),
          },
          timeout: 10000,
        },
        (res) => {
          resolve(res.statusCode === 200);
        }
      );

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });
      req.write(data);
      req.end();
    });
  }

  /**
   * Send a test message to verify configuration
   */
  async testConnection(): Promise<boolean> {
    return this.sendMessage('\u2705 <b>Xray Manager</b> - Telegram notification test successful!');
  }

  /**
   * Notify about a specific event
   */
  async notify(event: NotifyEvent, details: Record<string, string>): Promise<boolean> {
    await this.loadConfig();
    if (!this.isEventEnabled(event)) return false;

    const message = this.formatMessage(event, details);
    return this.sendMessage(message);
  }

  private formatMessage(event: NotifyEvent, d: Record<string, string>): string {
    const prefix = '\u{1f4e1} <b>Xray Manager</b>\n';

    switch (event) {
      case 'quota_warning':
        return `${prefix}\u26a0\ufe0f <b>Quota Warning</b>\nUser: <code>${d.email}</code>\nUsage: ${d.used} / ${d.limit} (${d.percent}%)`;
      case 'quota_exceeded':
        return `${prefix}\ud83d\uded1 <b>Quota Exceeded</b>\nUser: <code>${d.email}</code>\nUsage: ${d.used} / ${d.limit}\nUser has been disabled.`;
      case 'user_expiry':
        return `${prefix}\u23f0 <b>Expiry Warning</b>\nUser: <code>${d.email}</code>\nExpires in: ${d.days} days`;
      case 'user_expired':
        return `${prefix}\u274c <b>User Expired</b>\nUser: <code>${d.email}</code>\nExpired at: ${d.date}\nUser has been disabled.`;
      case 'service_down':
        return `${prefix}\ud83d\udd34 <b>Service Down</b>\nXray service is not running!\nTime: ${d.time}`;
      case 'service_up':
        return `${prefix}\ud83d\udfe2 <b>Service Up</b>\nXray service is running.\nTime: ${d.time}`;
      case 'user_created':
        return `${prefix}\u2795 <b>User Created</b>\nEmail: <code>${d.email}</code>\nExpiry: ${d.expiry || 'Never'}`;
      case 'user_deleted':
        return `${prefix}\u2796 <b>User Deleted</b>\nEmail: <code>${d.email}</code>`;
      case 'daily_summary':
        return `${prefix}\ud83d\udcca <b>Daily Summary</b>\nUsers: ${d.totalUsers}\nOnline: ${d.onlineUsers}\nTraffic today: ${d.trafficToday}\nExpiring soon: ${d.expiringSoon}`;
      default:
        return `${prefix}Event: ${event}\n${JSON.stringify(d)}`;
    }
  }

  getConfig(): TelegramConfig {
    return { ...this.config };
  }
}
