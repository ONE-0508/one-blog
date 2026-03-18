# API 设计文档

## 文档概述

本文档定义了个人博客项目后端API的详细规范，包括端点设计、请求/响应格式、错误处理等。

---

## 1. API 基础信息

### 1.1 基础URL
```
开发环境: http://localhost:3001
生产环境: https://api.yourblog.com
```

### 1.2 API版本
```
/api/v1
```

### 1.3 内容类型
- 请求: `application/json`
- 响应: `application/json`

### 1.4 认证方式
- Bearer Token (JWT)
- 通过Authorization头传递

### 1.5 响应时间
- 95%的请求 < 200ms
- 平均响应时间 < 100ms

---

## 2. 通用约定

### 2.1 请求头
```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-API-Version: 1.0.0
X-Request-ID: <uuid>  # 用于请求追踪
```

### 2.2 响应头
```http
Content-Type: application/json
X-API-Version: 1.0.0
X-Request-ID: <uuid>
Cache-Control: no-cache
```

### 2.3 分页参数
| 参数 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| page | integer | 1 | 页码（从1开始） |
| limit | integer | 10 | 每页数量（1-100） |
| sort | string | -createdAt | 排序字段（+升序，-降序） |
| fields | string | - | 返回字段（逗号分隔） |

### 2.4 过滤参数
- 支持字段精确匹配：`?status=published`
- 支持范围查询：`?createdAt[gte]=2024-01-01`
- 支持包含查询：`?tags[in]=javascript,typescript`
- 支持搜索：`?q=关键字`

---

## 3. 认证与授权

### 3.1 用户注册

**端点**: `POST /api/v1/auth/register`

**请求体**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "displayName": "John Doe"
}
```

**验证规则**:
- username: 3-50字符，字母数字下划线
- email: 有效邮箱格式
- password: 8-100字符，包含大小写字母和数字
- displayName: 1-100字符

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 900
    }
  }
}
```

**错误响应**:
- 400: 验证失败
- 409: 用户名或邮箱已存在

### 3.2 用户登录

**端点**: `POST /api/v1/auth/login`

**请求体**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

或
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "role": "user",
      "avatarUrl": null
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token",
      "expiresIn": 900
    }
  }
}
```

**错误响应**:
- 400: 验证失败
- 401: 用户名/密码错误
- 429: 登录尝试过多

### 3.3 刷新令牌

**端点**: `POST /api/v1/auth/refresh`

**请求头**:
```http
Authorization: Bearer <refresh_token>
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token",
    "expiresIn": 900
  }
}
```

### 3.4 获取当前用户

**端点**: `GET /api/v1/auth/me`

**认证**: 需要Bearer Token

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "displayName": "John Doe",
      "role": "user",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "Full-stack developer",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 3.5 修改密码

**端点**: `PUT /api/v1/auth/password`

**认证**: 需要Bearer Token

**请求体**:
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

---

## 4. 用户管理

### 4.1 获取用户列表（管理员）

**端点**: `GET /api/v1/users`

**认证**: 需要Bearer Token，需要admin角色

**查询参数**:
- `page`, `limit`, `sort`
- `role`: 按角色过滤
- `isActive`: 按激活状态过滤
- `q`: 搜索用户名或邮箱

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "john_doe",
        "email": "john@example.com",
        "displayName": "John Doe",
        "role": "user",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 4.2 获取单个用户

**端点**: `GET /api/v1/users/:id`

**认证**: 需要Bearer Token（自己或管理员）

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "displayName": "John Doe",
      "avatarUrl": "https://example.com/avatar.jpg",
      "bio": "Full-stack developer",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4.3 更新用户信息

**端点**: `PATCH /api/v1/users/:id`

**认证**: 需要Bearer Token（自己或管理员）

**请求体**:
```json
{
  "displayName": "John Updated",
  "avatarUrl": "https://new-avatar.jpg",
  "bio": "Updated bio text"
}
```

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "displayName": "John Updated",
      "avatarUrl": "https://new-avatar.jpg",
      "bio": "Updated bio text",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### 4.4 删除用户（停用）

**端点**: `DELETE /api/v1/users/:id`

**认证**: 需要Bearer Token（自己或管理员）

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "User deactivated successfully"
  }
}
```

---

## 5. 文章管理

### 5.1 获取文章列表

**端点**: `GET /api/v1/articles`

**查询参数**:
- `page`, `limit`, `sort`
- `status`: published/draft/archived
- `category`: 分类ID或slug
- `tag`: 标签名称
- `author`: 作者ID
- `q`: 搜索标题和内容

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "uuid",
        "title": "Getting Started with TypeScript",
        "slug": "getting-started-with-typescript",
        "excerpt": "Learn TypeScript basics...",
        "coverImage": "https://example.com/cover.jpg",
        "status": "published",
        "viewCount": 150,
        "likeCount": 25,
        "author": {
          "id": "uuid",
          "displayName": "John Doe",
          "avatarUrl": "https://example.com/avatar.jpg"
        },
        "categories": [
          {
            "id": "uuid",
            "name": "Programming",
            "slug": "programming"
          }
        ],
        "tags": ["typescript", "javascript"],
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 5.2 获取单篇文章

