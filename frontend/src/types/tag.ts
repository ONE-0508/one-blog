import type { ArticleListPayload } from './article';

export type TagStatus = 'active' | 'inactive';

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  status: TagStatus;
  articleCount?: number | string;
  createdAt: string;
  updatedAt: string;
}

export interface TagArticleListPayload extends ArticleListPayload {
  tag: Tag;
}
