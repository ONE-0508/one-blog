import { Link, useNavigate } from 'react-router';
import { useState } from 'react';

import { useAuth } from '../../contexts/useAuth';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function Header({ theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout()
      .then(() => {
        void navigate('/login', { replace: true });
      })
      .catch(() => {
        void navigate('/login', { replace: true });
      });
  };

  return (
    <header className="border-b border-border-subtle bg-bg-elevated/80 backdrop-blur md:sticky md:top-0 md:z-20 transition-colors duration-300 ease-out">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-accent-primary to-accent-underline-to shadow-subtle" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-wide">ONE Blog</span>
            <span className="text-xs text-text-muted">记录 · 思考 · 构建</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-text-secondary md:flex">
          <Link to="/" className="hover:text-text-primary">
            首页
          </Link>
          <Link to="/notes" className="hover:text-text-primary">
            笔记
          </Link>
          <Link to="/works" className="hover:text-text-primary">
            作品
          </Link>
          <Link to="/archive" className="hover:text-text-primary">
            归档
          </Link>
          <Link to="/about" className="hover:text-text-primary">
            关于
          </Link>
          <Link to="/guestbook" className="hover:text-text-primary">
            留言板
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs text-text-secondary md:inline-flex"
            disabled
          >
            <span className="i-lucide-search h-3.5 w-3.5" aria-hidden="true" />
            <span>暂未开放</span>
          </button>

          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary"
              onClick={() => setIsMenuOpen(prev => !prev)}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-black text-[11px] font-semibold">
                {(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">
                {user?.displayName || user?.username || '用户'}
              </span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-soft">
                <div className="space-y-1">
                  <p className="text-xs text-text-muted">当前用户</p>
                  <p className="text-sm font-semibold text-text-primary">
                    {user?.displayName || user?.username || '用户'}
                  </p>
                  <p className="text-xs text-text-secondary">{user?.email || '暂未开放'}</p>
                </div>
                <div className="my-3 h-px bg-divider-subtle" />
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-lg border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent-primary/60 hover:text-text-primary"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated-soft text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary"
            aria-label={isDark ? '切换为浅色主题' : '切换为深色主题'}
            onClick={onToggleTheme}
          >
            <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
