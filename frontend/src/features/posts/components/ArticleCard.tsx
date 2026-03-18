import { Link } from 'react-router';
import type { Article } from '../../../types/article';
import { formatDate } from '../../../utils/formatDate';

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  const authorName = article.author?.displayName ?? article.author?.username ?? '匿名作者';

  return (
    <article className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 transition hover:border-accent-primary/40">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>{authorName}</span>
        <span>·</span>
        <span>{formatDate(article.createdAt)}</span>
        <span>·</span>
        <span>阅读 {article.viewCount}</span>
      </div>
      <h3 className="mt-2 text-base font-semibold text-text-primary">
        <Link to={`/posts/${article.id}`} className="hover:text-accent-primary">
          {article.title}
        </Link>
      </h3>
      {article.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
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
  );
}

export default ArticleCard;
