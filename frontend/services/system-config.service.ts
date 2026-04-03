import api from './api';

export type SystemConfig = {
  primary_color?: string | null;
  login_bg_url?: string | null;
  theme_mode?: string | null;
  icon_set?: string | null;
};

export const systemConfigService = {
  async getConfig(): Promise<SystemConfig> {
    const res = await api.get<SystemConfig>('/system-config');
    return res.data;
  },

  async updateConfig(config: Partial<SystemConfig>): Promise<SystemConfig> {
    const res = await api.put<SystemConfig>('/system-config', { config });
    return res.data;
  },

  async uploadLoginBg(file: File): Promise<{ login_bg_url: string }> {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post<{ login_bg_url: string }>('/system-config/login-bg', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getLoginBgUrl(path: string | null | undefined): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http')) return path;
    const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010/api').replace('/api', '');
    return `${base}${path}`;
  },

  applyConfig(config: SystemConfig) {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (config.primary_color) {
      root.style.setProperty('--primary', config.primary_color);
      root.style.setProperty('--ring', config.primary_color);
      root.style.setProperty('--sidebar-primary', config.primary_color);
      root.style.setProperty('--sidebar-ring', config.primary_color);
    }
  },
};
