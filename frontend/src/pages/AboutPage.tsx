function AboutPage() {
  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">ABOUT</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">关于我</h1>
      <p className="max-w-2xl text-sm text-text-secondary md:text-base">
        记录构建者的长期计划、方法论与成长路径。后续会补充完整的个人简介与技术履历。
      </p>
      <div className="rounded-xl border border-divider-subtle bg-bg-elevated-soft px-4 py-3 text-sm text-text-muted">
        🌿 故事仍在书写中
      </div>
    </section>
  );
}

export default AboutPage;
