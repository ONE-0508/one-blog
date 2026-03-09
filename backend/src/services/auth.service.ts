import jwt from 'jsonwebtoken';
import { User, UserRole, UserStatus } from '@/models/user.model';
import {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
} from '@/utils/AppError';
import logger from '@/config/logger';

/**
 * JWT Payload 接口
 */
interface JwtPayload extends jwt.JwtPayload {
  sub: string;
  role?: UserRole;
  type?: 'access' | 'refresh';
  exp?: number;
}

/**
 * 令牌接口
 */
export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * 注册数据接口
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  displayName?: string;
}

/**
 * 登录数据接口
 */
export interface LoginData {
  email?: string;
  username?: string;
  password: string;
}

/**
 * 认证服务类
 */
export class AuthService {
  /**
   * 生成访问令牌
   */
  private generateAccessToken(userId: string, role: UserRole): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      {
        sub: userId,
        role: role,
        type: 'access',
      },
      secret,
      {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
      } as jwt.SignOptions
    );
  }

  /**
   * 生成刷新令牌
   */
  private generateRefreshToken(userId: string): string {
    const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign(
      {
        sub: userId,
        type: 'refresh',
      },
      secret,
      {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      } as jwt.SignOptions
    );
  }

  /**
   * 验证令牌
   */
  verifyToken(token: string, isRefreshToken: boolean = false): JwtPayload {
    const secret = isRefreshToken
      ? process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
      : process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT secret is not defined');
    }

    try {
      const payload = jwt.verify(token, secret);
      if (typeof payload === 'string') {
        throw new Error('Invalid token payload');
      }
      return payload as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedError('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedError('Invalid token');
      }
      throw error;
    }
  }

  /**
   * 用户注册
   */
  async register(data: RegisterData): Promise<{ user: User; tokens: Tokens }> {
    // 检查用户名是否已存在
    const existingUserByUsername = await User.findOne({
      where: { username: data.username },
    });

    if (existingUserByUsername) {
      throw new ConflictError('Username already exists');
    }

    // 检查邮箱是否已存在
    const existingUserByEmail = await User.findOne({
      where: { email: data.email },
    });

    if (existingUserByEmail) {
      throw new ConflictError('Email already exists');
    }

    // 创建用户
    const user = await User.create({
      username: data.username,
      email: data.email,
      passwordHash: data.password,
      displayName: data.displayName || data.username,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });

    // 生成令牌
    const tokens = await this.generateTokens(user.id, user.role);

    logger.info(`User registered: ${user.username} (${user.email})`);

    return { user, tokens };
  }

  /**
   * 用户登录
   */
  async login(data: LoginData): Promise<{ user: User; tokens: Tokens }> {
    const { email, username, password } = data;

    // 查找用户
    const whereCondition: { email?: string; username?: string } = {};
    if (email) {
      whereCondition.email = email;
    } else if (username) {
      whereCondition.username = username;
    } else {
      throw new BadRequestError('Email or username is required');
    }

    const user = await User.findOne({ where: whereCondition });

    // 验证用户是否存在
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 检查用户状态
    if (!user.isActive()) {
      throw new ForbiddenError('Account is not active');
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // 生成令牌
    const tokens = await this.generateTokens(user.id, user.role);

    logger.info(`User logged in: ${user.username} (${user.email})`);

    return { user, tokens };
  }

  /**
   * 生成访问令牌和刷新令牌
   */
  async generateTokens(userId: string, role: UserRole): Promise<Tokens> {
    const accessToken = this.generateAccessToken(userId, role);
    const refreshToken = this.generateRefreshToken(userId);

    // 解析访问令牌获取过期时间
    const decoded = jwt.decode(accessToken) as { exp: number };
    const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  /**
   * 刷新访问令牌
   */
  async refreshAccessToken(refreshToken: string): Promise<Tokens> {
    // 验证刷新令牌
    const payload = this.verifyToken(refreshToken, true);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedError('Invalid token type');
    }

    // 查找用户
    const user = await User.findByPk(payload.sub as string);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // 检查用户状态
    if (!user.isActive()) {
      throw new ForbiddenError('Account is not active');
    }

    // 生成新的令牌
    return this.generateTokens(user.id, user.role);
  }

  /**
   * 获取当前用户
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive()) {
      throw new ForbiddenError('Account is not active');
    }

    return user;
  }

  /**
   * 修改密码
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // 验证当前密码
    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // 更新密码
    user.passwordHash = newPassword;
    await user.save();

    logger.info(`Password changed for user: ${user.username}`);
  }

  /**
   * 登出（客户端应删除令牌）
   */
  async logout(): Promise<{ message: string }> {
    // 在实际应用中，这里可以将令牌加入黑名单
    // 对于无状态JWT，客户端只需删除本地存储的令牌

    return { message: 'Logged out successfully' };
  }
}

// 导出单例实例
export const authService = new AuthService();
