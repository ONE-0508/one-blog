## 项目结构与性能最佳实践（基于 Vercel React Best Practices）

为了后续在 Vercel 上部署博客应用，并保持良好的性能与可维护性，建议在 `src` 目录下按职责拆分模块，例如：

```text
src/
  main.tsx        # 入口（保留简单挂载逻辑）
  App.tsx         # 顶层应用壳 / 路由入口
  components/     # 纯展示型和可复用 UI 组件（避免 barrel-import）
  pages/          # 页面级组件（如 HomePage、PostDetailPage 等）
  layouts/        # 页面布局组件（导航栏、页脚等）
  hooks/          # 自定义 hook（数据获取、业务逻辑抽象）
  lib/            # 与 UI 无关的业务/工具函数
  styles/         # 全局样式或 Tailwind/设计系统相关配置
```

结合 `vercel-react-best-practices` 规则，后续在实现页面和组件时，请优先注意：

- **bundle-barrel-imports**：避免为每个目录创建 `index.ts` 聚合导出，页面/组件直接从具体文件路径导入，以减少无意间引入整包代码。
- **bundle-dynamic-imports / bundle-conditional**：体积较大的页面或与首屏无关的模块，优先使用动态导入（如 React.lazy 或路由级懒加载）并按需加载。
- **Eliminating Waterfalls / Server-Side Performance**：数据获取时尽量并行请求，提前启动 Promise，避免在组件树中产生串行瀑布。

当前 `tsconfig` 已开启严格模式，`eslint.config.js` 也已更新为类型感知配置，可以在本地运行：

```bash
pnpm lint
```

来持续检查是否遵守这些规则。后续在具体页面/组件开发阶段，可再根据博客 PRD 细化目录和拆分策略。 

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
