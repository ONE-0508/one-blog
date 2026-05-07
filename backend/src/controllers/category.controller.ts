import type { Request, Response, NextFunction } from 'express';
import { categoryService } from '@/services/category.service';
import { BadRequestError } from '@/utils/AppError';
import { CategoryStatus } from '@/models/category.model';

export class CategoryController {
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = this.parseStatus(req.query.status);
      const categories = await categoryService.getCategoryList(status);

      res.status(200).json({
        success: true,
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getPublicCategoryList();

      res.status(200).json({
        success: true,
        data: {
          categories,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryOptions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await categoryService.getPublicCategoryList();
      const options = categories.map(category => ({
        id: category.id,
        name: category.name,
      }));

      res.status(200).json({
        success: true,
        data: {
          categories: options,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Category id is required');
      }

      const category = await categoryService.getCategoryById(id);

      res.status(200).json({
        success: true,
        data: {
          category,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = await categoryService.createCategory(req.body);

      res.status(201).json({
        success: true,
        data: {
          category,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Category id is required');
      }

      const category = await categoryService.updateCategory(id, req.body);

      res.status(200).json({
        success: true,
        data: {
          category,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Category id is required');
      }

      await categoryService.deleteCategory(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Category deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategoryArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug || Array.isArray(slug)) {
        throw new BadRequestError('Category slug is required');
      }

      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);

      if (Number.isNaN(page) || page < 1) {
        throw new BadRequestError('Invalid page number');
      }
      if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new BadRequestError('Invalid page size');
      }

      const result = await categoryService.getArticlesBySlug(slug, page, pageSize);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private parseStatus(status: unknown): CategoryStatus | undefined {
    if (status === undefined) {
      return undefined;
    }

    if (status === CategoryStatus.ACTIVE || status === CategoryStatus.INACTIVE) {
      return status;
    }

    throw new BadRequestError('Category status is invalid');
  }
}

export const categoryController = new CategoryController();
