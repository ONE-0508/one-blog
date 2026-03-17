import type { ApiResponse } from "../types/api";
import type { Article, ArticleListPayload } from "../types/article";
import { httpClient } from "./httpClient";

export const fetchArticles = async (
  page: number,
  pageSize: number,
): Promise<ApiResponse<ArticleListPayload>> => {
  const response = await httpClient.get<ApiResponse<ArticleListPayload>>(
    "/articles",
    {
      params: { page, pageSize },
    },
  );
  return response.data;
};

export const fetchArticleById = async (
  id: string,
): Promise<ApiResponse<{ article: Article }>> => {
  const response = await httpClient.get<ApiResponse<{ article: Article }>>(
    `/articles/${id}`,
  );
  return response.data;
};

export const createArticle = async (payload: {
  title: string;
  content: string;
  tags: string[];
}): Promise<ApiResponse<{ article: Article }>> => {
  const response = await httpClient.post<ApiResponse<{ article: Article }>>(
    "/articles",
    payload,
  );
  return response.data;
};

export const updateArticle = async (
  id: string,
  payload: { title?: string; content?: string; tags?: string[] },
): Promise<ApiResponse<{ article: Article }>> => {
  const response = await httpClient.put<ApiResponse<{ article: Article }>>(
    `/articles/${id}`,
    payload,
  );
  return response.data;
};

export const deleteArticle = async (
  id: string,
): Promise<ApiResponse<{ message: string }>> => {
  const response = await httpClient.delete<ApiResponse<{ message: string }>>(
    `/articles/${id}`,
  );
  return response.data;
};
