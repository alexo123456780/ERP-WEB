'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { systemConfigService, SystemConfig } from '../services/system-config.service';

const SystemConfigContext = createContext<SystemConfig>({});

export function useSystemConfig() {
  return useContext(SystemConfigContext);
}

export function SystemConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<SystemConfig>({});
  const { setTheme } = useTheme();

  useEffect(() => {
    systemConfigService
      .getConfig()
      .then((cfg) => {
        setConfig(cfg);
        systemConfigService.applyConfig(cfg);
        if (cfg.theme_mode) {
          setTheme(cfg.theme_mode);
        }
      })
      .catch(() => {});
  }, [setTheme]);

  return (
    <SystemConfigContext.Provider value={config}>
      {children}
    </SystemConfigContext.Provider>
  );
}
