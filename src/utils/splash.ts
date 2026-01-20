/**
 * Splash Screen Animation
 *
 * XRAY 立体3D文字动画
 * 简洁大气的启动画面
 *
 * @module utils/splash
 */

import chalk from 'chalk';

// 颜色方案：青色主题
const C = {
  bright: chalk.cyanBright,    // 高亮面
  main: chalk.cyan,            // 主色
  dark: chalk.blueBright,      // 阴影面
  shadow: chalk.blue,          // 深阴影
  accent: chalk.magentaBright, // 强调色
  text: chalk.white,           // 文字
  dim: chalk.gray,             // 暗色
};

/**
 * XRAY 立体文字 - 基础帧
 */
const XRAY_LOGO = [
  '                                                            ',
  '  ██╗  ██╗██████╗  █████╗ ██╗   ██╗                        ',
  '  ╚██╗██╔╝██╔══██╗██╔══██╗╚██╗ ██╔╝                        ',
  '   ╚███╔╝ ██████╔╝███████║ ╚████╔╝                         ',
  '   ██╔██╗ ██╔══██╗██╔══██║  ╚██╔╝                          ',
  '  ██╔╝ ██╗██║  ██║██║  ██║   ██║                           ',
  '  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝                           ',
  '                                                            ',
  '  ███╗   ███╗ █████╗ ███╗   ██╗ █████╗  ██████╗ ███████╗██████╗ ',
  '  ████╗ ████║██╔══██╗████╗  ██║██╔══██╗██╔════╝ ██╔════╝██╔══██╗',
  '  ██╔████╔██║███████║██╔██╗ ██║███████║██║  ███╗█████╗  ██████╔╝',
  '  ██║╚██╔╝██║██╔══██║██║╚██╗██║██╔══██║██║   ██║██╔══╝  ██╔══██╗',
  '  ██║ ╚═╝ ██║██║  ██║██║ ╚████║██║  ██║╚██████╔╝███████╗██║  ██║',
  '  ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝',
  '                                                            ',
];

/**
 * 构建动画帧
 */
function buildFrame(frameNum: number): string[] {
  const f = frameNum % 12;
  const lines: string[] = [];

  // 颜色动画：渐变效果
  const colorPatterns = [
    [C.bright, C.main, C.dark],
    [C.main, C.bright, C.main],
    [C.dark, C.main, C.bright],
    [C.main, C.dark, C.main],
    [C.bright, C.main, C.dark],
    [C.accent, C.bright, C.main],  // 闪烁
    [C.bright, C.main, C.dark],
    [C.main, C.bright, C.main],
    [C.dark, C.main, C.bright],
    [C.main, C.dark, C.main],
    [C.bright, C.main, C.dark],
    [C.main, C.accent, C.bright],  // 闪烁
  ];
  const colors = colorPatterns[f];

  // 顶部装饰线动画
  const topLinePatterns = [
    '  ══════════════════════════════════════════════════════  ',
    '  ═══════════════════╣ ▪ ╠═══════════════════════════════  ',
    '  ══════════════════╣ ▪▪ ╠══════════════════════════════  ',
    '  ═════════════════╣ ▪▪▪ ╠═════════════════════════════  ',
    '  ════════════════╣ ▪▪▪▪ ╠════════════════════════════  ',
    '  ═══════════════╣ ▪▪▪▪▪ ╠═══════════════════════════  ',
    '  ════════════════╣ ▪▪▪▪ ╠════════════════════════════  ',
    '  ═════════════════╣ ▪▪▪ ╠═════════════════════════════  ',
    '  ══════════════════╣ ▪▪ ╠══════════════════════════════  ',
    '  ═══════════════════╣ ▪ ╠═══════════════════════════════  ',
    '  ══════════════════════════════════════════════════════  ',
    '  ═══════════════════╣ ✦ ╠═══════════════════════════════  ',
  ];

  // 空行
  lines.push('');

  // 顶部装饰
  lines.push(C.dark(topLinePatterns[f]));

  // XRAY 文字 (前7行)
  for (let i = 1; i <= 7; i++) {
    if (i <= 3) {
      lines.push(colors[0](XRAY_LOGO[i]));
    } else if (i <= 5) {
      lines.push(colors[1](XRAY_LOGO[i]));
    } else {
      lines.push(colors[2](XRAY_LOGO[i]));
    }
  }

  // MANAGER 文字 (后7行)
  for (let i = 8; i <= 14; i++) {
    if (i <= 10) {
      lines.push(colors[2](XRAY_LOGO[i]));
    } else if (i <= 12) {
      lines.push(colors[1](XRAY_LOGO[i]));
    } else {
      lines.push(colors[0](XRAY_LOGO[i]));
    }
  }

  // 底部装饰
  lines.push(C.dark(topLinePatterns[(f + 6) % 12]));

  // 补齐
  while (lines.length < 18) {
    lines.push('');
  }

  return lines;
}

// 生成36帧
const FRAMES: string[][] = [];
for (let i = 0; i < 36; i++) {
  FRAMES.push(buildFrame(i));
}

// 工具函数
function clearScreen(): void {
  process.stdout.write('\x1b[2J\x1b[H');
}

function moveCursorHome(): void {
  process.stdout.write('\x1b[H');
}

function hideCursor(): void {
  process.stdout.write('\x1b[?25l');
}

function showCursor(): void {
  process.stdout.write('\x1b[?25h');
}

function displayFrame(frame: string[], version: string): void {
  moveCursorHome();
  frame.forEach((line) => console.log(line));
  console.log();
  console.log(C.dim('                    一键部署和管理 Xray VPN 服务'));
  console.log(C.dim(`                              v${version}`));
  console.log();
}

/**
 * 显示启动动画
 */
export async function showSplash(
  version: string = '1.0.0',
  options: {
    animated?: boolean;
    frames?: number;
    frameDuration?: number;
  } = {}
): Promise<void> {
  const { animated = true, frames = 24, frameDuration = 80 } = options;

  if (!animated) {
    displayFrame(FRAMES[0], version);
    return;
  }

  clearScreen();
  hideCursor();

  try {
    const startTime = Date.now();
    for (let i = 0; i < frames; i++) {
      displayFrame(FRAMES[i], version);
      const elapsed = Date.now() - startTime;
      const expected = (i + 1) * frameDuration;
      await new Promise((r) => setTimeout(r, Math.max(0, expected - elapsed)));
    }
    displayFrame(FRAMES[0], version);
    await new Promise((r) => setTimeout(r, 500));
  } finally {
    showCursor();
  }
}

/**
 * 简约启动
 */
export function showMinimalSplash(version: string = '1.0.0'): void {
  console.log(C.bright('XRAY') + C.main(' MANAGER') + C.dim(` v${version}`));
  console.log();
}
