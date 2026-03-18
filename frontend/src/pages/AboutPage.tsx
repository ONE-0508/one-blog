function AboutPage() {
  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">ABOUT</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">关于我</h1>
      <p className="max-w-2xl text-sm text-text-secondary md:text-base">该功能暂未开放。</p>
      <div className="rounded-xl border border-divider-subtle bg-bg-elevated-soft px-4 py-3 text-sm text-text-muted">
        暂未开放
      </div>
    </section>
  );
}

export default AboutPage;
