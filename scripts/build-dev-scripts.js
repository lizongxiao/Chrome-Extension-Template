/**
 * 开发脚本构建工具
 * 
 * 该脚本使用esbuild编译热重载所需的开发脚本，
 * 包括后台脚本和内容脚本，提供给Chrome扩展使用。
 * 
 * 功能：
 * 1. 检查必要文件和目录
 * 2. 使用esbuild编译TypeScript文件
 * 3. 输出编译结果到扩展目录
 */

import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 构建开发脚本
 * 
 * 编译热重载功能所需的TypeScript文件，
 * 生成可在Chrome扩展中使用的JavaScript文件。
 */
async function buildDevScripts() {
  try {
    // 确保目标目录存在
    const outputDir = resolve(__dirname, '../dist/src/dev');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // 检查constants.ts文件是否存在
    const constantsFile = resolve(__dirname, '../src/dev/constants.ts');
    if (!fs.existsSync(constantsFile)) {
      console.error('🔴 constants.ts文件不存在，请先运行开发服务器 ');
      process.exit(1);
    }

    // 编译background-dev.ts - 后台服务脚本
    await build({
      entryPoints: [resolve(__dirname, '../src/dev/background-dev.ts')],
      outfile: resolve(outputDir, 'background-dev.js'),
      bundle: true,       // 将所有依赖打包到一个文件
      minify: false,      // 不压缩代码，便于调试
      format: 'esm',      // 使用ES模块格式
      platform: 'browser',// 目标平台为浏览器
      target: ['chrome90'],// 兼容Chrome 90及以上版本
      define: {
        'process.env.NODE_ENV': '"development"'
      },
      loader: {
        '.ts': 'ts'      // 使用TypeScript加载器处理.ts文件
      }
    });

    // 编译content-dev.ts - 内容脚本
    await build({
      entryPoints: [resolve(__dirname, '../src/dev/content-dev.ts')],
      outfile: resolve(outputDir, 'content-dev.js'),
      bundle: true,
      minify: false,
      format: 'esm',
      platform: 'browser',
      target: ['chrome90'],
      define: {
        'process.env.NODE_ENV': '"development"'
      },
      loader: {
        '.ts': 'ts'
      }
    });

    console.log('✅ 开发脚本编译完成 ');
  } catch (error) {
    console.error('🔴 编译开发脚本时出错 :', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行构建
buildDevScripts(); 