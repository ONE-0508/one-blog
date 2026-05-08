import { Router } from 'express';
import { tagController } from '@/controllers/tag.controller';
import { authenticate, requireRole } from '@/middlewares/auth.middleware';
import { UserRole } from '@/models/user.model';

const router = Router();

router.get('/public', tagController.getPublicTags.bind(tagController));
router.get('/options', tagController.getTagOptions.bind(tagController));
router.get('/:slug/articles', tagController.getTagArticles.bind(tagController));
router.get('/', tagController.getTags.bind(tagController));
router.get('/:id', tagController.getTagById.bind(tagController));

router.post(
  '/',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  tagController.createTag.bind(tagController)
);

router.put(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  tagController.updateTag.bind(tagController)
);

router.delete(
  '/:id',
  authenticate,
  requireRole(UserRole.ADMIN, UserRole.EDITOR),
  tagController.deleteTag.bind(tagController)
);

export default router;
