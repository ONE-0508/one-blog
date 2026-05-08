import { Link } from 'react-router';
import type { Article } from '../../../types/article';
import { formatDate } from '../../../utils/formatDate';
import { getSoftTagStyle } from '../../../utils/tagColor';

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  const authorName = article.author?.displayName ?? article.author?.username ?? '匿名作者';
  const displayTags = article.tagDetails?.length
    ? article.tagDetails
    : article.tags.map(tag => ({
        id: tag,
        name: tag,
        slug: '',
        color: '',
      }));

  return (
    <article className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 transition hover:border-accent-primary/40">
      <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
        <span>{authorName}</span>
        <span>·</span>
        <span>{formatDate(article.createdAt)}</span>
        <span>·</span>
        <span>阅读 {article.viewCount}</span>
        {article.category && (
          <>
            <span>·</span>
            <Link to={`/category/${article.category.slug}`} className="hover:text-accent-primary">
              {article.category.name}
            </Link>
          </>
        )}
      </div>
      <h3 className="mt-2 text-base font-semibold text-text-primary">
        <Link to={`/posts/${article.id}`} className="hover:text-accent-primary">
          {article.title}
        </Link>
      </h3>
      {displayTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {displayTags.map(tag => (
            <Link
              key={tag.id}
              to={tag.slug ? `/tag/${tag.slug}` : '#'}
              className="inline-flex items-center gap-1.5 rounded-full border border-chip-border bg-chip-bg px-2 py-0.5 text-xs text-text-secondary hover:text-text-primary"
              style={getSoftTagStyle(tag.color)}
            >
              {tag.color && (
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
              )}
              {tag.name}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

export default ArticleCard;
