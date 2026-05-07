import { Op } from 'sequelize';
import { Article } from '@/models/article.model';
import { Category } from '@/models/category.model';
import type { CategoryStatus } from '@/models/category.model';

export interface CategoryListOptions {
  status?: CategoryStatus;
  includeDeleted?: boolean;
}

class CategoryRepository {
  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    sort: number;
    status: CategoryStatus;
  }): Promise<Category> {
    return Category.create(data);
  }

  async findById(id: string, includeDeleted = false): Promise<Category | null> {
    return Category.findOne({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Category | null> {
    return Category.findOne({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async findBySlugExcludingId(slug: string, id: string): Promise<Category | null> {
    return Category.findOne({
      where: {
        slug,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
    });
  }

  async findAll(options: CategoryListOptions = {}): Promise<Category[]> {
    const { status, includeDeleted = false } = options;

    const categories = await Category.findAll({
      where: {
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...(status ? { status } : {}),
      },
      order: [
        ['sort', 'ASC'],
        ['createdAt', 'DESC'],
      ],
    });

    await Promise.all(
      categories.map(async category => {
        const articleCount = await Article.count({
          where: {
            categoryId: category.id,
            isDeleted: false,
          },
        });
        category.setDataValue('articleCount', articleCount);
      })
    );

    return categories;
  }

  async updateById(id: string, data: Partial<Category>): Promise<Category | null> {
    const [affectedCount, updatedRows] = await Category.update(data, {
      where: {
        id,
        isDeleted: false,
      },
      returning: true,
    });

    if (affectedCount === 0) {
      return null;
    }

    if (Array.isArray(updatedRows) && updatedRows.length > 0) {
      return updatedRows[0] ?? null;
    }

    return this.findById(id);
  }

  async softDelete(id: string, deletedAt: Date): Promise<boolean> {
    const [affectedCount] = await Category.update(
      {
        isDeleted: true,
        deletedAt,
      },
      {
        where: {
          id,
          isDeleted: false,
        },
      }
    );

    return affectedCount > 0;
  }

  async moveArticlesToCategory(fromCategoryId: string, toCategoryId: string): Promise<number> {
    const [affectedCount] = await Article.update(
      {
        categoryId: toCategoryId,
      },
      {
        where: {
          categoryId: fromCategoryId,
          isDeleted: false,
        },
      }
    );

    return affectedCount;
  }
}

export const categoryRepository = new CategoryRepository();
