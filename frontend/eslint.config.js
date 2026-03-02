import js from '@eslint/js'
import globals from 'globals'
import reactDom from 'eslint-plugin-react-dom'
import reactX from 'eslint-plugin-react-x'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', '.pnpm-store']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      // 启用类型感知规则，以便在构建阶段提前发现更多问题
      tseslint.configs.recommendedTypeChecked,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      // 启用 React / React DOM 专用规则
      reactX.configs['recommended-typescript'],
      reactDom.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ['./tsconfig.app.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
