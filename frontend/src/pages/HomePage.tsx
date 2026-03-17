import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import MainContent from '../components/layout/MainContent';
import Sidebar from '../components/layout/Sidebar';
import { fetchArticles } from '../api/articles';
import type { Article } from '../types/article';
import ArticleList from '../features/posts/components/ArticleList';
import ArticlePagination from '../features/posts/components/ArticlePagination';

const MotionLink = motion(Link);

function HomePage() {
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)] lg:items-start">
      <MainContent>
        <section className="space-y-6">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border-subtle bg-bg-elevated-soft/70 p-6">
            <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-accent-primary/30 blur-3xl animate-float-slow" />
            <div className="pointer-events-none absolute -bottom-16 left-12 h-40 w-40 rounded-full bg-accent-underline-to/20 blur-3xl animate-float-slower" />
            <div className="space-y-3 relative">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-text-muted">
                ONE BLOG · LONGFORM NOTES
              </p>
              <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                记录构建者的思考路径，
                <br className="hidden sm:block" />
                用文章搭建长期记忆。
              </h1>
              <p className="max-w-2xl text-sm text-text-secondary md:text-base">
                这里聚合前端工程、产品思考与个人成长的长期笔记。主页会持续更新最新文章、
                精选专题与正在进行的项目进度。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <MotionLink
              to="#latest-posts"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-full bg-accent-primary px-5 py-2 text-xs font-semibold text-black shadow-subtle hover:brightness-105 md:text-sm"
            >
              浏览最新文章
            </MotionLink>
            <MotionLink
              to="/works"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center rounded-full border border-border-subtle bg-bg-elevated-soft px-5 py-2 text-xs text-text-secondary hover:border-accent-primary/60 hover:text-text-primary md:text-sm"
            >
              查看作品与项目
            </MotionLink>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated-soft/80 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">文章总览</p>
              <p className="mt-2 text-lg font-semibold text-text-primary">
                {total ? `${total} 篇` : '暂无数据'}
              </p>
              <p className="mt-1 text-xs text-text-secondary">本周同步更新</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated-soft/80 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">专题计划</p>
              <p className="mt-2 text-sm text-text-muted">暂未开放</p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-bg-elevated-soft/80 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-text-muted">正在进行</p>
              <p className="mt-2 text-sm text-text-muted">暂未开放</p>
            </div>
          </div>
        </section>

        <div className="h-px bg-divider-subtle" />

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wide md:text-base">正在进行</h2>
            <span className="text-xs text-text-muted">本期重点</span>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-bg-elevated-soft/70 p-4 text-sm text-text-muted">
            暂未开放
          </div>
        </section>

        <div className="h-px bg-divider-subtle" />

        <section id="latest-posts" className="space-y-4 scroll-mt-20">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-wide md:text-base">最新文章</h2>
            <span className="text-xs text-text-muted">共 {total} 篇</span>
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
            <ArticlePagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          )}
        </section>
      </MainContent>

      <div className="space-y-4 md:space-y-5">
        <Sidebar />
      </div>
    </div>
  );
}

export default HomePage;
