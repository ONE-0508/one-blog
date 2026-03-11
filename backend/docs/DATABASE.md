# 数据库连接与配置指南

## 📋 概述

本文档详细说明了博客项目后端数据库的配置、连接和管理方法。项目采用 **PostgreSQL** 作为主数据库，支持开发、测试和生产环境的多环境配置。

## 🏗️ 架构设计

### 数据库选择策略

- **开发环境**: PostgreSQL（本地安装）
- **测试环境**: SQLite内存数据库
- **生产环境**: PostgreSQL（云托管或自托管）

### 技术栈

- **ORM**: Sequelize + Sequelize-Typescript
- **数据库**: PostgreSQL 15+
- **连接池**: Sequelize内置连接池
- **迁移工具**: Sequelize同步功能

## 🔧 环境配置

### 环境变量 (.env)

```bash
# Server Configuration
NODE_ENV=development
PORT=3001

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog_dev
DB_USER=mac
DB_PASSWORD=
```

### 多环境配置

项目支持三种环境，通过 `NODE_ENV` 变量切换：

| 环境 | NODE_ENV    | 数据库           | 用途     |
| ---- | ----------- | ---------------- | -------- |
| 开发 | development | PostgreSQL       | 本地开发 |
| 测试 | test        | SQLite内存数据库 | 单元测试 |
| 生产 | production  | PostgreSQL       | 线上环境 |

## 🚀 快速开始

### 1. 安装PostgreSQL（开发环境）

```bash
# macOS (使用Homebrew)
brew install postgresql@15
brew services start postgresql@15

# 创建数据库
/opt/homebrew/opt/postgresql@15/bin/createdb blog_dev
```

### 2. 安装依赖

```bash
cd backend
npm install
```

### 3. 启动服务器

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm run build
npm start
```

## 📊 数据库配置详解

### 配置文件位置

`src/config/database.ts`

### 配置逻辑

```typescript
// 根据环境返回不同的数据库配置
const getDatabaseConfig = (): DatabaseConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  // 测试环境：SQLite内存数据库
  if (isTest) {
    return {
      database: ':memory:',
      dialect: 'sqlite' as Dialect,
      // ... 其他配置
    };
  }

  // 开发环境：PostgreSQL
  if (!isProduction) {
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'blog_dev',
      username: process.env.DB_USER || 'mac',
      password: process.env.DB_PASSWORD || '',
      dialect: 'postgres' as Dialect,
      // ... 其他配置
    };
  }

  // 生产环境：PostgreSQL（从环境变量读取）
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'blog_db',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
    dialect: 'postgres' as Dialect,
    // ... 其他配置
  };
};
```

## 🔌 数据库连接

### 连接测试

项目启动时会自动测试数据库连接：

```typescript
// 在 app.ts 中
const isDbConnected = await testDatabaseConnection();
if (!isDbConnected) {
  logger.error('Failed to connect to database. Server will not start.');
  process.exit(1);
}
```

### 连接池配置

```typescript
pool: {
  max: isProduction ? 20 : 5,      // 最大连接数
  min: isProduction ? 5 : 0,       // 最小连接数
  acquire: 30000,                  // 获取连接超时时间(ms)
  idle: 10000,                     // 连接空闲时间(ms)
}
```

## 🛠️ 数据库管理

### 命令行工具

项目提供了数据库管理脚本：

```bash
# 检查数据库状态
node scripts/db-manage.js status

# 列出所有表
node scripts/db-manage.js tables

# 查看用户数据
node scripts/db-manage.js users

# 添加测试数据
node scripts/db-manage.js seed
```

### 手动管理（PostgreSQL命令行）

```bash
# 连接数据库
/opt/homebrew/opt/postgresql@15/bin/psql -d blog_dev

# 查看所有数据库
\l

# 查看当前数据库所有表
\dt

# 查看表结构
\d users

# 退出
\q
```

## 🖥️ 可视化工具

### 推荐工具

1. **Navicat Premium**（已安装）
   - 路径：`/Applications/Navicat Premium.app`
   - 支持：PostgreSQL, MySQL, SQLite等

2. **TablePlus**（备用）
   - 下载：https://tableplus.com/download
   - 免费版功能足够

### Navicat连接配置

```
连接名: Blog Dev
类型: PostgreSQL
主机: localhost
端口: 5432
数据库: blog_dev
用户名: mac
密码: (留空)
```

## 📈 数据模型

### 当前表结构

#### users 表（用户表）

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 模型定义

```typescript
// src/models/user.model.ts
@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @AllowNull(false)
  @Column(DataType.STRING(50))
  username!: string;

  // ... 其他字段
}
```

## 🔒 安全注意事项

### 生产环境配置

1. **修改默认密码**：生产环境必须设置强密码
2. **使用环境变量**：敏感信息不要硬编码
3. **限制网络访问**：只允许应用服务器访问数据库
4. **定期备份**：设置自动备份策略
5. **监控日志**：监控数据库性能和错误日志

### 密码安全

- 使用bcrypt哈希存储密码
- 密码强度要求：至少8位，包含字母和数字
- 定期要求用户更改密码

## 🚨 故障排除

### 常见问题

#### 1. 数据库连接失败

```bash
# 检查PostgreSQL服务是否运行
ps aux | grep postgres

# 检查端口是否监听
lsof -i :5432

# 测试连接
/opt/homebrew/opt/postgresql@15/bin/psql -d blog_dev
```

#### 2. 权限问题

```bash
# 创建数据库用户
createuser -s mac

# 授予权限
GRANT ALL PRIVILEGES ON DATABASE blog_dev TO mac;
```

#### 3. 内存不足

```bash
# 查看数据库大小
SELECT pg_size_pretty(pg_database_size('blog_dev'));

# 清理缓存
VACUUM;
```

### 日志查看

```bash
# PostgreSQL日志位置
/opt/homebrew/var/log/postgresql@15.log

# 应用日志位置
backend/logs/
```

## 📚 扩展阅读

### 性能优化

1. **索引优化**：为常用查询字段添加索引
2. **查询优化**：避免N+1查询问题
3. **连接池调优**：根据并发量调整连接池大小
4. **缓存策略**：考虑添加Redis缓存层

### 备份与恢复

```bash
# 备份数据库
pg_dump -h localhost -U mac blog_dev > backup_$(date +%Y%m%d).sql

# 恢复数据库
psql -h localhost -U mac blog_dev < backup.sql
```

### 迁移指南

从开发环境迁移到生产环境：

1. 导出开发环境数据
2. 在生产环境创建数据库
3. 导入数据
4. 更新环境变量
5. 测试连接

## 📞 支持与帮助

### 获取帮助

1. **查看日志**：`backend/logs/` 目录
2. **检查配置**：`.env` 和 `src/config/database.ts`
3. **测试连接**：使用 `scripts/db-manage.js status`

### 联系维护者

- 项目文档：`docs/` 目录
- 问题反馈：GitHub Issues
- 紧急支持：系统管理员

---

_最后更新：2026-03-11_
_文档版本：v1.0.0_
