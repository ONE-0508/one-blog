import MainContent from '../components/layout/MainContent';
import Sidebar from '../components/layout/Sidebar';

function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)] md:items-start">
      <MainContent>
        <section className="space-y-4 md:space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
              PERSONAL BLOG · DIGITAL GARDEN
            </p>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
              记录构建者的一切思考，
              <br className="hidden sm:block" />
              从一篇博客开始。
            </h1>
            <p className="max-w-xl text-sm text-text-secondary md:text-base">
              这里是我的长期线上笔记本，围绕前端工程、产品思考与个人成长持续更新。
              首页聚合了最新文章、精选内容与正在进行的项目。
            </p>
          </div>

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full bg-accent-primary px-4 py-1.5 text-xs font-medium text-black shadow-subtle hover:brightness-105 md:px-5 md:py-2 md:text-sm"
            >
              浏览最新文章
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-bg-elevated-soft px-4 py-1.5 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary md:px-5 md:py-2 md:text-sm"
            >
              查看作品与项目
            </button>
          </div>
        </section>

        <div className="h-px bg-divider-subtle" />

        <section className="space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide md:text-base">最新文章</h2>
            <button type="button" className="text-xs text-text-muted hover:text-text-primary">
              查看全部
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">文章区域...</div>
        </section>
      </MainContent>

      <div className="space-y-4 md:space-y-5">
        <Sidebar />
      </div>
    </div>
  );
}

export default HomePage;
