import { Router } from 'express';
import { articleController } from '@/controllers/article.controller';
import { authenticate, requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/models/user.model';

const router = Router();

/**
 * @route   GET /api/v1/articles
 * @desc    文章列表（分页）
 * @access  Public
 */
router.get('/', articleController.getArticles.bind(articleController));

/**
 * @route   GET /api/v1/articles/:id
 * @desc    文章详情
 * @access  Public
 */
router.get('/:id', articleController.getArticleById.bind(articleController));

/**
 * @route   POST /api/v1/articles
 * @desc    新增文章
 * @access  Private（管理员）
 */
router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  articleController.createArticle.bind(articleController)
);

/**
 * @route   PUT /api/v1/articles/:id
 * @desc    编辑文章
 * @access  Private（管理员）
 */
router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  articleController.updateArticle.bind(articleController)
);

/**
 * @route   DELETE /api/v1/articles/:id
 * @desc    删除文章（软删除）
 * @access  Private（管理员）
 */
router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  articleController.deleteArticle.bind(articleController)
);

export default router;
