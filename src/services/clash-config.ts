/**
 * Clash config generator for VLESS links
 * @module services/clash-config
 */

import { VlessLinkInfo } from '../utils/vless-link';

export interface ClashConfigOptions {
  proxyName?: string;
  proxyGroupName?: string;
}

export interface ClashConfigResult {
  yaml: string;
  proxyName: string;
  proxyGroupName: string;
}

function yamlQuote(value: string): string {
  const escaped = value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `"${escaped}"`;
}

function renderStringList(lines: string[], indent: number, values: string[]): void {
  const prefix = ' '.repeat(indent);
  values.forEach((value) => {
    lines.push(`${prefix}- ${yamlQuote(value)}`);
  });
}

export function buildClashConfigYaml(
  info: VlessLinkInfo,
  options: ClashConfigOptions = {}
): ClashConfigResult {
  const proxyName = options.proxyName || info.name || `${info.server}:${info.port}`;
  const proxyGroupName = options.proxyGroupName || 'PROXY';

  const network = (info.type || 'tcp').toLowerCase();
  const security = (info.security || '').toLowerCase();

  const lines: string[] = [];

  lines.push('port: 7890');
  lines.push('socks-port: 7891');
  lines.push('allow-lan: true');
  lines.push('mode: rule');
  lines.push('log-level: info');
  lines.push('');
  lines.push('proxies:');
  lines.push(`  - name: ${yamlQuote(proxyName)}`);
  lines.push('    type: vless');
  lines.push(`    server: ${yamlQuote(info.server)}`);
  lines.push(`    port: ${info.port}`);
  lines.push(`    uuid: ${yamlQuote(info.uuid)}`);
  lines.push('    udp: true');
  lines.push(`    network: ${yamlQuote(network)}`);

  if (info.flow) {
    lines.push(`    flow: ${yamlQuote(info.flow)}`);
  }

  if (security === 'reality' || security === 'tls') {
    lines.push('    tls: true');
    if (info.sni) {
      lines.push(`    servername: ${yamlQuote(info.sni)}`);
    }
  }

  if (security === 'reality') {
    if (!info.pbk) {
      throw new Error('Reality 链接缺少 pbk 参数');
    }
    lines.push('    reality-opts:');
    lines.push(`      public-key: ${yamlQuote(info.pbk)}`);
    if (info.sid) {
      lines.push(`      short-id: ${yamlQuote(info.sid)}`);
    }
    if (info.spx) {
      lines.push(`      spider-x: ${yamlQuote(info.spx)}`);
    }
  }

  if (info.fp) {
    lines.push(`    client-fingerprint: ${yamlQuote(info.fp)}`);
  }

  if (info.alpn) {
    const list = info.alpn
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    if (list.length > 0) {
      lines.push('    alpn:');
      renderStringList(lines, 6, list);
    }
  }

  if (network === 'ws') {
    lines.push('    ws-opts:');
    if (info.path) {
      lines.push(`      path: ${yamlQuote(info.path)}`);
    }
    if (info.host) {
      lines.push('      headers:');
      lines.push(`        Host: ${yamlQuote(info.host)}`);
    }
  }

  if (network === 'grpc') {
    lines.push('    grpc-opts:');
    const serviceName = info.serviceName || info.path;
    if (serviceName) {
      lines.push(`      grpc-service-name: ${yamlQuote(serviceName)}`);
    }
  }

  lines.push('');
  lines.push('proxy-groups:');
  lines.push(`  - name: ${yamlQuote(proxyGroupName)}`);
  lines.push('    type: select');
  lines.push('    proxies:');
  lines.push(`      - ${yamlQuote(proxyName)}`);
  lines.push('      - DIRECT');
  lines.push('');
  lines.push('rules:');
  lines.push(`  - MATCH,${proxyGroupName}`);
  lines.push('');

  return {
    yaml: `${lines.join('\n')}\n`,
    proxyName,
    proxyGroupName,
  };
}
