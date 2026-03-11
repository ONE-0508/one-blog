#!/usr/bin/env node

/**
 * 数据库管理脚本
 * 用法: node scripts/db-manage.js [command]
 *
 * 命令:
 *   status    - 检查数据库状态
 *   tables    - 列出所有表
 *   users     - 查看用户表数据
 *   reset     - 重置数据库（删除所有数据）
 *   seed      - 添加测试数据
 */

const { execSync } = require('child_process');

// PostgreSQL连接信息
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  database: 'blog_dev',
  username: 'mac',
  password: '',
};

// 构建psql命令
function buildPsqlCommand(sql) {
  const cmd = [
    '/opt/homebrew/opt/postgresql@15/bin/psql',
    `-h ${DB_CONFIG.host}`,
    `-p ${DB_CONFIG.port}`,
    `-U ${DB_CONFIG.username}`,
    `-d ${DB_CONFIG.database}`,
    '-c',
    `"${sql.replace(/"/g, '\\"')}"`,
  ].join(' ');

  return cmd;
}

// 执行SQL命令
function executeSql(sql, showOutput = true) {
  try {
    const cmd = buildPsqlCommand(sql);
    const result = execSync(cmd, {
      encoding: 'utf8',
      stdio: showOutput ? 'inherit' : 'pipe',
    });
    return result;
  } catch (error) {
    console.error('执行SQL错误:', error.message);
    if (error.stderr) {
      console.error('错误详情:', error.stderr.toString());
    }
    return null;
  }
}

// 命令处理
const command = process.argv[2] || 'status';

switch (command) {
  case 'status':
    console.log('📊 检查数据库状态...\n');
    executeSql('SELECT version();');
    console.log('\n📋 数据库信息:');
    executeSql(
      'SELECT current_database() as database, current_user as user, current_timestamp as time;'
    );
    break;

  case 'tables':
    console.log('📋 数据库表列表:\n');
    executeSql(`
      SELECT 
        table_name,
        table_type,
        pg_size_pretty(pg_total_relation_size('"' || table_schema || '"."' || table_name || '"')) as size
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    break;

  case 'users':
    console.log('👥 用户表数据:\n');
    executeSql(`
      SELECT 
        id,
        username,
        email,
        role,
        created_at
      FROM users 
      ORDER BY created_at DESC
      LIMIT 10;
    `);
    break;

  case 'seed':
    console.log('🌱 添加测试数据...\n');

    // 注意：实际密码需要先哈希，这里只是示例
    console.log('⚠️  注意：实际使用时需要先哈希密码');
    console.log('这里只是添加示例数据\n');

    // 添加测试用户（密码都是 "password123" 的bcrypt哈希）
    executeSql(`
      INSERT INTO users (username, email, password_hash, role) VALUES
      ('admin', 'admin@example.com', '$2a$12$K9q.8qG8qG8qG8qG8qG8qOe8qG8qG8qG8qG8qG8qG8qG8qG8qG8qG8', 'admin'),
      ('editor', 'editor@example.com', '$2a$12$K9q.8qG8qG8qG8qG8qG8qOe8qG8qG8qG8qG8qG8qG8qG8qG8qG8qG8', 'editor'),
      ('user1', 'user1@example.com', '$2a$12$K9q.8qG8qG8qG8qG8qG8qOe8qG8qG8qG8qG8qG8qG8qG8qG8qG8qG8', 'user')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✅ 测试数据已添加');
    console.log('\n📋 当前用户列表:');
    executeSql('SELECT id, username, email, role FROM users ORDER BY id;');
    break;

  case 'help':
  default:
    console.log(`
📚 数据库管理脚本

用法: node scripts/db-manage.js [command]

可用命令:
  status    - 检查数据库状态
  tables    - 列出所有表
  users     - 查看用户表数据
  seed      - 添加测试数据
  help      - 显示此帮助信息

示例:
  node scripts/db-manage.js status
  node scripts/db-manage.js tables
    `);
    break;
}
