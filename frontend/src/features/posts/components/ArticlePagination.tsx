interface ArticlePaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

function ArticlePagination({ page, pageSize, total, onPageChange }: ArticlePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-text-secondary">
      <span>
        第 {page} / {totalPages} 页
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-full border border-border-subtle px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </button>
        <button
          type="button"
          className="rounded-full border border-border-subtle px-3 py-1 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
}

export default ArticlePagination;
