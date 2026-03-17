function ArchivePage() {
  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">ARCHIVE</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">文章归档</h1>
      <p className="max-w-2xl text-sm text-text-secondary md:text-base">
        这里将按年份与主题整理全部文章与版本记录，方便快速回顾历史内容。
      </p>
      <div className="rounded-xl border border-divider-subtle bg-bg-elevated-soft px-4 py-3 text-sm text-text-muted">
        📚 归档视图正在整理中
      </div>
    </section>
  );
}

export default ArchivePage;
