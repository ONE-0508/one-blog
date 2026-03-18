export interface ArticleAuthor {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author?: ArticleAuthor;
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
