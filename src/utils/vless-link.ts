/**
 * VLESS link parser utilities
 * @module utils/vless-link
 */

import { isValidPort, isValidUuid } from './validator';
import { ProtocolError } from './errors';
import { ProtocolErrors } from '../constants/error-codes';

export interface VlessLinkInfo {
  uuid: string;
  server: string;
  port: number;
  name: string;
  encryption?: string;
  security?: string;
  type?: string;
  flow?: string;
  sni?: string;
  fp?: string;
  pbk?: string;
  sid?: string;
  spx?: string;
  host?: string;
  path?: string;
  serviceName?: string;
  alpn?: string;
  headerType?: string;
}

export function normalizeVlessLink(raw: string): string {
  return raw.trim().replace(/\s+/g, '');
}

export function parseVlessLink(raw: string): VlessLinkInfo {
  const normalized = normalizeVlessLink(raw);
  let url: URL;

  try {
    url = new URL(normalized);
  } catch {
    throw new ProtocolError(ProtocolErrors.INVALID_VLESS_LINK);
  }

  if (url.protocol !== 'vless:') {
    throw new ProtocolError(ProtocolErrors.INVALID_VLESS_LINK, url.protocol);
  }

  const uuid = url.username;
  if (!uuid) {
    throw new ProtocolError(ProtocolErrors.VLESS_MISSING_UUID);
  }
  if (!isValidUuid(uuid)) {
    throw new ProtocolError(ProtocolErrors.VLESS_MISSING_UUID, uuid);
  }

  const server = url.hostname;
  if (!server) {
    throw new ProtocolError(ProtocolErrors.VLESS_MISSING_HOST);
  }

  const port = url.port ? parseInt(url.port, 10) : 443;
  if (!isValidPort(port)) {
    throw new ProtocolError(ProtocolErrors.VLESS_INVALID_PORT, String(port));
  }

  const name = url.hash ? decodeURIComponent(url.hash.slice(1)) : '';
  const params = url.searchParams;
  const getParam = (key: string): string | undefined => {
    const value = params.get(key);
    return value === null ? undefined : value;
  };

  return {
    uuid,
    server,
    port,
    name: name || `${server}:${port}`,
    encryption: getParam('encryption'),
    security: getParam('security'),
    type: getParam('type'),
    flow: getParam('flow'),
    sni: getParam('sni'),
    fp: getParam('fp'),
    pbk: getParam('pbk'),
    sid: getParam('sid'),
    spx: getParam('spx'),
    host: getParam('host'),
    path: getParam('path'),
    serviceName: getParam('serviceName'),
    alpn: getParam('alpn'),
    headerType: getParam('headerType'),
  };
}
