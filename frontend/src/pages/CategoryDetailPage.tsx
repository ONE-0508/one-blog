import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import ArticleList from '../features/posts/components/ArticleList';
import ArticlePagination from '../features/posts/components/ArticlePagination';
import { fetchCategoryArticles } from '../services/categories';
import type { Article } from '../types/article';
import type { Category } from '../types/category';

function CategoryDetailPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setPage(1);
  }, [slug]);

  useEffect(() => {
    let isMounted = true;

    const loadArticles = async () => {
      if (!slug) {
        setErrorMessage('分类不存在');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetchCategoryArticles(slug, page, pageSize);
        if (response.success) {
          if (!isMounted) return;
          setCategory(response.data.category);
          setArticles(response.data.data);
          setTotal(response.data.total);
        } else {
          if (!isMounted) return;
          setErrorMessage(response.error?.message ?? '分类文章加载失败');
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : '分类文章加载失败');
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
  }, [slug, page, pageSize]);

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <div className="space-y-2">
        <Link to="/categories" className="text-xs text-text-muted hover:text-text-primary">
          返回分类
        </Link>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">CATEGORY</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          {category?.name ?? '分类文章'}
        </h1>
        {category?.description && (
          <p className="max-w-2xl text-sm text-text-secondary md:text-base">
            {category.description}
          </p>
        )}
      </div>

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

export default CategoryDetailPage;
