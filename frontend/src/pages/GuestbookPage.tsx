function GuestbookPage() {
  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">GUESTBOOK</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">留言板</h1>
      <p className="max-w-2xl text-sm text-text-secondary md:text-base">
        欢迎留下交流、建议或合作邀约。留言板的交互与消息存储模块正在开发中。
      </p>
      <div className="rounded-xl border border-divider-subtle bg-bg-elevated-soft px-4 py-3 text-sm text-text-muted">
        💬 留言功能施工中
      </div>
    </section>
  );
}

export default GuestbookPage;
