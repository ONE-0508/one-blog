import { Router } from 'express';
import { authController } from '@/controllers/auth.controller';
import { authenticate, requireRole, optionalAuthenticate } from '@/middlewares/auth.middleware';
import { authLimiter } from '@/middlewares/rateLimiter';
import { UserRole } from '@/models/user.model';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/register:
 *   post:
 *     tags:
 *       - 认证管理
 *     summary: 用户注册
 *     description: 创建新用户账号
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthRegisterRequest'
 *     responses:
 *       201:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', authLimiter, authController.register.bind(authController));

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags:
 *       - 认证管理
 *     summary: 用户登录
 *     description: 使用邮箱或用户名和密码登录
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AuthLoginRequest'
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       401:
 *         description: 账号或密码错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', authLimiter, authController.login.bind(authController));

/**
 * @openapi
 * /api/v1/auth/refresh:
 *   post:
 *     tags:
 *       - 认证管理
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌换取新的访问令牌
 *     responses:
 *       200:
 *         description: 刷新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRefreshResponse'
 *       401:
 *         description: 刷新令牌无效
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/refresh', authController.refreshToken.bind(authController));

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags:
 *       - 认证管理
 *     summary: 用户登出
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/logout', authenticate, authController.logout.bind(authController));

/**
 * @openapi
 * /api/v1/auth/me:
 *   get:
 *     tags:
 *       - 认证管理
 *     summary: 获取当前用户信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthMeResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/me', authenticate, authController.getCurrentUser.bind(authController));

/**
 * @openapi
 * /api/v1/auth/password:
 *   put:
 *     tags:
 *       - 认证管理
 *     summary: 修改密码
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/password', authenticate, authController.changePassword.bind(authController));

/**
 * @openapi
 * /api/v1/auth/validate:
 *   post:
 *     tags:
 *       - 认证管理
 *     summary: 验证令牌有效性
 *     responses:
 *       200:
 *         description: 验证完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthValidateResponse'
 */
router.post('/validate', authController.validateToken.bind(authController));

/**
 * @openapi
 * /api/v1/auth/admin/users:
 *   get:
 *     tags:
 *       - 认证管理
 *     summary: 获取所有用户（管理员）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         description: 无权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/admin/users', authenticate, requireRole(UserRole.ADMIN), (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Admin endpoint - get all users',
    },
  });
});

/**
 * @openapi
 * /api/v1/auth/test/public:
 *   get:
 *     tags:
 *       - 测试接口
 *     summary: 公共测试接口
 *     responses:
 *       200:
 *         description: 调用成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
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
 * @openapi
 * /api/v1/auth/test/protected:
 *   get:
 *     tags:
 *       - 测试接口
 *     summary: 鉴权测试接口
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 调用成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
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
 * @openapi
 * /api/v1/auth/test/admin:
 *   get:
 *     tags:
 *       - 测试接口
 *     summary: 管理员测试接口
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 调用成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       403:
 *         description: 无权限
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/test/admin', authenticate, requireRole(UserRole.ADMIN), (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'This is an admin-only endpoint',
      user: req.user,
      timestamp: new Date().toISOString(),
    },
  });
});

/**
 * @openapi
 * /api/v1/auth/test/optional:
 *   get:
 *     tags:
 *       - 测试接口
 *     summary: 可选鉴权测试接口
 *     responses:
 *       200:
 *         description: 调用成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
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
