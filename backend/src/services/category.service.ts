import { categoryRepository } from '@/repositories/category.repository';
import { BadRequestError, ConflictError, NotFoundError } from '@/utils/AppError';
import { CategoryStatus } from '@/models/category.model';
import type { Category } from '@/models/category.model';
import type { Article } from '@/models/article.model';
import { articleRepository } from '@/repositories/article.repository';

const DEFAULT_CATEGORY = {
  name: '未分类',
  slug: 'uncategorized',
  description: '默认分类，用于承接未指定或原分类已删除的文章。',
  sort: 9999,
  status: CategoryStatus.ACTIVE,
} as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string | null;
  sort?: number;
  status?: CategoryStatus;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string | null;
  sort?: number;
  status?: CategoryStatus;
}

export interface CategoryArticleListResponse {
  category: Category;
  data: Article[];
  total: number;
  page: number;
  pageSize: number;
}

type NormalizedCreateCategoryInput = Required<
  Pick<CreateCategoryInput, 'name' | 'slug' | 'sort' | 'status'>
> &
  Pick<CreateCategoryInput, 'description'>;

class CategoryService {
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const normalized = this.normalizeCreateInput(input);
    await this.ensureSlugAvailable(normalized.slug);

    return categoryRepository.create(normalized);
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    if (!id) {
      throw new BadRequestError('Category id is required');
    }

    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    const normalized = this.normalizeUpdateInput(input);
    if (Object.keys(normalized).length === 0) {
      throw new BadRequestError('No fields to update');
    }

    if (normalized.slug && normalized.slug !== existing.slug) {
      await this.ensureSlugAvailable(normalized.slug, id);
    }

    const updated = await categoryRepository.updateById(id, normalized as Partial<Category>);
    if (!updated) {
      throw new NotFoundError('Category not found');
    }

    return updated;
  }

  async deleteCategory(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestError('Category id is required');
    }

    const existing = await categoryRepository.findById(id);
    if (!existing) {
      throw new NotFoundError('Category not found');
    }

    const fallback = await this.ensureDefaultCategory();
    await categoryRepository.moveArticlesToCategory(id, fallback.id);

    const deleted = await categoryRepository.softDelete(id, new Date());
    if (!deleted) {
      throw new NotFoundError('Category not found');
    }
  }

  async getCategoryList(status?: CategoryStatus): Promise<Category[]> {
    return categoryRepository.findAll({ status });
  }

  async getPublicCategoryList(): Promise<Category[]> {
    return categoryRepository.findAll({ status: CategoryStatus.ACTIVE });
  }

  async getCategoryById(id: string): Promise<Category> {
    if (!id) {
      throw new BadRequestError('Category id is required');
    }

    const category = await categoryRepository.findById(id);
    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return category;
  }

  async getArticlesBySlug(
    slug: string,
    page: number,
    pageSize: number
  ): Promise<CategoryArticleListResponse> {
    this.validateSlug(slug);

    const category = await categoryRepository.findBySlug(slug);
    if (!category || category.status !== CategoryStatus.ACTIVE) {
      throw new NotFoundError('Category not found');
    }

    const result = await articleRepository.findAndCount({
      page,
      pageSize,
      categoryId: category.id,
    });

    return {
      category,
      data: result.rows,
      total: result.count,
      page,
      pageSize,
    };
  }

  async ensureDefaultCategory(): Promise<Category> {
    const existing = await categoryRepository.findBySlug(DEFAULT_CATEGORY.slug);
    if (existing) {
      return existing;
    }

    return categoryRepository.create(DEFAULT_CATEGORY);
  }

  async ensureActiveCategory(categoryId: string): Promise<Category> {
    const category = await categoryRepository.findById(categoryId);
    if (!category || category.status !== CategoryStatus.ACTIVE) {
      throw new BadRequestError('Category is invalid');
    }

    return category;
  }

  private normalizeCreateInput(input: CreateCategoryInput): NormalizedCreateCategoryInput {
    const name = this.normalizeName(input.name);
    const slug = this.normalizeSlug(input.slug);
    const sort = this.normalizeSort(input.sort ?? 0);
    const status = this.normalizeStatus(input.status ?? CategoryStatus.ACTIVE);

    return {
      name,
      slug,
      description: this.normalizeDescription(input.description),
      sort,
      status,
    };
  }

  private normalizeUpdateInput(input: UpdateCategoryInput): UpdateCategoryInput {
    const data: UpdateCategoryInput = {};

    if (input.name !== undefined) {
      data.name = this.normalizeName(input.name);
    }
    if (input.slug !== undefined) {
      data.slug = this.normalizeSlug(input.slug);
    }
    if (input.description !== undefined) {
      data.description = this.normalizeDescription(input.description);
    }
    if (input.sort !== undefined) {
      data.sort = this.normalizeSort(input.sort);
    }
    if (input.status !== undefined) {
      data.status = this.normalizeStatus(input.status);
    }

    return data;
  }

  private normalizeName(name: string): string {
    const normalized = String(name ?? '').trim();
    if (!normalized) {
      throw new BadRequestError('Category name is required');
    }
    if (normalized.length > 30) {
      throw new BadRequestError('Category name must be 30 characters or less');
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
      throw new BadRequestError('Category slug is required');
    }
    if (slug.length > 80 || !SLUG_PATTERN.test(slug)) {
      throw new BadRequestError('Category slug must use lowercase letters, numbers, and hyphens');
    }
  }

  private normalizeDescription(description?: string | null): string | null {
    if (description === undefined || description === null) {
      return null;
    }

    return String(description).trim() || null;
  }

  private normalizeSort(sort: number): number {
    const normalized = Number(sort);
    if (!Number.isInteger(normalized)) {
      throw new BadRequestError('Category sort must be an integer');
    }

    return normalized;
  }

  private normalizeStatus(status: CategoryStatus): CategoryStatus {
    if (!Object.values(CategoryStatus).includes(status)) {
      throw new BadRequestError('Category status is invalid');
    }

    return status;
  }

  private async ensureSlugAvailable(slug: string, excludeId?: string): Promise<void> {
    const existing = excludeId
      ? await categoryRepository.findBySlugExcludingId(slug, excludeId)
      : await categoryRepository.findBySlug(slug);

    if (existing) {
      throw new ConflictError('Category slug already exists');
    }
  }
}

export const categoryService = new CategoryService();
