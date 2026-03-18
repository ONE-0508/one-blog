# ONE Blog

个人博客全栈项目，包含：

- 前台博客站点（`frontend`）：文章阅读、详情、归档分页等
- 后端 API 服务（`backend`）：鉴权、文章管理、数据持久化
- 管理端（`admin`）：文章新增/编辑与后台管理页面

---

## 1. 技术栈

### 前端（`frontend`）

- React 19 + TypeScript
- Vite
- TailwindCSS 4
- React Router 7
- React Markdown + rehype-highlight（Markdown/代码高亮）

### 后端（`backend`）

- Node.js + TypeScript
- Express
- Sequelize
- SQLite（开发环境）
- JWT 鉴权

### 管理端（`admin`）

- React 17 + TypeScript
- Arco Design Pro
- Vite
- Markdown 编辑器（`@uiw/react-md-editor`）

---

## 2. 仓库结构

```bash
.
├─ frontend/                 # 博客前台
├─ backend/                  # API 服务
├─ admin/                    # 后台管理端
├─ prd/                      # 需求相关文档
├─ scripts/                  # 根目录开发脚本
├─ 个人博客产品需求文档-PRD.md
└─ README.md
```

---

## 3. 当前核心功能

- 用户注册/登录（前后端联动）
- 文章列表与详情页
- 首页展示最新文章（最多 3 条）
- 全部文章页（分页）
- 文章详情 Markdown 渲染
- 代码块语法高亮（按语言）
- 管理端文章新增/编辑（Markdown 富文本）

---

## 4. 本地开发

## 4.1 环境要求

- Node.js 18+
- pnpm（前端与管理端推荐）
- npm（后端可直接使用）

> 建议在仓库根目录执行命令：`/Users/mac/code/blog`

### 4.2 安装依赖

```bash
# 根目录（用于根脚本与 husky/lint-staged）
npm install

# 前端
cd frontend && pnpm install

# 后端
cd ../backend && npm install

# 管理端
cd ../admin && pnpm install
```

### 4.3 启动服务

#### 方式一：根目录一键启动（前端 + 后端）

```bash
# 在项目根目录
npm run dev
```

#### 方式二：分别启动

```bash
# 前端
cd frontend && pnpm dev

# 后端
cd backend && npm run dev

# 管理端（按需）
cd admin && pnpm dev
```

常见访问地址（以终端实际输出为准）：

- 前端：`http://localhost:5173`
- 管理端：`http://localhost:3000` 或 `http://localhost:5174`
- 后端：`http://localhost:3001`（示例）

---

## 5. 质量检查

### 根目录统一检查

```bash
npm run lint
npm run type-check
npm run format
npm run check:all
```

### 子项目检查

```bash
# frontend
cd frontend && pnpm lint && pnpm type-check

# backend
cd backend && npm run lint && npm run type-check

# admin
cd admin && pnpm eslint
```

---

## 6. 关键说明

- `frontend` 与 `backend` 已纳入根 `workspaces`
- `admin` 为独立子项目（当前未纳入根 workspaces）
- `admin` 的安装流程已移除强制 husky prepare，避免在子目录安装时报 `.git can't be found`

---

## 7. 相关文档

- PRD：`个人博客产品需求文档-PRD.md`
- 前端架构：`frontend/docs/前端架构设计文档.md`
- 前端页面设计：`frontend/docs/前端页面设计文档.md`
- 后端说明：`backend/README.md`

---

## 8. 后续建议

- 统一根目录/子项目包管理器（当前 npm + pnpm 混用）
- 补充 CI（lint + type-check + build）
- 为文章详情补充目录（TOC）与锚点跳转
