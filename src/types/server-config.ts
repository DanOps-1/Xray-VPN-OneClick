/**
 * Server Configuration Types
 *
 * Types for server configuration including public IP settings
 *
 * @module types/server-config
 */

/**
 * Source of the public IP address
 */
export type IpSource = 'auto' | 'manual';

/**
 * Server configuration stored in server-config.json
 */
export interface ServerConfig {
  /** Server's public IP address */
  publicIp: string;

  /** Last time the IP was updated */
  lastUpdated: string;

  /** How the IP was obtained */
  source: IpSource;

  /** Optional: Server port (defaults to reading from Xray config) */
  port?: number;
}

/**
 * Public IP detection result
 */
export interface IpDetectionResult {
  /** Detected IP address */
  ip: string;

  /** Whether detection was successful */
  success: boolean;

  /** Error message if detection failed */
  error?: string;

  /** Which service provided the IP */
  provider?: string;
}

/**
 * Public IP detection service configuration
 */
export interface IpDetectionService {
  /** Service name */
  name: string;

  /** Service URL */
  url: string;

  /** Request timeout in milliseconds */
  timeout: number;
}

/**
 * Default IP detection services (in priority order)
 */
export const DEFAULT_IP_SERVICES: IpDetectionService[] = [
  { name: 'ipify', url: 'https://api.ipify.org', timeout: 3000 },
  { name: 'ifconfig.me', url: 'https://ifconfig.me/ip', timeout: 3000 },
  { name: 'ip.sb', url: 'https://api.ip.sb/ip', timeout: 3000 },
];
