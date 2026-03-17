import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../../contexts/useAuth';

function Sidebar() {
  const { user, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);
    logout()
      .catch((error: Error) => {
        console.error('Logout failed:', error);
      })
      .finally(() => {
        setIsLoggingOut(false);
      });
  };

  return (
    <aside className="space-y-4 rounded-2xl border border-border-subtle bg-bg-elevated-soft/80 p-4 shadow-subtle md:space-y-5 md:p-5 transition-colors duration-300 ease-out">
      {/* 用户信息区域 */}
      {user && (
        <div className="rounded-xl border border-border-subtle bg-bg-elevated/80 p-4">
          <div className="flex items-start space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary text-black">
              <span className="text-sm font-semibold">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-text-primary truncate">
                    {user.displayName || user.username}
                  </h3>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="inline-flex items-center rounded-full border border-border-subtle bg-chip-bg px-2 py-0.5 text-xs font-medium text-text-secondary">
                      {user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑' : '用户'}
                    </span>
                    <span className="text-xs text-text-muted">
                      ID: {user.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="mt-3 w-full rounded-lg border border-border-subtle bg-bg-elevated-soft px-3 py-1.5 text-xs font-medium text-text-secondary hover:border-accent-primary/60 hover:text-text-primary disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <span className="flex items-center justify-center">
                    <svg className="mr-1.5 h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    登出中...
                  </span>
                ) : (
                  '退出登录'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          热门文章
        </h2>
        <div className="mt-3 space-y-2.5 text-sm">
          <span className="block text-left text-text-secondary">文章1</span>
          <span className="block text-left text-text-secondary">文章2</span>
          <span className="block text-left text-text-secondary">文章3</span>
        </div>
      </div>

      <div className="h-px bg-divider-subtle" />

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          快速入口
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            to="/#latest-posts"
            className="rounded-full border border-chip-border bg-chip-bg px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/70 hover:text-text-primary"
          >
            最新文章
          </Link>
          <Link
            to="/notes"
            className="rounded-full border border-chip-border bg-chip-bg px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/70 hover:text-text-primary"
          >
            笔记时间线
          </Link>
          <Link
            to="/works"
            className="rounded-full border border-chip-border bg-chip-bg px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/70 hover:text-text-primary"
          >
            作品精选
          </Link>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
