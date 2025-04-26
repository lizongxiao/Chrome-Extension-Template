/**
 * Manifest修改工具
 * 
 * 该脚本用于修改Chrome扩展的manifest.json文件，
 * 在开发模式下注入热重载所需的脚本和配置。
 * 
 * 功能：
 * 1. 在开发模式下向manifest添加热重载内容脚本
 * 2. 添加或修改后台脚本以支持热重载
 * 3. 添加必要的web_accessible_resources配置
 * 4. 创建后台脚本包装器，整合开发脚本和原始脚本
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 获取当前文件路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取命令行参数
const args = process.argv.slice(2);
const devMode = args.includes('--dev') || process.env.NODE_ENV === 'development';

/**
 * 修改manifest.json文件
 * 
 * 读取构建后的manifest.json文件，在开发模式下添加热重载
 * 所需的配置项，然后写回文件系统。
 */
function modifyManifest() {
  const manifestPath = path.resolve(__dirname, '../dist/manifest.json');

  // 检查manifest.json是否存在
  if (!fs.existsSync(manifestPath)) {
    console.error('🔴 manifest.json不存在，请先构建项目 ');
    process.exit(1);
  }

  try {
    // 读取并解析manifest.json
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // 如果是开发模式，添加热重载相关配置
    if (devMode) {
      // 添加web_accessible_resources配置
      addWebAccessibleResources(manifest);

      // 添加内容脚本配置
      addContentScripts(manifest);

      // 处理后台脚本配置
      handleBackgroundScript(manifest);

      console.log('✅ 已添加热重载脚本到manifest ');
    }

    // 写回修改后的manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log('✅ 已更新manifest.json');
  } catch (error) {
    console.error('🔴 修改manifest时出错 :', error);
    process.exit(1);
  }
}

/**
 * 添加web_accessible_resources配置
 * 
 * 确保扩展可以访问开发脚本资源
 * 
 * @param {Object} manifest - manifest对象
 */
function addWebAccessibleResources(manifest) {
  // 确保web_accessible_resources已存在
  if (!manifest.web_accessible_resources) {
    manifest.web_accessible_resources = [];
  }

  // 添加开发脚本到可访问资源
  const devResourceEntry = {
    resources: ["src/dev/*"],
    matches: ["<all_urls>"]
  };

  let hasDevResources = false;

  // 检查是否已添加开发资源
  for (const resource of manifest.web_accessible_resources) {
    if (resource.resources && resource.resources.includes("src/dev/*")) {
      hasDevResources = true;
      break;
    }
  }

  // 如果尚未添加，则添加资源配置
  if (!hasDevResources) {
    manifest.web_accessible_resources.push(devResourceEntry);
  }
}

/**
 * 添加内容脚本配置
 * 
 * 添加热重载客户端内容脚本到manifest
 * 
 * @param {Object} manifest - manifest对象
 */
function addContentScripts(manifest) {
  // 定义热重载内容脚本配置
  const contentDevScript = {
    matches: ['<all_urls>'],
    js: ['src/dev/content-dev.js'],
    run_at: 'document_start'
  };

  // 添加到content_scripts配置
  if (!manifest.content_scripts) {
    manifest.content_scripts = [contentDevScript];
  } else {
    // 检查是否已添加
    let hasDevScript = false;
    for (const script of manifest.content_scripts) {
      if (script.js && script.js.includes('src/dev/content-dev.js')) {
        hasDevScript = true;
        break;
      }
    }

    // 如果尚未添加，则添加脚本配置
    if (!hasDevScript) {
      manifest.content_scripts.push(contentDevScript);
    }
  }
}

/**
 * 处理后台脚本配置
 * 
 * 添加或修改后台脚本配置，确保热重载脚本被包含
 * 
 * @param {Object} manifest - manifest对象
 */
function handleBackgroundScript(manifest) {
  // 如果没有后台脚本，创建一个
  if (!manifest.background) {
    manifest.background = {
      service_worker: 'src/dev/background-dev.js',
      type: 'module'
    };
  } else {
    // 备份原始service_worker
    const originalServiceWorker = manifest.background.service_worker;

    // 创建一个包装后台脚本，导入开发脚本和原始脚本
    const wrapperContent =
      `import './src/dev/background-dev.js';
import './${originalServiceWorker}';`;

    // 写入包装脚本
    fs.writeFileSync(
      path.resolve(__dirname, '../dist/background-wrapper.js'),
      wrapperContent
    );

    // 修改manifest指向包装脚本
    manifest.background.service_worker = 'background-wrapper.js';
  }
}

// 执行manifest修改
modifyManifest(); 