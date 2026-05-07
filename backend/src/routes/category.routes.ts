import { Router } from 'express';
import { categoryController } from '@/controllers/category.controller';
import { authenticate, requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/models/user.model';

const router = Router();

router.get('/public', categoryController.getPublicCategories.bind(categoryController));
router.get('/options', categoryController.getCategoryOptions.bind(categoryController));
router.get('/:slug/articles', categoryController.getCategoryArticles.bind(categoryController));
router.get('/', categoryController.getCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));

router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  categoryController.createCategory.bind(categoryController)
);

router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  categoryController.updateCategory.bind(categoryController)
);

router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  categoryController.deleteCategory.bind(categoryController)
);

export default router;
