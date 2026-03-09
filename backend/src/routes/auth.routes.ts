import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticate, requireRole, optionalAuthenticate } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/rateLimiter';
import { UserRole } from '@/models/user.model';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    用户注册
 * @access  Public
 * @rate    限制：15分钟内最多5次注册尝试
 */
router.post(
  '/register',
  authLimiter,
  authController.register.bind(authController)
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    用户登录
 * @access  Public
 * @rate    限制：15分钟内最多5次登录尝试
 */
router.post(
  '/login',
  authLimiter,
  authController.login.bind(authController)
);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    刷新访问令牌
 * @access  Public（需要有效的刷新令牌）
 */
router.post(
  '/refresh',
  authController.refreshToken.bind(authController)
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    用户登出
 * @access  Private（需要有效的访问令牌）
 */
router.post(
  '/logout',
  authenticate,
  authController.logout.bind(authController)
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    获取当前用户信息
 * @access  Private（需要有效的访问令牌）
 */
router.get(
  '/me',
  authenticate,
  authController.getCurrentUser.bind(authController)
);

/**
 * @route   PUT /api/v1/auth/password
 * @desc    修改密码
 * @access  Private（需要有效的访问令牌）
 */
router.put(
  '/password',
  authenticate,
  authController.changePassword.bind(authController)
);

/**
 * @route   POST /api/v1/auth/validate
 * @desc    验证令牌有效性
 * @access  Public
 */
router.post(
  '/validate',
  authController.validateToken.bind(authController)
);

/**
 * @route   GET /api/v1/auth/admin/users
 * @desc    获取所有用户（管理员）
 * @access  Private（需要管理员权限）
 */
router.get(
  '/admin/users',
  authenticate,
  requireRole(UserRole.ADMIN),
  (_req, res) => {
    // 这里可以调用用户控制器
    res.status(200).json({
      success: true,
      data: {
        message: 'Admin endpoint - get all users',
      },
    });
  }
);

/**
 * @route   GET /api/v1/auth/test/public
 * @desc    公共测试端点
 * @access  Public
 */
router.get('/test/public', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'This is a public endpoint',
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @route   GET /api/v1/auth/test/protected
 * @desc    受保护测试端点
 * @access  Private（需要有效的访问令牌）
 */
router.get('/test/protected', authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'This is a protected endpoint',
      user: req.user,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @route   GET /api/v1/auth/test/admin
 * @desc    管理员测试端点
 * @access  Private（需要管理员权限）
 */
router.get(
  '/test/admin',
  authenticate,
  requireRole(UserRole.ADMIN),
  (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        message: 'This is an admin-only endpoint',
        user: req.user,
        timestamp: new Date().toISOString(),
      },
    });
  }
);

/**
 * @route   GET /api/v1/auth/test/optional
 * @desc    可选认证测试端点
 * @access  Public（如果有令牌则显示用户信息）
 */
router.get('/test/optional', optionalAuthenticate, (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'This endpoint has optional authentication',
      isAuthenticated: !!_req.user,
      user: _req.user || null,
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;