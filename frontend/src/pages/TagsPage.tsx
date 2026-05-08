import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { fetchPublicTags } from '../services/tags';
import type { Tag } from '../types/tag';
import { getSoftTagStyle } from '../utils/tagColor';

function getArticleCount(tag: Tag): number {
  const count = Number(tag.articleCount ?? 0);
  return Number.isNaN(count) ? 0 : count;
}

function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadTags = async () => {
      try {
        setIsLoading(true);
        setErrorMessage('');
        const response = await fetchPublicTags();
        if (response.success) {
          if (!isMounted) return;
          setTags(response.data.tags);
        } else {
          if (!isMounted) return;
          setErrorMessage(response.error?.message ?? '标签加载失败');
        }
      } catch (error) {
        if (!isMounted) return;
        setErrorMessage(error instanceof Error ? error.message : '标签加载失败');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTags();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-border-subtle bg-bg-elevated/80 p-6 shadow-soft md:p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">TAGS</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">标签</h1>
        <p className="max-w-2xl text-sm text-text-secondary md:text-base">
          用更细的关键词串起文章脉络，按兴趣快速进入相关内容。
        </p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          正在加载标签...
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          {errorMessage}
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
          暂无标签
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map(tag => (
            <Link
              key={tag.id}
              to={`/tag/${tag.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-elevated-soft px-4 py-2 text-sm transition hover:border-accent-primary/50"
              style={getSoftTagStyle(tag.color)}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
              <span className="font-medium text-text-primary group-hover:text-accent-primary">
                {tag.name}
              </span>
              <span className="text-xs text-text-muted">{getArticleCount(tag)} 篇</span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default TagsPage;
