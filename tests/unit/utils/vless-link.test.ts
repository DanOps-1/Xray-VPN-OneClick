import { describe, it, expect } from 'vitest';
import { parseVlessLink, generateVlessRealityLink, generateVlessWebSocketLink } from '../../../src/utils/vless-link';
import { buildClashConfigYaml } from '../../../src/services/clash-config';

const sampleLink =
  'vless://5b6ec5d1-93a1-4056-b90f-9be61021144d@3.139.134.188:443?encryption=none&security=reality&type=tcp&flow=xtls-rprx-vision&pbk=gsQazazvUOLxdcwhenIxf0rIQzanJI48HROjezdWq2Y&fp=chrome&sni=www.microsoft.com&sid=f611741eea195fcf&spx=%2F#user%40example.com';

describe('parseVlessLink', () => {
  it('parses VLESS reality link fields', () => {
    const info = parseVlessLink(sampleLink);

    expect(info.uuid).toBe('5b6ec5d1-93a1-4056-b90f-9be61021144d');
    expect(info.server).toBe('3.139.134.188');
    expect(info.port).toBe(443);
    expect(info.security).toBe('reality');
    expect(info.flow).toBe('xtls-rprx-vision');
    expect(info.pbk).toBe('gsQazazvUOLxdcwhenIxf0rIQzanJI48HROjezdWq2Y');
    expect(info.sni).toBe('www.microsoft.com');
    expect(info.sid).toBe('f611741eea195fcf');
    expect(info.spx).toBe('/');
    expect(info.name).toBe('user@example.com');
  });

  it('normalizes whitespace in the link', () => {
    const info = parseVlessLink(`\n  ${sampleLink} \n`);
    expect(info.server).toBe('3.139.134.188');
  });
});

describe('generateVlessRealityLink', () => {
  it('generates valid REALITY link', () => {
    const link = generateVlessRealityLink({
      uuid: '5b6ec5d1-93a1-4056-b90f-9be61021144d',
      server: '3.139.134.188',
      port: 443,
      publicKey: 'gsQazazvUOLxdcwhenIxf0rIQzanJI48HROjezdWq2Y',
      shortId: 'f611741eea195fcf',
      sni: 'www.microsoft.com',
      remark: 'Test-Reality',
    });

    expect(link).toContain('vless://5b6ec5d1-93a1-4056-b90f-9be61021144d@3.139.134.188:443');
    expect(link).toContain('security=reality');
    expect(link).toContain('flow=xtls-rprx-vision');
    expect(link).toContain('pbk=gsQazazvUOLxdcwhenIxf0rIQzanJI48HROjezdWq2Y');
    expect(link).toContain('sid=f611741eea195fcf');
    expect(link).toContain('sni=www.microsoft.com');
    expect(link).toContain('#Test-Reality');
  });
});

describe('generateVlessWebSocketLink', () => {
  it('generates valid WebSocket CDN link', () => {
    const link = generateVlessWebSocketLink({
      uuid: '5b6ec5d1-93a1-4056-b90f-9be61021144d',
      server: 'example.com',
      port: 443,
      path: '/ws',
      host: 'example.com',
      tls: true,
      remark: 'Test-CDN',
    });

    expect(link).toContain('vless://5b6ec5d1-93a1-4056-b90f-9be61021144d@example.com:443');
    expect(link).toContain('security=tls');
    expect(link).toContain('type=ws');
    expect(link).toContain('path=%2Fws');
    expect(link).toContain('host=example.com');
    expect(link).toContain('#Test-CDN');
  });

  it('generates link without TLS when specified', () => {
    const link = generateVlessWebSocketLink({
      uuid: '5b6ec5d1-93a1-4056-b90f-9be61021144d',
      server: 'example.com',
      port: 80,
      path: '/ws',
      tls: false,
      remark: 'Test-NoTLS',
    });

    expect(link).toContain('security=none');
    expect(link).toContain('type=ws');
  });
});

describe('buildClashConfigYaml', () => {
  it('renders clash yaml with reality options', () => {
    const info = parseVlessLink(sampleLink);
    const { yaml } = buildClashConfigYaml(info);

    expect(yaml).toContain('type: vless');
    expect(yaml).toContain('server: "3.139.134.188"');
    expect(yaml).toContain('uuid: "5b6ec5d1-93a1-4056-b90f-9be61021144d"');
    expect(yaml).toContain('tls: true');
    expect(yaml).toContain('network: "tcp"');
    expect(yaml).toContain('flow: "xtls-rprx-vision"');
    expect(yaml).toContain('reality-opts:');
    expect(yaml).toContain('public-key: "gsQazazvUOLxdcwhenIxf0rIQzanJI48HROjezdWq2Y"');
    expect(yaml).toContain('short-id: "f611741eea195fcf"');
    expect(yaml).toContain('spider-x: "/"');
    expect(yaml).toContain('client-fingerprint: "chrome"');
  });
});