**端点**: `GET /api/v1/articles/:idOrSlug`

**路径参数**:
- `idOrSlug`: 文章ID或slug

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "title": "Getting Started with TypeScript",
      "slug": "getting-started-with-typescript",
      "content": "# Full article content in markdown...",
      "excerpt": "Learn TypeScript basics...",
      "coverImage": "https://example.com/cover.jpg",
      "status": "published",
      "viewCount": 151,
      "likeCount": 25,
      "author": {
        "id": "uuid",
        "username": "john_doe",
        "displayName": "John Doe",
        "avatarUrl": "https://example.com/avatar.jpg"
      },
      "categories": [
        {
          "id": "uuid",
          "name": "Programming",
          "slug": "programming",
          "description": "Programming related articles"
        }
      ],
      "tags": [
        {
          "id": "uuid",
          "name": "typescript",
          "slug": "typescript"
        }
      ],
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5.3 创建文章

**端点**: `POST /api/v1/articles`

**认证**: 需要Bearer Token

**请求体**:
```json
{
  "title": "New Article Title",
  "content": "# Article content in markdown",
  "excerpt": "Short excerpt of the article",
  "coverImage": "https://example.com/cover.jpg",
  "status": "draft",
  "categoryIds": ["category-uuid-1", "category-uuid-2"],
  "tags": ["javascript", "nodejs"]
}
```

**成功响应** (201 Created):
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "title": "New Article Title",
      "slug": "new-article-title",
      "content": "# Article content in markdown",
      "excerpt": "Short excerpt of the article",
      "coverImage": "https://example.com/cover.jpg",
      "status": "draft",
      "viewCount": 0,
      "likeCount": 0,
      "authorId": "user-uuid",
      "publishedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 5.4 更新文章

**端点**: `PUT /api/v1/articles/:id`

**认证**: 需要Bearer Token（作者或管理员）

**请求体**: 同创建文章

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "article": {
      "id": "uuid",
      "title": "Updated Article Title",
      "slug": "updated-article-title",
      "content": "# Updated content",
      "excerpt": "Updated excerpt",
      "status": "published",
      "updatedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

### 5.5 删除文章

**端点**: `DELETE /api/v1/articles/:id`

**认证**: 需要Bearer Token（作者或管理员）

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "message": "Article deleted successfully"
  }
}
```

### 5.6 点赞文章

**端点**: `POST /api/v1/articles/:id/like`

**认证**: 需要Bearer Token

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "liked": true,
    "likeCount": 26
  }
}
```

**取消点赞**: 再次调用同一端点

---

## 6. 分类管理

### 6.1 获取分类列表

**端点**: `GET /api/v1/categories`

**查询参数**:
- `page`, `limit`, `sort`
- `q`: 搜索分类名称

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "uuid",
        "name": "Programming",
        "slug": "programming",
        "description": "Programming related articles",
        "articleCount": 25,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### 6.2 创建分类（管理员）

**端点**: `POST /api/v1/categories`

**认证**: 需要Bearer Token，需要admin角色

**请求体**:
```json
{
  "name": "New Category",
  "slug": "new-category",
  "description": "Category description"
}
```

### 6.3 更新分类（管理员）

**端点**: `PUT /api/v1/categories/:id`

**认证**: 需要Bearer Token，需要admin角色

### 6.4 删除分类（管理员）

**端点**: `DELETE /api/v1/categories/:id`

**认证**: 需要Bearer Token，需要admin角色

**注意**: 删除分类时，关联的文章不会被删除，只是移除关联关系

---

## 7. 标签管理

### 7.1 获取标签列表

**端点**: `GET /api/v1/tags`

**查询参数**:
- `page`, `limit`, `sort`
- `q`: 搜索标签名称
- `popular`: true（按使用频率排序）

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "tags": [
      {
        "id": "uuid",
        "name": "javascript",
        "slug": "javascript",
        "articleCount": 50,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2
    }
  }
}
```

### 7.2 创建标签（管理员）

**端点**: `POST /api/v1/tags`

**认证**: 需要Bearer Token，需要admin角色

**请求体**:
```json
{
  "name": "New Tag",
  "slug": "new-tag"
}
```

---

## 8. 评论管理

### 8.1 获取文章评论

**端点**: `GET /api/v1/articles/:articleId/comments`

**查询参数**:
- `page`, `limit`, `sort`
- `parentId`: 获取子评论
- `approved`: true/false（管理员）

**成功响应** (200 OK):
```json
{
  "success": true,
  "data": {
    "comments": [
      {
