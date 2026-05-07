import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchPublicCategories } from '../services/categories';
import type { Category } from '../types/category';

function getArticleCount(category: Category): number {
  const count = Number(category.articleCount ?? 0);
  return Number.isNaN(count) ? 0 : count;
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetchPublicCategories();
        if (response.success) {
          if (!isMounted) return;
          setCategories(response.data.categories);
        } else {
          if (!isMounted) return;
          setErrorMessage(response.error?.message ?? '分类加载失败');
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : '分类加载失败');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
          CATEGORIES
        </p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">分类</h1>
        <p className="max-w-2xl text-sm text-text-secondary md:text-base">
          按主题整理文章，快速进入你感兴趣的内容集合。
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          正在加载分类...
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          {errorMessage}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          暂无分类
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 transition hover:border-accent-primary/50"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-text-primary">{category.name}</h2>
                <span className="rounded-full border border-chip-border bg-chip-bg px-2 py-0.5 text-xs text-text-secondary">
                  {getArticleCount(category)} 篇
                </span>
              </div>
              {category.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
                  {category.description}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default CategoriesPage;
