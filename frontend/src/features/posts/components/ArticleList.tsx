import type { Article } from '../../../types/article';
import ArticleCard from './ArticleCard';

interface ArticleListProps {
  articles: Article[];
}

function ArticleList({ articles }: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="rounded-lg border border-border-subtle bg-bg-elevated-soft p-4 text-sm text-text-secondary">
        暂无文章
      </div>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {articles.map(article => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}

export default ArticleList;
