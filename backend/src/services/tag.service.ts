import { articleRepository } from '@/repositories/article.repository';
import { tagRepository } from '@/repositories/tag.repository';
import { BadRequestError, ConflictError, NotFoundError } from '@/utils/AppError';
import { TagStatus } from '@/models/tag.model';
import type { Tag } from '@/models/tag.model';
import type { Article } from '@/models/article.model';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export interface CreateTagInput {
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  status?: TagStatus;
}

export interface UpdateTagInput {
  name?: string;
  slug?: string;
  description?: string | null;
  color?: string;
  status?: TagStatus;
}

export interface TagArticleListResponse {
  tag: Tag;
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
}

type NormalizedCreateTagInput = Required<
  Pick<CreateTagInput, 'name' | 'slug' | 'color' | 'status'>
> &
  Pick<CreateTagInput, 'description'>;

class TagService {
  async createTag(input: CreateTagInput): Promise<Tag> {
    const normalized = this.normalizeCreateInput(input);
    await this.ensureSlugAvailable(normalized.slug);

    return tagRepository.create(normalized);
  }

  async updateTag(id: string, input: UpdateTagInput): Promise<Tag> {
    if (!id) {
      throw new BadRequestError('Tag id is required');
    }

    const existing = await tagRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Tag not found');
    }

    const normalized = this.normalizeUpdateInput(input);
    if (Object.keys(normalized).length === 0) {
      throw new BadRequestError('No fields to update');
    }

    if (normalized.slug && normalized.slug !== existing.slug) {
      await this.ensureSlugAvailable(normalized.slug, id);
    }

    const updated = await tagRepository.updateById(id, normalized as Partial<Tag>);
    if (!updated) {
      throw new NotFoundError('Tag not found');
    }

    return updated;
  }

  async deleteTag(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestError('Tag id is required');
    }

    const existing = await tagRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Tag not found');
    }

    const articleCount = await tagRepository.countLinkedArticles(id);
    if (articleCount > 0) {
      throw new ConflictError('Please remove this tag from related articles before deleting');
    }

    const deleted = await tagRepository.softDelete(id, new Date());
    if (!deleted) {
      throw new NotFoundError('Tag not found');
    }
  }

  async getTagList(status?: TagStatus): Promise<Tag[]> {
    return tagRepository.findAll({ status });
  }

  async getPublicTagList(): Promise<Tag[]> {
    return tagRepository.findAll({ status: TagStatus.ACTIVE });
  }

  async getTagOptions(): Promise<Tag[]> {
    return tagRepository.findAll();
  }

  async getTagById(id: string): Promise<Tag> {
    if (!id) {
      throw new BadRequestError('Tag id is required');
    }

    const tag = await tagRepository.findById(id);
    if (!tag) {
      throw new NotFoundError('Tag not found');
    }

    return tag;
  }

  async getArticlesBySlug(
    slug: string,
    page: number,
    pageSize: number
  ): Promise<TagArticleListResponse> {
    this.validateSlug(slug);

    const tag = await tagRepository.findBySlug(slug);
    if (!tag || tag.status !== TagStatus.ACTIVE) {
      throw new NotFoundError('Tag not found');
    }

    const result = await articleRepository.findAndCount({
      page,
      pageSize,
      tagId: tag.id,
    });

    return {
      tag,
      data: result.rows,
      total: result.count,
      page,
      pageSize,
    };
  }

  async ensureActiveTags(tagIds: string[]): Promise<Tag[]> {
    const uniqueIds = this.normalizeTagIds(tagIds);
    if (uniqueIds.length === 0) {
      return [];
    }

    const tags = await tagRepository.findByIds(uniqueIds);
    const activeTagIds = new Set(
      tags.filter(tag => tag.status === TagStatus.ACTIVE).map(tag => tag.id)
    );
    const hasInvalidTag = uniqueIds.some(tagId => !activeTagIds.has(tagId));
    if (hasInvalidTag) {
      throw new BadRequestError('Tag is invalid');
    }

    return tags;
  }

  normalizeTagIds(tagIds?: string[]): string[] {
    if (!tagIds) {
      return [];
    }

    return Array.from(new Set(tagIds.map(tagId => String(tagId ?? '').trim()).filter(Boolean)));
  }

  private normalizeCreateInput(input: CreateTagInput): NormalizedCreateTagInput {
    const name = this.normalizeName(input.name);
    const slug = this.normalizeSlug(input.slug);
    const color = this.normalizeColor(input.color);
    const status = this.normalizeStatus(input.status ?? TagStatus.ACTIVE);

    return {
      name,
      slug,
      description: this.normalizeDescription(input.description),
      color,
      status,
    };
  }

  private normalizeUpdateInput(input: UpdateTagInput): UpdateTagInput {
    const data: UpdateTagInput = {};

    if (input.name !== undefined) {
      data.name = this.normalizeName(input.name);
    }
    if (input.slug !== undefined) {
      data.slug = this.normalizeSlug(input.slug);
    }
    if (input.description !== undefined) {
      data.description = this.normalizeDescription(input.description);
    }
    if (input.color !== undefined) {
      data.color = this.normalizeColor(input.color);
    }
    if (input.status !== undefined) {
      data.status = this.normalizeStatus(input.status);
    }

    return data;
  }

  private normalizeName(name: string): string {
    const normalized = String(name ?? '').trim();
    if (!normalized) {
      throw new BadRequestError('Tag name is required');
    }
    if (normalized.length > 30) {
      throw new BadRequestError('Tag name must be 30 characters or less');
    }

    return normalized;
  }

  private normalizeSlug(slug: string): string {
    const normalized = String(slug ?? '')
      .trim()
      .toLowerCase();
    this.validateSlug(normalized);
    return normalized;
  }

  private validateSlug(slug: string): void {
    if (!slug) {
      throw new BadRequestError('Tag slug is required');
    }
    if (slug.length > 80 || !SLUG_PATTERN.test(slug)) {
      throw new BadRequestError('Tag slug must use lowercase letters, numbers, and hyphens');
    }
  }

  private normalizeDescription(description?: string | null): string | null {
    if (description === undefined || description === null) {
      return null;
    }

    return String(description).trim() || null;
  }

  private normalizeColor(color: string): string {
    const normalized = String(color ?? '').trim();
    if (!normalized) {
      throw new BadRequestError('Tag color is required');
    }
    if (!HEX_COLOR_PATTERN.test(normalized)) {
      throw new BadRequestError('Tag color must be a valid HEX color');
    }

    if (normalized.length === 4) {
      return `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`.toLowerCase();
    }

    return normalized.toLowerCase();
  }

  private normalizeStatus(status: TagStatus): TagStatus {
    if (!Object.values(TagStatus).includes(status)) {
      throw new BadRequestError('Tag status is invalid');
    }

    return status;
  }

  private async ensureSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = excludeId
      ? await tagRepository.findBySlugExcludingId(slug, excludeId)
      : await tagRepository.findBySlug(slug);

    if (existing) {
      throw new ConflictError('Tag slug already exists');
    }
  }
}

export const tagService = new TagService();
