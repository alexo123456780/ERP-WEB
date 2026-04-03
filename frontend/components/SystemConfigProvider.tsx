'use client';
import { useEffect } from 'react';
import { systemConfigService } from '../services/system-config.service';

export function SystemConfigProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    systemConfigService
      .getConfig()
      .then((config) => systemConfigService.applyConfig(config))
      .catch(() => {
        // Si falla, continúa con los colores por defecto del CSS
      });
  }, []);

  return <>{children}</>;
}
