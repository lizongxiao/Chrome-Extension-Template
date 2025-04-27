/**
 * 扩展开发热重载服务器
 * 
 * 该脚本用于启动Chrome扩展开发的热重载环境，实现以下功能：
 * 1. 启动WebSocket服务器与扩展客户端通信
 * 2. 运行Vite构建并监视文件变化
 * 3. 编译开发脚本（用于热重载）
 * 4. 修改manifest.json注入热重载代码
 * 5. 当源文件变更时通知扩展客户端重新加载
 * 
 * 使用方式: node scripts/dev.js
 * 
 */

import { createServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';
import { exec, spawn } from 'child_process';
import chokidar from 'chokidar';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 启动WebSocket开发服务器
 * 负责与扩展客户端建立WebSocket连接
 * 
 * @returns {Promise<Object>} 包含notifyUpdate函数和服务器端口的对象
 */
async function startDevServer() {
  const { startDevServer: startServer } = await import('./dev-server.js');
  return startServer();
}

/**
 * 主函数 - 启动整个开发环境
 * 按顺序执行:
 * 1. 启动WebSocket服务器
 * 2. 创建客户端常量文件
 * 3. 启动构建进程
 * 4. 编译开发脚本
 * 5. 修改manifest
 * 6. 监听文件变化
 */

// src目录下的文件所有文件
const watchFiles = [
  'src/**/*.ts',
  'src/**/*.tsx',
  'src/**/*.js',
  'src/**/*.jsx',
  'src/**/*.vue',
  'src/**/*.css',
  'src/**/*.scss',
  'src/**/*.html',
  'src/**/*.json',
  'src/**/*.png',
  'src/**/*.jpg',
  'src/**/*.jpeg',
  'src/**/*.gif',
  'src/**/*.svg',
]

async function main() {
  // 设置环境变量
  process.env.NODE_ENV = 'development';

  // 启动WebSocket服务器
  const { notifyUpdate, port } = await startDevServer();

  // 创建一个常量定义文件，供客户端使用
  const constantsDir = resolve(__dirname, '../src/dev');
  const constantsFile = resolve(constantsDir, 'constants.ts');

  if (!fs.existsSync(constantsDir)) {
    fs.mkdirSync(constantsDir, { recursive: true });
  }

  // 写入WebSocket连接所需的常量
  fs.writeFileSync(
    constantsFile,
    `export const DEV_SERVER_PORT = ${port};
export const EXTENSION_NAME = 'web-update-alerts';
export const UPDATE_CONTENT = 'UPDATE_CONTENT';
export const RELOAD = 'RELOAD';`
  );

  // 使用exec替代spawn来运行pnpm命令
  console.log('⚙️  启动Vite构建扩展... ');
  const buildProcess = exec('npx vite build --watch', {
    windowsHide: false
  });

  let buildProcessFailed = false;

  // 监听构建输出和错误
  buildProcess.stderr.on('data', (data) => {
    console.error(`🔴 构建错误 : ${data}`);
    buildProcessFailed = true;
  });

  buildProcess.stdout.on('data', (data) => {
    // console.log(`🔄 构建输出 : ${data}`);
  });

  buildProcess.on('error', (error) => {
    console.error('🔴 构建过程启动失败 :', error);
    process.exit(1);
  });

  // 等待初始构建完成
  console.log('⌛️ 等待初始构建完成... ');
  await new Promise(resolve => setTimeout(resolve, 10000));

  if (buildProcessFailed) {
    console.error('🔴 构建过程失败，终止热重载 ');
    process.exit(1);
  }

  // 构建开发脚本
  console.log('⚙️  编译开发脚本... ');
  await new Promise((resolve, reject) => {
    exec('node scripts/build-dev-scripts.js', (error) => {
      if (error) {
        console.error('🔴 编译开发脚本失败 :', error);
        reject(error);
        return;
      }
      console.log('✅ 开发脚本编译完成 ');
      resolve();
    });
  });

  // 修改manifest添加热重载脚本
  await new Promise((resolve, reject) => {
    exec('node scripts/modify-manifest.js --dev', (error) => {
      if (error) {
        console.error('🔴 修改manifest失败 :', error);
        reject(error);
        return;
      }
      console.log('✅ 热重载脚本已添加 ');
      resolve();
    });
  });

  // 监听文件变化 - 仅监听关键文件以触发热重载通知（可根据需要添加更多文件）
  const watcher = chokidar.watch(watchFiles, {
    ignored: [
      '**/node_modules/**',
      '**/dist/**',
      '**/DumpStack.log*',
      'C:\\DumpStack.log.tmp',
      '**/System Volume Information/**'
    ],
    ignoreInitial: true
  });

  let notifyTimeout;

  /**
   * 文件变更处理函数
   * 1. 防抖处理避免频繁触发
   * 2. 重新编译开发脚本
   * 3. 更新manifest
   * 4. 通知客户端更新
   */
  watcher.on('change', (path) => {
    console.log(`🔄 文件变更 : ${path}`);

    // 防抖：避免短时间内多次通知
    clearTimeout(notifyTimeout);
    notifyTimeout = setTimeout(async () => {
      try {
        // 编译开发脚本
        await new Promise((resolve, reject) => {
          exec('node scripts/build-dev-scripts.js', (error) => {
            if (error) {
              console.error('🔴 编译开发脚本失败 :', error);
              reject(error);
              return;
            }
            resolve();
          });
        });

        // 修改manifest
        await new Promise((resolve, reject) => {
          exec('node scripts/modify-manifest.js --dev', (error) => {
            if (error) {
              console.error('🔴 修改manifest失败 :', error);
              reject(error);
              return;
            }
            resolve();
          });
        });

        // 通知客户端更新
        notifyUpdate();
        // console.log('✅ 已通知客户端更新 ');
      } catch (error) {
        console.error('🔴 更新过程中出错 :', error);
      }
    }, 1000);
  });

  console.log('⌛️ 文件监视器已启动，等待文件变更... ');
  console.log('🐛 请加载扩展并打开带有扩展内容的网页(或刷新页面)以建立WebSocket连接 ');

  // 处理进程退出
  ['SIGINT', 'SIGTERM'].forEach(signal => {
    process.on(signal, async () => {
      try {
        buildProcess.kill();
        process.exit(0);
      } catch (e) {
        console.error('🔴 关闭时出错 :', e);
        process.exit(1);
      }
    });
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}); 