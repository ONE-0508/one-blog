function Sidebar() {
  return (
    <aside className="space-y-4 rounded-2xl border border-border-subtle bg-bg-elevated-soft/80 p-4 shadow-subtle md:space-y-5 md:p-5 transition-colors duration-300 ease-out">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          热门文章
        </h2>
        <div className="mt-3 space-y-2.5 text-sm">
          <button
            type="button"
            className="block text-left text-text-secondary hover:text-text-primary"
          >
            文章1
          </button>
          <button
            type="button"
            className="block text-left text-text-secondary hover:text-text-primary"
          >
            文章2
          </button>
          <button
            type="button"
            className="block text-left text-text-secondary hover:text-text-primary"
          >
            文章3
          </button>
        </div>
      </div>

      <div className="h-px bg-divider-subtle" />

      <div>
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          快速入口
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-full border border-chip-border bg-chip-bg px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/70 hover:text-text-primary"
          >
            最新文章
          </button>
          <button
            type="button"
            className="rounded-full border border-chip-border bg-chip-bg px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/70 hover:text-text-primary"
          >
            笔记时间线
          </button>
          <button
            type="button"
            className="rounded-full border border-chip-border bg-chip-bg px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/70 hover:text-text-primary"
          >
            作品精选
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

