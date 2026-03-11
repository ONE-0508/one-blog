# Blog Backend API

个人博客项目的后端API服务，基于Node.js + Express + TypeScript构建。

## 技术栈

- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Authentication**: JWT + bcryptjs
- **Validation**: Joi + express-validator
- **Logging**: Winston + Daily Rotate File
- **Testing**: Jest + Supertest
- **Code Quality**: ESLint + TypeScript

## 项目结构

```
backend/
├── src/
│   ├── config/          # 配置文件
│   │   └── logger.ts    # 日志配置
│   ├── controllers/     # 控制器层
│   ├── middlewares/     # 中间件
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── models/          # 数据模型
│   ├── repositories/    # 数据访问层
│   ├── routes/          # 路由定义
│   ├── services/        # 业务逻辑层
│   ├── utils/           # 工具函数
│   │   └── AppError.ts  # 自定义错误类
│   ├── validators/      # 数据验证器
│   ├── app.ts           # Express应用配置
│   └── server.ts        # 服务器入口
├── tests/               # 测试文件
│   ├── unit/           # 单元测试
│   ├── integration/    # 集成测试
│   └── setup.ts        # 测试配置
├── docs/               # 项目文档
├── logs/               # 日志文件（自动生成）
└── dist/               # 编译输出（自动生成）
```

## 快速开始

### 环境要求

- Node.js 18+
- npm 9+ 或 pnpm 8+
- PostgreSQL 15+（开发环境）
- SQLite 3+（测试环境）

### 安装依赖

```bash
cd backend
npm install
```

### 数据库安装（开发环境）

#### macOS (使用Homebrew)

```bash
# 安装PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 创建数据库
/opt/homebrew/opt/postgresql@15/bin/createdb blog_dev
```

#### 其他平台

参考 [DATABASE.md](docs/DATABASE.md) 中的安装指南。

### 环境配置

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置必要的环境变量。

**重要**：确保数据库配置正确：

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=blog_dev
DB_USER=你的系统用户名（如：mac）
DB_PASSWORD=
```

### 开发模式

```bash
# 启动开发服务器（热重载）
npm run dev

# 代码检查
npm run lint

# 类型检查
npm run type-check
```

### 数据库管理

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

# 查看帮助
node scripts/db-manage.js help
```

详细数据库配置请参考 [DATABASE.md](docs/DATABASE.md)。

### 生产模式

```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

### 测试

```bash
# 运行所有测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage
```

## API 设计规范

### RESTful API 约定

- **资源命名**: 使用复数名词（如 `/articles`, `/comments`）
- **HTTP方法**:
  - `GET`: 获取资源
  - `POST`: 创建资源
  - `PUT`: 更新整个资源
  - `PATCH`: 部分更新资源
  - `DELETE`: 删除资源
- **版本控制**: 所有API使用 `/api/v1` 前缀
- **响应格式**: 统一JSON格式

### 响应格式

**成功响应**:

```json
{
  "success": true,
  "data": {
    // 实际数据
  },
  "meta": {
    // 分页信息等
  }
}
```

**错误响应**:

```json
{
  "success": false,
  "error": {
    "message": "错误描述",
    "code": 400,
    "details": {
      // 详细错误信息
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### 状态码

- `200`: 成功
- `201`: 创建成功
- `400`: 客户端错误
- `401`: 未授权
- `403`: 禁止访问
- `404`: 资源不存在
- `422`: 验证失败
- `429`: 请求过多
- `500`: 服务器错误

## 数据库设计

### 核心表结构

```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  role VARCHAR(20) DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章表
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  author_id UUID REFERENCES users(id),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 标签表
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 文章-分类关联表
CREATE TABLE article_categories (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, category_id)
);

-- 文章-标签关联表
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- 评论表
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 笔记表
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT false,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 作品表
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image TEXT,
  demo_url TEXT,
  source_url TEXT,
  technologies TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 安全措施

### 1. 身份验证

- JWT令牌认证
- 密码哈希（bcrypt）
- 令牌刷新机制

### 2. 输入验证

- 请求体验证
- 参数验证
- 文件类型和大小限制

### 3. 安全中间件

- Helmet（安全HTTP头）
- CORS配置
- 速率限制
- SQL注入防护

### 4. 错误处理

- 统一错误响应
- 生产环境错误屏蔽
- 详细的错误日志

## 部署

### Docker部署

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建项目
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动命令
CMD ["npm", "start"]
```

### PM2部署

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start dist/server.js --name blog-api

# 查看日志
pm2 logs blog-api

# 监控
pm2 monit
```

## 监控与日志

### 日志级别

- `error`: 错误日志
- `warn`: 警告日志
- `info`: 信息日志
- `http`: HTTP请求日志
- `debug`: 调试日志

### 日志文件

- `logs/error-YYYY-MM-DD.log`: 错误日志
- `logs/combined-YYYY-MM-DD.log`: 所有日志

## 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建Pull Request

## 许可证

MIT
