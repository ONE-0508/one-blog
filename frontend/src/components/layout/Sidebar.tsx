import { useAuth } from '../../contexts/useAuth';

function Sidebar() {
  const { user } = useAuth();

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
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          热门文章
        </h2>
        <div className="mt-3 rounded-xl border border-divider-subtle bg-bg-elevated-soft px-3 py-2 text-xs text-text-muted">
          暂未开放
        </div>
      </div>

      <div className="h-px bg-divider-subtle" />

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          快速入口
        </h2>
        <div className="mt-3 rounded-xl border border-divider-subtle bg-bg-elevated-soft px-3 py-2 text-xs text-text-muted">
          暂未开放
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
