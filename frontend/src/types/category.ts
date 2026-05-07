import type { ArticleListPayload } from './article';

export type CategoryStatus = 'active' | 'inactive';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort: number;
  status: CategoryStatus;
  articleCount?: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryArticleListPayload extends ArticleListPayload {
  category: Category;
}
