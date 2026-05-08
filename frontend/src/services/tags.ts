import type { ApiResponse } from '../types/auth';
import type { Tag, TagArticleListPayload } from '../types/tag';
import { httpClient } from './httpClient';

export async function fetchPublicTags(): Promise<ApiResponse<{ tags: Tag[] }>> {
  const response = await httpClient.get<ApiResponse<{ tags: Tag[] }>>('/tags/public');

  return response.data;
}

export async function fetchTagArticles(
  slug: string,
  page: number,
  pageSize: number
): Promise<ApiResponse<TagArticleListPayload>> {
  const response = await httpClient.get<ApiResponse<TagArticleListPayload>>(
    `/tags/${slug}/articles`,
    {
      params: {
        page,
        pageSize,
      },
    }
  );

  return response.data;
}
