import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';

import Header from '../components/layout/Header.tsx';
import Footer from '../components/layout/Footer.tsx';
import {
  createThemeTokens,
  DEFAULT_THEME_COLOR,
  normalizeHexColor,
  THEME_STORAGE_KEY,
  type ThemeMode,
  type ThemeState,
} from '../utils/theme';

function getInitialThemeState(): ThemeState {
  if (typeof window === 'undefined') {
    return {
      themeColor: DEFAULT_THEME_COLOR,
      themeMode: 'dark',
      followSystem: true,
    };
  }

  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (!stored) {
      return {
        themeColor: DEFAULT_THEME_COLOR,
        themeMode: 'dark',
        followSystem: true,
      };
    }

    const parsed = JSON.parse(stored) as Partial<ThemeState>;
    return {
      themeColor: normalizeHexColor(parsed.themeColor ?? DEFAULT_THEME_COLOR),
      themeMode: parsed.themeMode === 'light' ? 'light' : 'dark',
      followSystem: parsed.followSystem ?? true,
    };
  } catch {
    return {
      themeColor: DEFAULT_THEME_COLOR,
      themeMode: 'dark',
      followSystem: true,
    };
  }
}

function getInitialSystemMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [themeState, setThemeState] = useState<ThemeState>(getInitialThemeState);
  const [systemMode, setSystemMode] = useState<ThemeMode>(getInitialSystemMode);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (event: MediaQueryListEvent) => {
      setSystemMode(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const effectiveMode: ThemeMode = useMemo(
    () => (themeState.followSystem ? systemMode : themeState.themeMode),
    [themeState.followSystem, themeState.themeMode, systemMode]
  );

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const tokens = createThemeTokens(themeState.themeColor, effectiveMode);

    root.dataset.theme = effectiveMode;
    root.style.setProperty('--color-accent-primary', tokens.accentPrimary);
    root.style.setProperty('--color-accent-secondary', tokens.accentSecondary);
    root.style.setProperty('--color-accent-soft', tokens.accentSoft);
    root.style.setProperty('--color-accent-underline-from', tokens.accentUnderlineFrom);
    root.style.setProperty('--color-accent-underline-to', tokens.accentUnderlineTo);
    root.style.setProperty('--color-accent-contrast', tokens.accentContrast);
    root.style.setProperty('--color-border-subtle', tokens.borderSubtle);
    root.style.setProperty('--color-divider-subtle', tokens.dividerSubtle);
    root.style.setProperty('--color-chip-bg', tokens.chipBg);
    root.style.setProperty('--color-chip-border', tokens.chipBorder);
    root.style.setProperty('--shadow-soft', tokens.shadowSoft);
    root.style.setProperty('--shadow-subtle', tokens.shadowSubtle);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(themeState));
    } catch {
      // ignore
    }
  }, [themeState, effectiveMode]);

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeState(prev => ({
      ...prev,
      themeMode: mode,
    }));
  };

  const handleSetFollowSystem = (followSystem: boolean) => {
    setThemeState(prev => ({
      ...prev,
      followSystem,
    }));
  };

  const handleSetThemeColor = (themeColor: string) => {
    setThemeState(prev => ({
      ...prev,
      themeColor: normalizeHexColor(themeColor),
    }));
  };

  const { pathname } = useLocation();
  const isAuthRoute = ['/login', '/register'].includes(pathname);

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col transition-colors duration-300 ease-out">
      {!isAuthRoute && (
        <Header
          mode={effectiveMode}
          themeColor={themeState.themeColor}
          followSystem={themeState.followSystem}
          onSetThemeMode={handleSetThemeMode}
          onSetFollowSystem={handleSetFollowSystem}
          onSetThemeColor={handleSetThemeColor}
        />
      )}

      <main className={isAuthRoute ? 'flex flex-1 items-center' : 'flex-1'}>
        <div
          className={
            isAuthRoute
              ? 'relative mx-auto w-full max-w-5xl px-4 py-10 md:py-16'
              : 'mx-auto max-w-6xl px-4 py-8 md:py-10 lg:py-12'
          }
        >
          {children}
        </div>
      </main>

      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default AppLayout;
