import React, { createContext, useContext, useMemo } from 'react';
import { ConfigManager } from '../services/config-manager.js';
import { UserManager } from '../services/user-manager.js';
import { SystemdManager } from '../services/systemd-manager.js';
import { QuotaManager } from '../services/quota-manager.js';
import { TrafficManager } from '../services/traffic-manager.js';
import { LogManager } from '../services/log-manager.js';
import { StatsConfigManager } from '../services/stats-config-manager.js';

export interface ServiceInstances {
  configManager: ConfigManager;
  userManager: UserManager;
  systemdManager: SystemdManager;
  quotaManager: QuotaManager;
  trafficManager: TrafficManager;
  logManager: LogManager;
  statsConfigManager: StatsConfigManager;
}

export interface ServiceOptions {
  configPath?: string;
  serviceName?: string;
}

const ServiceContext = createContext<ServiceInstances | null>(null);

export function ServiceProvider({
  children,
  options,
}: {
  children: React.ReactNode;
  options: ServiceOptions;
}) {
  const services = useMemo(() => {
    const serviceName = options.serviceName ?? 'xray';
    return {
      configManager: new ConfigManager(options.configPath),
      userManager: new UserManager(options.configPath, serviceName),
      systemdManager: new SystemdManager(serviceName),
      quotaManager: new QuotaManager(),
      trafficManager: new TrafficManager(),
      logManager: new LogManager(serviceName),
      statsConfigManager: new StatsConfigManager(options.configPath, serviceName),
    };
  }, [options.configPath, options.serviceName]);

  return <ServiceContext.Provider value={services}>{children}</ServiceContext.Provider>;
}

export function useServices(): ServiceInstances {
  const ctx = useContext(ServiceContext);
  if (!ctx) throw new Error('useServices must be used within ServiceProvider');
  return ctx;
}
