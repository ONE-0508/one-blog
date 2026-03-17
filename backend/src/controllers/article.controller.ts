import type { Request, Response, NextFunction } from 'express';
import { articleService } from '@/services/article.service';
import { BadRequestError } from '@/utils/AppError';

export class ArticleController {
  async getArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);

      if (Number.isNaN(page) || page < 1) {
        throw new BadRequestError('Invalid page number');
      }
      if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new BadRequestError('Invalid page size');
      }

      const result = await articleService.getArticleList(page, pageSize);

      res.status(200).json({
        success: true,
        data: {
          data: result.data,
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getArticleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Article id is required');
      }

      const article = await articleService.getArticleById(id);

      res.status(200).json({
        success: true,
        data: {
          article,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, content, tags } = req.body as {
        title?: string;
        content?: string;
        tags?: string[];
      };

      if (!Array.isArray(tags)) {
        throw new BadRequestError('Tags must be an array');
      }

      const authorId = req.user?.id;
      if (!authorId) {
        throw new BadRequestError('Author is required');
      }

      const article = await articleService.createArticle({
        title: title ?? '',
        content: content ?? '',
        tags,
        authorId,
      });

      res.status(201).json({
        success: true,
        data: {
          article,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Article id is required');
      }

      const { title, content, tags } = req.body as {
        title?: string;
        content?: string;
        tags?: string[];
      };

      if (tags !== undefined && !Array.isArray(tags)) {
        throw new BadRequestError('Tags must be an array');
      }

      if (title === undefined && content === undefined && tags === undefined) {
        throw new BadRequestError('No fields to update');
      }

      const article = await articleService.updateArticle(id, {
        title,
        content,
        tags,
      });

      res.status(200).json({
        success: true,
        data: {
          article,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Article id is required');
      }

      await articleService.deleteArticle(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Article deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const articleController = new ArticleController();
