import MainContent from '../components/layout/MainContent'
import Sidebar from '../components/layout/Sidebar'

function HomePage() {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)] md:items-start">
      <MainContent>
        <section className="space-y-4 md:space-y-5">
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
            <h2 className="text-sm font-semibold tracking-wide md:text-base">
              最新文章
            </h2>
            <button
              type="button"
              className="text-xs text-text-muted hover:text-text-primary"
            >
              查看全部
            </button>
          </div>

          <div className="space-y-3 md:space-y-4">
            {[1, 2, 3].map((item) => (
              <article
                key={item}
                className="group rounded-xl border border-border-subtle bg-bg-elevated-soft/70 p-4 transition-colors hover:border-accent-primary/60 md:p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-2 rounded-full border border-chip-border bg-chip-bg px-2.5 py-1 text-[11px] text-text-muted">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-primary" />
                    <span>文章 · 前端工程</span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    2024-01-0{item}
                  </span>
                </div>
                <h3 className="mt-3 text-sm font-semibold tracking-tight text-text-primary md:text-base">
                  从首页开始：为个人博客设计一套长寿命的信息架构
                </h3>
                <p className="mt-2 line-clamp-2 text-xs text-text-secondary md:text-sm">
                  本文记录了搭建个人博客首页时的思考路径：如何在“最新内容”和“长期沉淀”之间找到平衡，以及怎样通过信息架构引导读者理解你在做的事。
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-chip-border bg-chip-bg px-2.5 py-1 text-[11px] text-text-muted">
                    架构设计
                  </span>
                  <span className="rounded-full border border-chip-border bg-chip-bg px-2.5 py-1 text-[11px] text-text-muted">
                    个人知识库
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </MainContent>

      <div className="space-y-4 md:space-y-5">
        <Sidebar />
      </div>
    </div>
  )
}

export default HomePage

