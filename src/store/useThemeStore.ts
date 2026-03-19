import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ThemeConfig {
  mode: 'light' | 'dark';
  logoUrl: string;
  logoText: string;
  adminDarkModeEnabled: boolean; // admin can disable dark mode toggle for users
}

interface ThemeStore {
  config: ThemeConfig;
  setMode: (mode: 'light' | 'dark') => void;
  toggleMode: () => void;
  setLogoUrl: (url: string) => void;
  setLogoText: (text: string) => void;
  setAdminDarkModeEnabled: (enabled: boolean) => void;
  setConfig: (config: ThemeConfig) => void;
}

const defaultConfig: ThemeConfig = {
  mode: 'dark',
  logoUrl: '/images/edvo-brand-logo.png',
  logoText: '',
  adminDarkModeEnabled: true,
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      config: defaultConfig,
      setMode: (mode) =>
        set((state) => ({ config: { ...state.config, mode } })),
      toggleMode: () =>
        set((state) => ({
          config: {
            ...state.config,
            mode: state.config.mode === 'light' ? 'dark' : 'light',
          },
        })),
      setLogoUrl: (url) =>
        set((state) => ({ config: { ...state.config, logoUrl: url } })),
      setLogoText: (text) =>
        set((state) => ({ config: { ...state.config, logoText: text } })),
      setAdminDarkModeEnabled: (enabled) =>
        set((state) => ({ config: { ...state.config, adminDarkModeEnabled: enabled } })),
      setConfig: (config) => set({ config }),
    }),
    { name: 'theme-storage' }
  )
);
