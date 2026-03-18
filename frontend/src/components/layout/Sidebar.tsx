import { useAuth } from '../../contexts/useAuth';

function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="space-y-4 rounded-2xl border border-border-subtle bg-bg-elevated-soft/80 p-4 shadow-subtle md:space-y-5 md:p-5 transition-colors duration-300 ease-out">
      {/* 用户信息区域 */}
      {user && (
        <div className="rounded-xl border border-border-subtle bg-bg-elevated-soft p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            当前登录
          </p>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-text-primary">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent-primary text-[11px] font-semibold text-accent-contrast">
                {(user.displayName || user.username).charAt(0).toUpperCase()}
              </span>
              <span className="font-semibold">{user.displayName || user.username}</span>
            </div>
            <span className="inline-flex items-center rounded-full border border-border-subtle bg-chip-bg px-2 py-0.5 text-xs text-text-secondary">
              {user.role === 'admin' ? '管理员' : user.role === 'editor' ? '编辑' : '用户'}
            </span>
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
