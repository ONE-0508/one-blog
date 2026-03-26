import type { ApiResponse } from '../types/auth';
import type { Article, ArticleListPayload } from '../types/article';
import { httpClient } from './httpClient';

export async function fetchArticles(
  page: number,
  pageSize: number
): Promise<ApiResponse<ArticleListPayload>> {
  const response = await httpClient.get<ApiResponse<ArticleListPayload>>('/articles', {
    params: {
      page,
      pageSize,
    },
  });

  return response.data;
}

export async function fetchArticleById(id: string): Promise<ApiResponse<{ article: Article }>> {
  const response = await httpClient.get<ApiResponse<{ article: Article }>>(`/articles/${id}`);

  return response.data;
}
