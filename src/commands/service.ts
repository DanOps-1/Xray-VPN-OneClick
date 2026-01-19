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
import layoutManager from '../services/layout-manager';
import { renderHeader, renderSection } from '../utils/layout';

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

    // Use responsive header based on terminal width
    const terminalSize = layoutManager.detectTerminalSize();
    const headerTitle = `${menuIcons.STATUS} 服务状态: ${serviceName}`;
    const headerText = renderHeader(headerTitle, terminalSize.width, 'left');
    console.log(chalk.bold.cyan(headerText));

    logger.separator();
    logger.newline();

    // Group 1: 基本状态信息
    const statusIcon = status.healthy ? '[正常]' : status.active ? '[活动]' : '[停止]';
    const statusText = status.healthy
      ? chalk.green('运行中')
      : status.active
        ? chalk.yellow(status.subState)
        : chalk.red('已停止');

    const basicStatusContent = `状态: ${statusText}
活动状态: ${status.activeState}
子状态: ${status.subState}
已加载: ${status.loaded ? '是' : '否'}`;

    const basicStatusSection = renderSection(`${statusIcon} 基本状态`, basicStatusContent, {
      showBorder: false,
    });
    console.log(basicStatusSection);

    // Group 2: 进程信息 (if available)
    if (status.pid || status.memory || status.uptime) {
      logger.newline();
      let processContent = '';

      if (status.pid) {
        processContent += `进程 PID: ${status.pid}\n`;
      }
      if (status.memory) {
        processContent += `内存占用: ${status.memory}\n`;
      }
      if (status.uptime) {
        processContent += `运行时长: ${status.uptime}`;
      }

      const processSection = renderSection('[信息] 进程信息', processContent.trim(), {
        showBorder: false,
      });
      console.log(processSection);
    }

    // Group 3: 其他信息 (if available)
    if (status.restarts !== undefined && status.restarts > 0) {
      logger.newline();
      const otherSection = renderSection('[警告] 重启记录', `重启次数: ${status.restarts}`, {
        showBorder: false,
      });
      console.log(chalk.yellow(otherSection));
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
