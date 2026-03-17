import { articleRepository } from '@/repositories/article.repository';
import { BadRequestError, NotFoundError } from '@/utils/AppError';
import type { Article } from '@/models/article.model';

export interface CreateArticleInput {
  title: string;
  content: string;
  tags: string[];
  authorId: string;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  tags?: string[];
}

export interface ArticleListResponse {
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
}

class ArticleService {
  async createArticle(input: CreateArticleInput): Promise<Article> {
    this.validateTitle(input.title);
    this.validateContent(input.content);

    return articleRepository.create({
      title: input.title,
      content: input.content,
      tags: input.tags,
      authorId: input.authorId,
    });
  }

  async updateArticle(id: string, input: UpdateArticleInput): Promise<Article> {
    if (!id) {
      throw new BadRequestError('Article id is required');
    }

    if (input.title !== undefined) {
      this.validateTitle(input.title);
    }

    if (input.content !== undefined) {
      this.validateContent(input.content);
    }

    const updated = await articleRepository.updateById(id, input as Partial<Article>);

    if (!updated) {
      throw new NotFoundError('Article not found');
    }

    return updated;
  }

  async deleteArticle(id: string): Promise<void> {
    const deleted = await articleRepository.softDelete(id, new Date());
    if (!deleted) {
      throw new NotFoundError('Article not found');
    }
  }

  async getArticleList(page: number, pageSize: number): Promise<ArticleListResponse> {
    const { rows, count } = await articleRepository.findAndCount({ page, pageSize });

    return {
      data: rows,
      total: count,
      page,
      pageSize,
    };
  }

  async getArticleById(id: string): Promise<Article> {
    const article = await articleRepository.findById(id, {
      includeAuthor: true,
    });

    if (!article) {
      throw new NotFoundError('Article not found');
    }

    await articleRepository.incrementViewCount(id);

    const refreshed = await articleRepository.findById(id, {
      includeAuthor: true,
    });

    if (!refreshed) {
      throw new NotFoundError('Article not found');
    }

    return refreshed;
  }

  private validateTitle(title: string): void {
    if (!title || title.trim().length === 0) {
      throw new BadRequestError('Title is required');
    }
    if (title.trim().length > 200) {
      throw new BadRequestError('Title must be 200 characters or less');
    }
  }

  private validateContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new BadRequestError('Content is required');
    }
  }
}

export const articleService = new ArticleService();
