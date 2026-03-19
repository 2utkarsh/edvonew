'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { config } = useThemeStore();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = config.mode;
    root.style.colorScheme = config.mode;

    if (config.mode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [config.mode]);

  return <>{children}</>;
}
