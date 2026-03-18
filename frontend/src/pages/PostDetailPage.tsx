import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import MainContent from '../components/layout/MainContent';
import Sidebar from '../components/layout/Sidebar';
import { fetchArticleById } from '../api/articles';
import type { Article } from '../types/article';
import { formatDate } from '../utils/formatDate';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

function PostDetailPage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadArticle = async () => {
      if (!id) {
        setErrorMessage('文章不存在');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetchArticleById(id);
        if (response.success) {
          if (!isMounted) return;
          setArticle(response.data.article);
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

    void loadArticle();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const authorName = article?.author?.displayName ?? article?.author?.username ?? '匿名作者';

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)] md:items-start">
      <MainContent>
        {isLoading ? (
          <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
            正在加载文章...
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
            {errorMessage}
          </div>
        ) : article ? (
          <article className="space-y-6">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
                ARTICLE
              </p>
              <h1 className="text-2xl font-semibold leading-tight tracking-tight md:text-3xl">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span>{authorName}</span>
                <span>·</span>
                <span>{formatDate(article.createdAt)}</span>
                <span>·</span>
                <span>阅读 {article.viewCount}</span>
              </div>
            </header>

            <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mt-8 mb-4 text-3xl font-semibold leading-tight text-text-primary">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-7 mb-3 text-2xl font-semibold leading-tight text-text-primary">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-6 mb-3 text-xl font-semibold leading-snug text-text-primary">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="my-3 leading-7 text-text-secondary">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-7 text-text-secondary">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-4 border-l-4 border-accent-primary/70 bg-bg-elevated-soft px-4 py-2 text-text-secondary">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="underline decoration-accent-primary/70 underline-offset-4 hover:text-text-primary"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="my-4 overflow-x-auto">
                      <table className="min-w-full border-collapse border border-border-subtle text-sm">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border-subtle bg-bg-elevated px-3 py-2 text-left text-text-primary">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border-subtle px-3 py-2 text-text-secondary">
                      {children}
                    </td>
                  ),
                  hr: () => <hr className="my-6 border-divider-subtle" />,
                  code: ({ className, children, ...props }) => {
                    const isBlockCode = Boolean(className?.includes('language-'));

                    if (isBlockCode) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <code
                        className="rounded bg-bg-elevated px-1 py-0.5 text-xs text-text-primary"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => (
                    <pre className="my-4 overflow-x-auto rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-xs text-text-secondary">
                      {children}
                    </pre>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>

            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full border border-chip-border bg-chip-bg px-2 py-0.5 text-xs text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </article>
        ) : null}
      </MainContent>

      <div className="space-y-4 md:space-y-5">
        <Sidebar />
      </div>
    </div>
  );
}

export default PostDetailPage;
