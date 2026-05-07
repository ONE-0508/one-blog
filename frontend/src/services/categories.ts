import type { ApiResponse } from '../types/auth';
import type { Category, CategoryArticleListPayload } from '../types/category';
import { httpClient } from './httpClient';

export async function fetchPublicCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
  const response =
    await httpClient.get<ApiResponse<{ categories: Category[] }>>('/categories/public');

  return response.data;
}

export async function fetchCategoryArticles(
  slug: string,
  page: number,
  pageSize: number
): Promise<ApiResponse<CategoryArticleListPayload>> {
  const response = await httpClient.get<ApiResponse<CategoryArticleListPayload>>(
    `/categories/${slug}/articles`,
    {
      params: {
        page,
        pageSize,
      },
    }
  );

  return response.data;
}
