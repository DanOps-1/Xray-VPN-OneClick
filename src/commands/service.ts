/**
 * Service Command Handler
 *
 * Handles service-related commands (status, start, stop, restart)
 *
 * @module commands/service
 */

import { SystemdManager } from '../services/systemd-manager';
import logger from '../utils/logger';
import chalk from 'chalk';
import ora from 'ora';
import { menuIcons } from '../constants/ui-symbols';

/**
 * Service command options
 */
export interface ServiceCommandOptions {
  /** Service name (default: xray) */
  service?: string;

  /** JSON output mode */
  json?: boolean;

  /** Verbose mode */
  verbose?: boolean;
}

/**
 * Display service status
 *
 * @param options - Command options
 */
export async function displayServiceStatus(options: ServiceCommandOptions = {}): Promise<void> {
  const serviceName = options.service || 'xray';
  const manager = new SystemdManager(serviceName);

  try {
    const spinner = ora(`正在获取 ${serviceName} 服务状态...`).start();

    const status = await manager.getStatus();

    spinner.stop();

    if (options.json) {
      // JSON 输出模式
      console.log(JSON.stringify(status, null, 2));
      return;
    }

    // 格式化显示
    logger.newline();
    logger.separator();
    console.log(chalk.bold.cyan(`${menuIcons.STATUS} 服务状态: ${serviceName}`));
    logger.separator();
    logger.newline();

    // 状态指示器
    const statusIcon = status.healthy ? '[正常]' : status.active ? '[活动]' : '[停止]';
    const statusText = status.healthy
      ? chalk.green('运行中')
      : status.active
        ? chalk.yellow(status.subState)
        : chalk.red('已停止');

    console.log(`${statusIcon} 状态: ${statusText}`);
    console.log(`   活动状态: ${chalk.cyan(status.activeState)}`);
    console.log(`   子状态: ${chalk.cyan(status.subState)}`);
    console.log(`   已加载: ${status.loaded ? chalk.green('是') : chalk.red('否')}`);

    if (status.pid) {
      console.log(`   进程 PID: ${chalk.cyan(status.pid)}`);
    }

    if (status.memory) {
      console.log(`   内存占用: ${chalk.cyan(status.memory)}`);
    }

    if (status.uptime) {
      console.log(`   运行时长: ${chalk.cyan(status.uptime)}`);
    }

    if (status.restarts !== undefined && status.restarts > 0) {
      console.log(`   重启次数: ${chalk.yellow(status.restarts)}`);
    }

    logger.newline();
  } catch (error) {
    if (options.json) {
      console.error(JSON.stringify({ error: (error as Error).message }));
      process.exit(1);
    } else {
      logger.error((error as Error).message);
      process.exit(1);
    }
  }
}

/**
 * Start service
 *
 * @param options - Command options
 */
export async function startService(options: ServiceCommandOptions = {}): Promise<void> {
  const serviceName = options.service || 'xray';
  const manager = new SystemdManager(serviceName);

  try {
    const spinner = ora(`正在启动 ${serviceName} 服务...`).start();

    const result = await manager.start();

    if (result.success) {
      spinner.succeed(chalk.green(`${serviceName} 服务启动成功！`));

      if (options.verbose) {
        console.log(chalk.gray(`   耗时: ${result.duration}ms`));
      }
    } else {
      spinner.fail(chalk.red(`${serviceName} 服务启动失败`));
      if (result.stderr) {
        logger.error(result.stderr);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Stop service
 *
 * @param options - Command options
 */
export async function stopService(options: ServiceCommandOptions = {}): Promise<void> {
  const serviceName = options.service || 'xray';
  const manager = new SystemdManager(serviceName);

  try {
    const spinner = ora(`正在停止 ${serviceName} 服务...`).start();

    const result = await manager.stop();

    if (result.success) {
      spinner.succeed(chalk.green(`${serviceName} 服务已停止`));

      if (options.verbose) {
        console.log(chalk.gray(`   耗时: ${result.duration}ms`));
      }
    } else {
      spinner.fail(chalk.red(`${serviceName} 服务停止失败`));
      if (result.stderr) {
        logger.error(result.stderr);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}

/**
 * Restart service
 *
 * @param options - Command options
 */
export async function restartService(options: ServiceCommandOptions = {}): Promise<void> {
  const serviceName = options.service || 'xray';
  const manager = new SystemdManager(serviceName);

  try {
    // 显示预估停机时间
    const estimatedDowntime = manager.estimateDowntime();
    logger.info(`预计停机时间: ${chalk.cyan(`${estimatedDowntime / 1000}秒`)}`);

    const spinner = ora(`正在重启 ${serviceName} 服务...`).start();

    const result = await manager.restart();

    if (result.success) {
      spinner.succeed(chalk.green(`${serviceName} 服务重启成功！`));

      if (result.downtime) {
        const downtimeSeconds = (result.downtime / 1000).toFixed(2);
        console.log(chalk.gray(`   实际停机时间: ${downtimeSeconds}秒`));
      }

      if (options.verbose) {
        console.log(chalk.gray(`   总耗时: ${result.duration}ms`));
      }
    } else {
      spinner.fail(chalk.red(`${serviceName} 服务重启失败`));
      if (result.stderr) {
        logger.error(result.stderr);
      }
      process.exit(1);
    }
  } catch (error) {
    logger.error((error as Error).message);
    process.exit(1);
  }
}
