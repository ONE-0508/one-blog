/**
 * 应用错误码
 */
export const ErrorCodes = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  CORS_ORIGIN_DENIED: 'CORS_ORIGIN_DENIED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly errorCode: ErrorCode;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: ErrorCode = ErrorCodes.INTERNAL_SERVER_ERROR,
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;
    this.details = details;

    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = '请求参数错误', details?: unknown) {
    super(message, 400, ErrorCodes.BAD_REQUEST, true, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = '未登录或登录状态已失效') {
    super(message, 401, ErrorCodes.UNAUTHORIZED);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = '没有访问权限') {
    super(message, 403, ErrorCodes.FORBIDDEN);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = '资源不存在') {
    super(message, 404, ErrorCodes.NOT_FOUND);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = '资源冲突') {
    super(message, 409, ErrorCodes.CONFLICT);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = '数据校验失败', details?: unknown) {
    super(message, 422, ErrorCodes.VALIDATION_FAILED, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = '服务器内部错误') {
    super(message, 500, ErrorCodes.INTERNAL_SERVER_ERROR, false);
  }
}
