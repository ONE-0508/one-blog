import { Link } from 'react-router';

function NotFoundPage() {
  return (
    <div className="mx-auto w-full max-w-xl rounded-[var(--radius-lg)] border border-border-subtle bg-bg-elevated p-8 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">404</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">页面不存在</h1>
      <p className="mt-3 text-sm text-text-secondary">你访问的页面可能已被移动或删除。</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to="/"
          className="inline-flex items-center justify-center rounded-full bg-accent-primary px-4 py-2 text-sm font-semibold text-black shadow-subtle hover:brightness-105"
        >
          返回首页
        </Link>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-bg-elevated-soft px-4 py-2 text-sm text-text-secondary hover:border-accent-primary/60 hover:text-text-primary"
          onClick={() => window.history.back()}
        >
          返回上一页
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
