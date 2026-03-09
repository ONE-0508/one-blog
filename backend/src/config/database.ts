import { Sequelize } from 'sequelize-typescript';
import type { Dialect } from 'sequelize';
import logger from './logger';

/**
 * 数据库配置接口
 */
interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  dialect: Dialect;
  logging: boolean;
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
}

/**
 * 获取数据库配置
 */
const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // 测试环境使用SQLite内存数据库
  if (isTest) {
    return {
      host: 'localhost',
      port: 5432,
      database: ':memory:',
      username: 'test',
      password: 'test',
      dialect: 'sqlite' as Dialect,
      logging: false,
      pool: {
        max: 1,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    };
  }

  // 开发和生产环境使用PostgreSQL
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'blog_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres' as Dialect,
    logging: false,
    pool: {
      max: isProduction ? 20 : 5,
      min: isProduction ? 5 : 0,
      acquire: 30000,
      idle: 10000,
    },
  };
};

/**
 * 创建Sequelize实例
 */
const createSequelizeInstance = (): Sequelize => {
  const config = getDatabaseConfig();

  const sequelize = new Sequelize({
    host: config.host,
    port: config.port,
    database: config.database,
    username: config.username,
    password: config.password,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool,
  });

  return sequelize;
};

// 创建全局数据库实例
const sequelize = createSequelizeInstance();

// 手动添加模型
import { User } from '@/models/user.model';
sequelize.addModels([User]);

/**
 * 测试数据库连接
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection has been established successfully.');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

/**
 * 同步数据库（开发环境使用）
 */
export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    logger.info('Database synchronized successfully.');
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

/**
 * 关闭数据库连接
 */
export const closeDatabaseConnection = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed.');
  } catch (error) {
    logger.error('Error closing database connection:', error);
  }
};

export default sequelize;
