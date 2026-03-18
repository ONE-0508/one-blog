import type { Request, Response, NextFunction } from 'express';
import { authService } from '@/services/auth.service';
import { UnauthorizedError, ForbiddenError } from '@/utils/AppError';
import { UserRole } from '@/models/user.model';
import logger from '@/config/logger';

/**
 * 用户信息接口（扩展Express的Request类型）
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRole;
        [key: string]: unknown;
      };
    }
  }
}

/**
 * 认证中间件 - 验证JWT令牌
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 从Authorization头获取令牌
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // 移除'Bearer '前缀

    // 验证令牌
    const payload = authService.verifyToken(token);

    // 检查令牌类型
    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // 将用户信息附加到请求对象
    req.user = {
      id: payload.sub,
      role: payload.role as UserRole,
    };

    logger.debug(`User authenticated: ${req.user.id} (${req.user.role})`);

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      next(new UnauthorizedError('Invalid or expired token'));
    }
  }
};

/**
 * 角色权限检查中间件
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const userRole = req.user!.role;

      // 检查用户角色是否在允许的角色列表中
      if (!roles.includes(userRole)) {
        throw new ForbiddenError('Insufficient permissions');
      }

      logger.debug(`Role check passed: ${userRole} in [${roles.join(', ')}]`);

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * 可选认证中间件 - 如果有令牌则验证，没有则继续
 */
export const optionalAuthenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = authService.verifyToken(token);

        if (payload.type === 'access') {
          req.user = {
            id: payload.sub,
            role: payload.role as UserRole,
          };

          logger.debug(`Optional authentication: User ${req.user.id} authenticated`);
        }
      } catch {
        // 令牌无效，但不抛出错误，继续处理请求
        logger.debug('Optional authentication: Invalid token, continuing as guest');
      }
    }

    next();
  } catch (error) {
    // 这里不应该抛出错误，因为认证是可选的
    logger.error('Optional authentication error:', error);
    next();
  }
};

/**
 * 检查用户是否是自己或管理员
 */
export const requireSelfOrAdmin = (req: Request, _res: Response, next: NextFunction): void => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const userId = req.params.userId || req.body.userId;
    const isSelf = userId === req.user!.id;
    const isAdmin = req.user!.role === UserRole.ADMIN;

    if (!isSelf && !isAdmin) {
      throw new ForbiddenError('You can only modify your own data');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * 速率限制中间件（专门用于认证端点）
 */
export const authRateLimit = {
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 每个IP最多5次请求
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts, please try again later.',
      code: 429,
    },
  },
  skipSuccessfulRequests: true, // 成功请求不计入限制
};

/**
 * 生成令牌响应头
 */
export const setTokenHeaders = (
  res: Response,
  tokens: { accessToken: string; refreshToken: string }
): void => {
  // 设置HTTP-only Cookie（可选，增强安全性）
  res.cookie('access_token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15分钟
  });

  res.cookie('refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天
  });

  // 同时返回在响应体中，方便客户端使用
  res.setHeader('X-Access-Token', tokens.accessToken);
  res.setHeader('X-Refresh-Token', tokens.refreshToken);
};
