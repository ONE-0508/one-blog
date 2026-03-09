import type { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { BadRequestError } from '@/utils/AppError';

/**
 * 认证控制器
 */
export class AuthController {
  /**
   * 用户注册
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, displayName } = req.body;

      // 基本验证
      if (!username || !email || !password) {
        throw new BadRequestError('Username, email and password are required');
      }

      // 密码强度验证
      if (password.length < 8) {
        throw new BadRequestError('Password must be at least 8 characters long');
      }

      const { user, tokens } = await authService.register({
        username,
        email,
        password,
        displayName,
      });

      res.status(201).json({
        success: true,
        data: {
          user: user.getPublicProfile(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登录
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, username, password } = req.body;

      // 基本验证
      if (!password || (!email && !username)) {
        throw new BadRequestError('Email/username and password are required');
      }

      const { user, tokens } = await authService.login({
        email,
        username,
        password,
      });

      res.status(200).json({
        success: true,
        data: {
          user: user.getPublicProfile(),
          tokens,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 刷新访问令牌
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new BadRequestError('Refresh token is required');
      }

      const tokens = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 从认证中间件获取用户ID
      const userId = (req as { user?: { id: string } }).user?.id;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      const user = await authService.getCurrentUser(userId);

      res.status(200).json({
        success: true,
        data: {
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 修改密码
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as { user?: { id: string } }).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw new BadRequestError('User ID not found in request');
      }

      if (!currentPassword || !newPassword) {
        throw new BadRequestError('Current password and new password are required');
      }

      // 密码强度验证
      if (newPassword.length < 8) {
        throw new BadRequestError('New password must be at least 8 characters long');
      }

      await authService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        success: true,
        data: {
          message: 'Password changed successfully',
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 用户登出
   */
  async logout(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.logout();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * 验证令牌（用于前端检查令牌是否有效）
   */
  async validateToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        throw new BadRequestError('Token is required');
      }

      // 验证令牌
      const payload = authService.verifyToken(token) as {
        sub: string;
        role?: string;
        exp?: number;
      };

      res.status(200).json({
        success: true,
        data: {
          valid: true,
          userId: payload.sub,
          role: payload.role,
          expiresAt: payload.exp ? payload.exp * 1000 : undefined, // 转换为毫秒
        },
      });
    } catch (error) {
      // 令牌无效，但不抛出错误，只返回验证失败
      if (error instanceof Error && error.message.includes('Token')) {
        res.status(200).json({
          success: true,
          data: {
            valid: false,
            error: error.message,
          },
        });
        return;
      }
      next(error);
    }
  }
}

// 导出控制器实例
export const authController = new AuthController();
