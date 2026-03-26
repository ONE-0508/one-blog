import { Button } from '../../../components/ui/button';

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          上一页
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          下一页
        </Button>
      </div>
    </div>
  );
}

export default ArticlePagination;
