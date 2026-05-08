import { Op } from 'sequelize';
import { Article } from '@/models/article.model';
import { ArticleTag } from '@/models/article-tag.model';
import { Tag } from '@/models/tag.model';
import type { TagStatus } from '@/models/tag.model';

export interface TagListOptions {
  status?: TagStatus;
  includeDeleted?: boolean;
}

class TagRepository {
  async create(data: {
    name: string;
    slug: string;
    description?: string | null;
    color: string;
    status: TagStatus;
  }): Promise<Tag> {
    return Tag.create(data);
  }

  async findById(id: string, includeDeleted = false): Promise<Tag | null> {
    return Tag.findOne({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async findBySlug(slug: string, includeDeleted = false): Promise<Tag | null> {
    return Tag.findOne({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });
  }

  async findBySlugExcludingId(slug: string, id: string): Promise<Tag | null> {
    return Tag.findOne({
      where: {
        slug,
        id: { [Op.ne]: id },
        isDeleted: false,
      },
    });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (ids.length === 0) {
      return [];
    }

    return Tag.findAll({
      where: {
        id: ids,
        isDeleted: false,
      },
    });
  }

  async findAll(options: TagListOptions = {}): Promise<Tag[]> {
    const { status, includeDeleted = false } = options;

    const tags = await Tag.findAll({
      where: {
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...(status ? { status } : {}),
      },
      order: [['createdAt', 'DESC']],
    });

    await Promise.all(
      tags.map(async tag => {
        const articleCount = await ArticleTag.count({
          include: [
            {
              model: Article,
              required: true,
              attributes: [],
              where: {
                isDeleted: false,
              },
            },
          ],
          where: {
            tagId: tag.id,
          },
        });
        tag.setDataValue('articleCount', articleCount);
      })
    );

    return tags;
  }

  async updateById(id: string, data: Partial<Tag>): Promise<Tag | null> {
    const [affectedCount, updatedRows] = await Tag.update(data, {
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
    const [affectedCount] = await Tag.update(
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

  async countLinkedArticles(tagId: string): Promise<number> {
    return ArticleTag.count({
      include: [
        {
          model: Article,
          required: true,
          attributes: [],
          where: {
            isDeleted: false,
          },
        },
      ],
      where: {
        tagId,
      },
    });
  }
}

export const tagRepository = new TagRepository();
