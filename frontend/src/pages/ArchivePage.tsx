import { useEffect, useState } from 'react';
import ArticleList from '../features/posts/components/ArticleList';
import ArticlePagination from '../features/posts/components/ArticlePagination';
import { fetchArticles } from '../services/articles';
import type { Article } from '../types/article';

function ArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadArticles = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetchArticles(page, pageSize);
        if (response.success) {
          if (!isMounted) return;
          setArticles(response.data.data);
          setTotal(response.data.total);
        } else {
          if (!isMounted) return;
          setErrorMessage(response.error?.message ?? '文章加载失败');
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : '文章加载失败');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadArticles();

    return () => {
      isMounted = false;
    };
  }, [page, pageSize]);

  return (
    <section className="space-y-4 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">ARCHIVE</p>
      <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">全部文章</h1>
      <p className="max-w-2xl text-sm text-text-secondary md:text-base">
        展示全部已发布文章，支持分页浏览。
      </p>

      {isLoading ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          正在加载文章...
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          {errorMessage}
        </div>
      ) : (
        <ArticleList articles={articles} />
      )}

      {!isLoading && !errorMessage && (
        <ArticlePagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      )}
    </section>
  );
}

export default ArchivePage;
