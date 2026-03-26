import { Link, useLocation, useNavigate } from 'react-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';

import { useAuth } from '../../contexts/useAuth';
import { normalizeHexColor, type ThemeMode } from '../../utils/theme';

const MotionButton = motion.button;

interface HeaderProps {
  mode: ThemeMode;
  themeColor: string;
  followSystem: boolean;
  onSetThemeMode: (mode: ThemeMode) => void;
  onSetFollowSystem: (followSystem: boolean) => void;
  onSetThemeColor: (themeColor: string) => void;
}

const navItems = [
  { to: '/', label: '首页' },
  { to: '/notes', label: '笔记' },
  { to: '/works', label: '作品' },
  { to: '/archive', label: '全部文章' },
  { to: '/about', label: '关于' },
  { to: '/guestbook', label: '留言板' },
];

function Header({
  mode,
  themeColor,
  followSystem,
  onSetThemeMode,
  onSetFollowSystem,
  onSetThemeColor,
}: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);
  const [customColorInput, setCustomColorInput] = useState(themeColor);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const themePanelRef = useRef<HTMLDivElement | null>(null);
  const activePath = useMemo(() => location.pathname, [location.pathname]);

  const handleLogout = () => {
    logout()
      .then(() => {
        void navigate('/login', { replace: true });
      })
      .catch(() => {
        void navigate('/login', { replace: true });
      });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }

      if (themePanelRef.current && !themePanelRef.current.contains(target)) {
        setIsThemePanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-elevated/80 backdrop-blur transition-colors duration-300 ease-out">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-linear-to-br from-accent-primary to-accent-underline-to shadow-subtle" />
          <div className="flex flex-col leading-tight">
            <span className="font-semibold tracking-wide">ONE Blog</span>
            <span className="text-xs text-text-muted">记录 · 思考 · 构建</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-text-secondary md:flex">
          {navItems.map(item => {
            const isActive = activePath === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded-full px-3 py-1.5 text-xs transition-colors md:text-sm ${
                  isActive ? 'bg-accent-primary text-accent-contrast' : 'hover:text-text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="relative" ref={themePanelRef}>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle bg-bg-elevated-soft text-sm text-text-secondary hover:border-accent-primary/60 hover:text-text-primary"
              aria-label="主题设置"
              onClick={() => {
                setIsThemePanelOpen(prev => !prev);
                setCustomColorInput(themeColor);
              }}
            >
              🎨
            </button>

            {isThemePanelOpen && (
              <div className="absolute right-0 z-[60] mt-2 w-72 rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-soft">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold tracking-wide text-text-muted">主题控制</p>
                    <span
                      className="h-4 w-4 rounded-full border border-border-subtle"
                      style={{ backgroundColor: themeColor }}
                    />
                  </div>

                  <div className="flex space-x-2 rounded-full border border-border-subtle bg-bg-elevated-soft p-1">
                    <button
                      type="button"
                      disabled={followSystem}
                      onClick={() => onSetThemeMode('light')}
                      className={`flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        mode === 'light' && !followSystem
                          ? 'bg-accent-primary text-accent-contrast'
                          : 'text-text-secondary hover:text-text-primary'
                      } ${followSystem ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      浅色
                    </button>
                    <button
                      type="button"
                      disabled={followSystem}
                      onClick={() => onSetThemeMode('dark')}
                      className={`flex-1 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        mode === 'dark' && !followSystem
                          ? 'bg-accent-primary text-accent-contrast'
                          : 'text-text-secondary hover:text-text-primary'
                      } ${followSystem ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      深色
                    </button>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-text-secondary">
                    <input
                      type="checkbox"
                      checked={followSystem}
                      onChange={event => onSetFollowSystem(event.target.checked)}
                    />
                    跟随系统明暗模式
                  </label>

                  <div className="space-y-2">
                    <label className="block text-xs text-text-muted">主题主色（任意色值）</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={themeColor}
                        onChange={event => {
                          const value = normalizeHexColor(event.target.value);
                          onSetThemeColor(value);
                          setCustomColorInput(value);
                        }}
                        className="h-8 w-10 cursor-pointer rounded border border-border-subtle bg-bg-elevated-soft"
                      />
                      <input
                        value={customColorInput}
                        onChange={event => setCustomColorInput(event.target.value)}
                        onBlur={() => {
                          const value = normalizeHexColor(customColorInput);
                          onSetThemeColor(value);
                          setCustomColorInput(value);
                        }}
                        placeholder="#3B82F6"
                        className="w-full rounded-md border border-border-subtle bg-bg-elevated-soft px-2 py-1 text-xs text-text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={userMenuRef}>
            <MotionButton
              type="button"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary"
              onClick={() => setIsMenuOpen(prev => !prev)}
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-[11px] font-semibold text-accent-contrast">
                {(user?.displayName || user?.username || 'U').charAt(0).toUpperCase()}
              </span>
              <span className="hidden sm:inline">
                {user?.displayName || user?.username || '用户'}
              </span>
            </MotionButton>

            {isMenuOpen && (
              <div className="absolute right-0 z-[60] mt-2 w-56 rounded-xl border border-border-subtle bg-bg-elevated p-4 shadow-soft">
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
        </div>
      </div>
    </header>
  );
}

export default Header;
