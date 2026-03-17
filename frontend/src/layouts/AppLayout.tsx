import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import Header from '../components/layout/Header.tsx';
import Footer from '../components/layout/Footer.tsx';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  try {
    const stored = window.localStorage.getItem('one-blog-theme');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
  } catch {
    // ignore
  }

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

interface AppLayoutProps {
  children: ReactNode;
}

function AppLayout({ children }: AppLayoutProps) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.dataset.theme = theme;

    try {
      window.localStorage.setItem('one-blog-theme', theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const { pathname } = useLocation();
  const isAuthRoute = ['/login', '/register'].includes(pathname);

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col transition-colors duration-300 ease-out">
      {!isAuthRoute && <Header theme={theme} onToggleTheme={handleToggleTheme} />}

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
