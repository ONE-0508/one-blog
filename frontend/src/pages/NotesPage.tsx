function NotesPage() {
  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">NOTES</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">笔记时间线</h1>
      <p className="max-w-2xl text-sm text-text-secondary md:text-base">
        这里将记录短篇灵感、碎片化观察与正在发酵的想法。首页先完成文章管理， 笔记时间线马上安排。
      </p>
      <div className="rounded-xl border border-divider-subtle bg-bg-elevated-soft px-4 py-3 text-sm text-text-muted">
        🚧 页面建设中 · 欢迎先逛逛首页的最新文章
      </div>
    </section>
  );
}

export default NotesPage;
