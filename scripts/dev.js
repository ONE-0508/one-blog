#!/usr/bin/env node

/**
 * 简化版开发环境启动脚本
 * 使用concurrently同时启动前后端
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 启动博客项目开发环境...');
console.log('='.repeat(50));

// 使用concurrently启动
const concurrently = path.join(__dirname, '..', 'node_modules', '.bin', 'concurrently');

const args = [
  '--kill-others-on-fail',
  '--names', 'BACKEND,FRONTEND',
  '--prefix', '[{name}]',
  '--prefix-colors', 'bgBlue.bold,bgMagenta.bold',
  '"npm run dev:backend"',
  '"npm run dev:frontend"'
];

console.log('启动命令:', `concurrently ${args.join(' ')}`);
console.log('='.repeat(50));
console.log('服务信息:');
console.log('后端API: http://localhost:3001');
console.log('前端应用: http://localhost:5173');
console.log('='.repeat(50));

const child = spawn(concurrently, args, {
  stdio: 'inherit',
  shell: true,
});

child.on('close', (code) => {
  if (code !== 0) {
    console.error(`开发环境启动失败，退出代码: ${code}`);
  }
  process.exit(code);
});

child.on('error', (err) => {
  console.error('启动错误:', err.message);
  process.exit(1);
});