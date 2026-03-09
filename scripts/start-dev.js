#!/usr/bin/env node

/**
 * 开发环境启动脚本
 * 同时启动后端和前端的开发服务器
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// 日志函数
const log = {
  info: (msg, service = 'MAIN') => console.log(`${colors.cyan}[${service}]${colors.reset} ${msg}`),
  success: (msg, service = 'MAIN') => console.log(`${colors.green}[${service}]${colors.reset} ${msg}`),
  warn: (msg, service = 'MAIN') => console.log(`${colors.yellow}[${service}]${colors.reset} ${msg}`),
  error: (msg, service = 'MAIN') => console.log(`${colors.red}[${service}]${colors.reset} ${msg}`),
  backend: (msg) => console.log(`${colors.blue}[BACKEND]${colors.reset} ${msg}`),
  frontend: (msg) => console.log(`${colors.magenta}[FRONTEND]${colors.reset} ${msg}`),
};

// 检查目录是否存在
function checkDirectory(dir, name) {
  if (!fs.existsSync(dir)) {
    log.error(`${name}目录不存在: ${dir}`, 'MAIN');
    return false;
  }
  return true;
}

// 启动服务
function startService(serviceName, command, args, cwd, color) {
  return new Promise((resolve, reject) => {
    const serviceLog = (msg) => console.log(`${color}[${serviceName}]${colors.reset} ${msg}`);
    
    serviceLog(`正在启动 ${serviceName}...`);
    serviceLog(`命令: ${command} ${args.join(' ')}`);
    serviceLog(`目录: ${cwd}`);
    
    const child = spawn(command, args, {
      cwd,
      stdio: 'pipe',
      shell: true,
      env: { ...process.env, FORCE_COLOR: '1' },
    });

    // 处理输出
    child.stdout.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          serviceLog(line);
        }
      });
    });

    child.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');
      lines.forEach(line => {
        if (line.trim()) {
          serviceLog(`${colors.yellow}${line}${colors.reset}`);
        }
      });
    });

    child.on('close', (code) => {
      if (code === 0) {
        serviceLog(`${serviceName} 正常退出`);
        resolve();
      } else {
        serviceLog(`${serviceName} 异常退出，代码: ${code}`);
        reject(new Error(`${serviceName} 启动失败，退出代码: ${code}`));
      }
    });

    child.on('error', (err) => {
      serviceLog(`${serviceName} 启动错误: ${err.message}`);
      reject(err);
    });

    // 返回子进程引用，以便后续控制
    resolve(child);
  });
}

// 主函数
async function main() {
  log.info('🚀 开始启动博客项目开发环境...');
  log.info('='.repeat(50));

  // 检查项目结构
  const backendDir = path.join(__dirname, '..', 'backend');
  const frontendDir = path.join(__dirname, '..', 'frontend');

  if (!checkDirectory(backendDir, '后端') || !checkDirectory(frontendDir, '前端')) {
    process.exit(1);
  }

  log.info('项目结构检查通过');
  log.info(`后端目录: ${backendDir}`);
  log.info(`前端目录: ${frontendDir}`);
  log.info('='.repeat(50));

  try {
    // 启动后端
    const backendProcess = await startService(
      'BACKEND',
      'npm',
      ['run', 'dev'],
      backendDir,
      colors.blue
    );

    // 启动前端
    const frontendProcess = await startService(
      'FRONTEND',
      'pnpm',
      ['dev'],
      frontendDir,
      colors.magenta
    );

    log.success('✅ 开发环境启动成功！');
    log.info('='.repeat(50));
    log.info('服务信息:');
    log.info(`后端API: ${colors.cyan}http://localhost:3001${colors.reset}`);
    log.info(`前端应用: ${colors.cyan}http://localhost:5173${colors.reset}`);
    log.info('='.repeat(50));
    log.info('按 Ctrl+C 停止所有服务');

    // 处理退出信号
    const shutdown = () => {
      log.warn('正在停止所有服务...');
      if (backendProcess && backendProcess.kill) backendProcess.kill();
      if (frontendProcess && frontendProcess.kill) frontendProcess.kill();
      log.success('所有服务已停止');
      process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

  } catch (error) {
    log.error(`启动失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main().catch((error) => {
    log.error(`未处理的错误: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { main };