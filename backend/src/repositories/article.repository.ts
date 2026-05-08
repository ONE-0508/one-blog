import { Article } from '@/models/article.model';
import { ArticleTag } from '@/models/article-tag.model';
import { Category } from '@/models/category.model';
import { Tag, TagStatus } from '@/models/tag.model';
import { User } from '@/models/user.model';

export interface ArticleListOptions {
  page: number;
  pageSize: number;
  categoryId?: string;
  tagId?: string;
}

export interface ArticleListResult {
  rows: Article[];
  count: number;
}

class ArticleRepository {
  async create(data: {
    title: string;
    content: string;
    tags: string[];
    authorId: string;
    categoryId?: string | null;
  }): Promise<Article> {
    return Article.create(data);
  }

  async setArticleTags(articleId: string, tagIds: string[]): Promise<void> {
    await ArticleTag.destroy({
      where: {
        articleId,
      },
    });

    if (tagIds.length === 0) {
      return;
    }

    await ArticleTag.bulkCreate(
      tagIds.map(tagId => ({
        articleId,
        tagId,
      }))
    );
  }

  async findById(
    id: string,
    options: { includeDeleted?: boolean; includeAuthor?: boolean } = {}
  ): Promise<Article | null> {
    const { includeDeleted = false, includeAuthor = false } = options;

    return Article.findOne({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: includeAuthor
        ? [
            {
              model: User,
              attributes: ['id', 'username', 'displayName', 'avatarUrl'],
            },
            {
              model: Category,
              attributes: ['id', 'name', 'slug', 'description', 'sort', 'status'],
            },
            {
              model: Tag,
              as: 'tagDetails',
              attributes: ['id', 'name', 'slug', 'description', 'color', 'status'],
              through: { attributes: [] },
              where: {
                isDeleted: false,
              },
              required: false,
            },
          ]
        : [],
    });
  }

  async findAndCount(options: ArticleListOptions): Promise<ArticleListResult> {
    const { page, pageSize, categoryId, tagId } = options;
    const offset = (page - 1) * pageSize;

    const result = await Article.findAndCountAll({
      where: {
        isDeleted: false,
        ...(categoryId ? { categoryId } : {}),
      },
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset,
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'displayName', 'avatarUrl'],
        },
        {
          model: Category,
          attributes: ['id', 'name', 'slug', 'description', 'sort', 'status'],
        },
        ...(tagId
          ? [
              {
                model: Tag,
                as: 'tagDetails',
                attributes: ['id', 'name', 'slug', 'description', 'color', 'status'],
                through: { attributes: [] },
                where: {
                  id: tagId,
                  isDeleted: false,
                  status: TagStatus.ACTIVE,
                },
                required: true,
              },
            ]
          : [
              {
                model: Tag,
                as: 'tagDetails',
                attributes: ['id', 'name', 'slug', 'description', 'color', 'status'],
                through: { attributes: [] },
                where: {
                  isDeleted: false,
                },
                required: false,
              },
            ]),
      ],
      distinct: true,
    });

    return {
      rows: result.rows,
      count: result.count,
    };
  }

  async updateById(id: string, data: Partial<Article>): Promise<Article | null> {
    const [affectedCount, updatedRows] = await Article.update(data, {
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

    return this.findById(id, { includeDeleted: false, includeAuthor: true });
  }

  async softDelete(id: string, deletedAt: Date): Promise<boolean> {
    const [affectedCount] = await Article.update(
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

  async incrementViewCount(id: string): Promise<void> {
    await Article.increment('viewCount', {
      by: 1,
      where: {
        id,
        isDeleted: false,
      },
    });
  }
}

export const articleRepository = new ArticleRepository();
