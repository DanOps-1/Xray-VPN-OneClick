/**
 * Scheduler Service
 *
 * In-process task scheduler for periodic operations like
 * expiry checks, quota enforcement, and notifications.
 *
 * @module services/scheduler
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

const CONFIG_PATH = join(homedir(), '.xray-manager', 'scheduler.json');

export interface ScheduledTask {
  id: string;
  name: string;
  intervalMs: number;
  enabled: boolean;
  lastRun?: string;
}

export interface SchedulerConfig {
  tasks: ScheduledTask[];
}

const DEFAULT_TASKS: ScheduledTask[] = [
  { id: 'expiry-check', name: 'Check User Expiry', intervalMs: 3600000, enabled: true }, // 1 hour
  { id: 'quota-enforce', name: 'Enforce Quotas', intervalMs: 600000, enabled: true }, // 10 min
  { id: 'monthly-reset', name: 'Monthly Traffic Reset', intervalMs: 86400000, enabled: false }, // 24 hours (checks day)
  { id: 'notifications', name: 'Send Notifications', intervalMs: 300000, enabled: true }, // 5 min
];

export type TaskHandler = (_task: ScheduledTask) => Promise<void>;

export class Scheduler {
  private config: SchedulerConfig = { tasks: DEFAULT_TASKS };
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private handlers: Map<string, TaskHandler> = new Map();
  private running = false;

  async loadConfig(): Promise<SchedulerConfig> {
    try {
      if (existsSync(CONFIG_PATH)) {
        const content = await readFile(CONFIG_PATH, 'utf-8');
        const saved = JSON.parse(content) as SchedulerConfig;
        // Merge with defaults to pick up any new tasks
        const taskMap = new Map(saved.tasks.map((t) => [t.id, t]));
        this.config.tasks = DEFAULT_TASKS.map((dt) => taskMap.get(dt.id) ?? dt);
      }
    } catch {
      this.config = { tasks: [...DEFAULT_TASKS] };
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
   * Register a handler for a task ID
   */
  registerHandler(taskId: string, handler: TaskHandler): void {
    this.handlers.set(taskId, handler);
  }

  /**
   * Start all enabled tasks
   */
  async start(): Promise<void> {
    await this.loadConfig();
    this.running = true;

    for (const task of this.config.tasks) {
      if (task.enabled) {
        this.scheduleTask(task);
      }
    }
  }

  /**
   * Stop all tasks
   */
  stop(): void {
    this.running = false;
    for (const [id, timer] of this.timers) {
      clearInterval(timer);
      this.timers.delete(id);
    }
  }

  private scheduleTask(task: ScheduledTask): void {
    // Clear existing timer
    const existing = this.timers.get(task.id);
    if (existing) clearInterval(existing);

    const timer = setInterval(async () => {
      if (!this.running) return;

      const handler = this.handlers.get(task.id);
      if (!handler) return;

      try {
        await handler(task);
        task.lastRun = new Date().toISOString();
        this.saveConfig().catch(() => {});
      } catch {
        // Task failed - continue
      }
    }, task.intervalMs);

    this.timers.set(task.id, timer);
  }

  /**
   * Enable/disable a task
   */
  async setTaskEnabled(taskId: string, enabled: boolean): Promise<void> {
    const task = this.config.tasks.find((t) => t.id === taskId);
    if (!task) return;

    task.enabled = enabled;
    await this.saveConfig();

    if (enabled && this.running) {
      this.scheduleTask(task);
    } else if (!enabled) {
      const timer = this.timers.get(taskId);
      if (timer) {
        clearInterval(timer);
        this.timers.delete(taskId);
      }
    }
  }

  /**
   * Run a task immediately
   */
  async runNow(taskId: string): Promise<void> {
    const handler = this.handlers.get(taskId);
    const task = this.config.tasks.find((t) => t.id === taskId);
    if (handler && task) {
      await handler(task);
      task.lastRun = new Date().toISOString();
      await this.saveConfig();
    }
  }

  getTasks(): ScheduledTask[] {
    return [...this.config.tasks];
  }

  isRunning(): boolean {
    return this.running;
  }
}
