import type { Request, Response, NextFunction } from 'express';
import { tagService } from '@/services/tag.service';
import { BadRequestError } from '@/utils/AppError';
import { TagStatus } from '@/models/tag.model';

export class TagController {
  async getTags(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const status = this.parseStatus(req.query.status);
      const tags = await tagService.getTagList(status);

      res.status(200).json({
        success: true,
        data: {
          tags,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getPublicTags(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await tagService.getPublicTagList();

      res.status(200).json({
        success: true,
        data: {
          tags,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTagOptions(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tags = await tagService.getTagOptions();
      const options = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
        status: tag.status,
      }));

      res.status(200).json({
        success: true,
        data: {
          tags: options,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTagById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Tag id is required');
      }

      const tag = await tagService.getTagById(id);

      res.status(200).json({
        success: true,
        data: {
          tag,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async createTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tag = await tagService.createTag(req.body);

      res.status(201).json({
        success: true,
        data: {
          tag,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Tag id is required');
      }

      const tag = await tagService.updateTag(id, req.body);

      res.status(200).json({
        success: true,
        data: {
          tag,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteTag(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!id || Array.isArray(id)) {
        throw new BadRequestError('Tag id is required');
      }

      await tagService.deleteTag(id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Tag deleted successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getTagArticles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      if (!slug || Array.isArray(slug)) {
        throw new BadRequestError('Tag slug is required');
      }

      const page = Number(req.query.page ?? 1);
      const pageSize = Number(req.query.pageSize ?? 10);

      if (Number.isNaN(page) || page < 1) {
        throw new BadRequestError('Invalid page number');
      }
      if (Number.isNaN(pageSize) || pageSize < 1 || pageSize > 100) {
        throw new BadRequestError('Invalid page size');
      }

      const result = await tagService.getArticlesBySlug(slug, page, pageSize);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  private parseStatus(status: unknown): TagStatus | undefined {
    if (status === undefined) {
      return undefined;
    }

    if (status === TagStatus.ACTIVE || status === TagStatus.INACTIVE) {
      return status;
    }

    throw new BadRequestError('Tag status is invalid');
  }
}

export const tagController = new TagController();
