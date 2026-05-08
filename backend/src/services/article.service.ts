import { articleRepository } from '@/repositories/article.repository';
import { categoryService } from '@/services/category.service';
import { tagService } from '@/services/tag.service';
import { BadRequestError, NotFoundError } from '@/utils/AppError';
import type { Article } from '@/models/article.model';

export interface CreateArticleInput {
  title: string;
  content: string;
  tags: string[];
  tagIds?: string[];
  authorId: string;
  categoryId?: string | null;
}

export interface UpdateArticleInput {
  title?: string;
  content?: string;
  tags?: string[];
  tagIds?: string[];
  categoryId?: string | null;
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
    const categoryId = await this.resolveCategoryId(input.categoryId);
    const tags = await tagService.ensureActiveTags(input.tagIds ?? []);
    const tagNames = this.resolveLegacyTagNames(input.tags, tags);

    const article = await articleRepository.create({
      title: input.title,
      content: input.content,
      tags: tagNames,
      authorId: input.authorId,
      categoryId,
    });

    await articleRepository.setArticleTags(
      article.id,
      tags.map(tag => tag.id)
    );

    const created = await articleRepository.findById(article.id, {
      includeAuthor: true,
    });

    return created ?? article;
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

    const { tagIds: _tagIds, ...articleInput } = input;
    void _tagIds;
    const payload: Partial<Article> = { ...articleInput } as Partial<Article>;
    if (input.categoryId !== undefined) {
      payload.categoryId = await this.resolveCategoryId(input.categoryId);
    }
    if (input.tagIds !== undefined) {
      const tags = await tagService.ensureActiveTags(input.tagIds);
      payload.tags = this.resolveLegacyTagNames(input.tags, tags);
    }

    const existing = await articleRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Article not found');
    }

    let updated = existing;
    if (Object.keys(payload).length > 0) {
      const updatedArticle = await articleRepository.updateById(id, payload);
      if (!updatedArticle) {
        throw new NotFoundError('Article not found');
      }
      updated = updatedArticle;
    }

    if (input.tagIds !== undefined) {
      const tagIds = tagService.normalizeTagIds(input.tagIds);
      await articleRepository.setArticleTags(id, tagIds);
    }

    const refreshed = await articleRepository.findById(id, {
      includeAuthor: true,
    });

    return refreshed ?? updated;
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

  private async resolveCategoryId(categoryId?: string | null): Promise<string> {
    if (!categoryId) {
      const fallback = await categoryService.ensureDefaultCategory();
      return fallback.id;
    }

    const category = await categoryService.ensureActiveCategory(categoryId);
    return category.id;
  }

  private resolveLegacyTagNames(
    inputTags: string[] | undefined,
    tagDetails: { name: string }[]
  ): string[] {
    if (tagDetails.length > 0) {
      return tagDetails.map(tag => tag.name);
    }

    return Array.isArray(inputTags) ? inputTags.map(tag => String(tag).trim()).filter(Boolean) : [];
  }
}

export const articleService = new ArticleService();
