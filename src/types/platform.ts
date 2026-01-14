/**
 * Platform-related type definitions for cross-platform support
 * Feature: 009-cross-platform-support
 */

/* eslint-disable no-unused-vars */
export enum OsFamily {
  DEBIAN = 'debian',
  RHEL = 'rhel',
}

export enum PackageManager {
  APT = 'apt',
  DNF = 'dnf',
}

export enum FirewallType {
  IPTABLES = 'iptables',
  FIREWALLD = 'firewalld',
  NONE = 'none',
}

export enum ContainerType {
  DOCKER = 'docker',
  LXC = 'lxc',
  OPENVZ = 'openvz',
  NONE = 'none',
}

export enum SelinuxStatus {
  ENFORCING = 'enforcing',
  PERMISSIVE = 'permissive',
  DISABLED = 'disabled',
}

export interface OperatingSystem {
  id: string;
  name: string;
  version: string;
  versionId: string;
  family: OsFamily;
  packageManager: PackageManager;
  isSupported: boolean;
  minVersion: string;
}

export interface FirewallConfig {
  type: FirewallType;
  isActive: boolean;
  port: number;
  protocol: 'tcp' | 'udp' | 'both';
}

export interface NetworkInterface {
  name: string;
  ipv4?: string;
  ipv6?: string;
  isLoopback: boolean;
}

export interface NetworkConfig {
  interfaces: NetworkInterface[];
  selectedIp: string;
  isNat: boolean;
  publicIp?: string;
}

export interface EnvironmentInfo {
  shell: string;
  isCompatibleShell: boolean;
  containerType: ContainerType;
  isContainer: boolean;
  selinuxStatus: SelinuxStatus;
  virtualization?: string;
  hasSystemd: boolean;
}

export interface PlatformInfo {
  os: OperatingSystem;
  environment: EnvironmentInfo;
  network: NetworkConfig;
  firewall: FirewallConfig;
}
