import type { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCodes } from '@/utils/AppError';
import logger from '@/config/logger';

const ERROR_MESSAGE_MAP: Record<string, string> = {
  'No token provided': '未提供访问令牌',
  'Invalid token type': '令牌类型无效',
  'Authentication required': '请先登录后再操作',
  'Insufficient permissions': '权限不足，无法执行该操作',
  'You can only modify your own data': '只能修改自己的数据',
  'Username, email and password are required': '用户名、邮箱和密码不能为空',
  'Username must be 10 characters or less': '用户名长度不能超过 10 位',
  'Username can only contain letters and numbers': '用户名只能包含字母和数字',
  'Password must be at least 8 characters long': '密码长度至少为 8 位',
  'Password must be 16 characters or less': '密码长度不能超过 16 位',
  'Password can only contain letters and numbers': '密码只能包含字母和数字',
  'Email/username and password are required': '用户名/邮箱和密码不能为空',
  'Refresh token is required': '刷新令牌不能为空',
  'User ID not found in request': '请求中缺少用户信息',
  'Current password and new password are required': '当前密码和新密码不能为空',
  'New password must be at least 8 characters long': '新密码长度至少为 8 位',
  'Token is required': '令牌不能为空',
  'Invalid page number': '分页参数 page 非法',
  'Invalid page size': '分页参数 pageSize 非法',
  'Article id is required': '文章 ID 不能为空',
  'Tags must be an array': '标签必须是数组',
  'Author is required': '作者信息不能为空',
  'No fields to update': '缺少可更新字段',
  'JWT_SECRET is not defined': '服务端密钥未配置',
  'JWT secret is not defined': '服务端密钥未配置',
  'Invalid token payload': '令牌载荷无效',
  'Token expired': '登录状态已过期，请重新登录',
  'Invalid token': '令牌无效，请重新登录',
  'Username already exists': '用户名已存在',
  'Email already exists': '邮箱已被注册',
  'Email or username is required': '邮箱或用户名不能为空',
  'Invalid credentials': '账号或密码错误',
  'Account is not active': '账号已被禁用',
  'User not found': '用户不存在',
  'Current password is incorrect': '当前密码不正确',
  'Article not found': '文章不存在',
  'Title is required': '标题不能为空',
  'Title must be 200 characters or less': '标题长度不能超过 200 字',
  'Content is required': '内容不能为空',
  'The CORS policy for this site does not allow access from the specified Origin':
    '当前来源不在允许访问列表中',
};

const translateMessage = (message: string): string => {
  if (ERROR_MESSAGE_MAP[message]) {
    return ERROR_MESSAGE_MAP[message];
  }

  const corsPrefix =
    'The CORS policy for this site does not allow access from the specified Origin:';
  if (message.startsWith(corsPrefix)) {
    return '当前来源不在允许访问列表中';
  }

  return message;
};

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        message: translateMessage(err.message),
        code: err.errorCode,
        httpStatus: err.statusCode,
        details: err.details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      error: {
        message: '令牌无效，请重新登录',
        code: ErrorCodes.UNAUTHORIZED,
        httpStatus: 401,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        message: '登录状态已过期，请重新登录',
        code: ErrorCodes.UNAUTHORIZED,
        httpStatus: 401,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  if (err.name === 'ValidationError') {
    res.status(422).json({
      success: false,
      error: {
        message: '数据校验失败',
        code: ErrorCodes.VALIDATION_FAILED,
        httpStatus: 422,
        details: (err as { details?: unknown }).details,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const message = isProduction ? '服务器内部错误' : translateMessage(err.message);
  const stack = isProduction ? undefined : err.stack;

  res.status(500).json({
    success: false,
    error: {
      message,
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      httpStatus: 500,
      stack,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      message: `接口不存在：${req.method} ${req.path}`,
      code: ErrorCodes.NOT_FOUND,
      httpStatus: 404,
      timestamp: new Date().toISOString(),
    },
  });
};
