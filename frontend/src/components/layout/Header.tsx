import { Link } from 'react-router';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

function Header({ theme, onToggleTheme }: HeaderProps) {
  const isDark = theme === 'dark';

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
          <button type="button" className="hover:text-text-primary">
            首页
          </button>
          <button type="button" className="hover:text-text-primary">
            笔记
          </button>
          <button type="button" className="hover:text-text-primary">
            作品
          </button>
          <button type="button" className="hover:text-text-primary">
            归档
          </button>
          <button type="button" className="hover:text-text-primary">
            关于
          </button>
          <button type="button" className="hover:text-text-primary">
            留言板
          </button>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="hidden items-center justify-center rounded-full border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary md:inline-flex"
          >
            登录
          </Link>
          <button
            type="button"
            className="hidden items-center gap-1 rounded-full border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary md:inline-flex"
          >
            <span className="i-lucide-search h-3.5 w-3.5" aria-hidden="true" />
            <span>搜索</span>
          </button>

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
