export interface ArticleAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  sort?: number;
  status?: 'active' | 'inactive';
}

export interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author?: ArticleAuthor;
  category?: ArticleCategory | null;
  categoryId?: string | null;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  viewCount: number;
}

export interface ArticleListPayload {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
}
