# Chrome 扩展开发模板（干净但丰富）

> 一个更适合中国开发者的 Chrome 扩展开发模板

![谷歌插件](https://images2015.cnblogs.com/blog/352797/201707/352797-20170711100448275-555008903.png)

## 目录

- [简介](#简介)
- [特性](#特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [安装](#安装)
- [开发工作流](#开发工作流)
- [热重载机制](#热重载机制)
- [脚本说明](#脚本说明)
- [故障排除](#故障排除)
- [发布流程](#发布流程)

## 简介

这是一个基于 Vue 3 的 Chrome 扩展开发模板，提供了完整的开发环境和热重载功能，使 Chrome 扩展开发更加高效。该模板特别适合中国开发者，解决了许多常见的开发痛点。

模板核心优势：

- **开发效率提升** - 无需手动刷新，文件修改后自动重载扩展
- **现代化架构** - 基于 Vue 3 和 TypeScript 的完整前端开发体验
- **标准化结构** - 符合 Chrome 扩展最佳实践的项目架构
- **便捷的构建流程** - 一键开发和生产环境构建

该模板通过 WebSocket 实现了实时检测文件变更并通知扩展重新加载的机制，大大提高了开发效率。

## 特性

- 🔄 **实时热重载** - 代码变更时自动刷新扩展和页面
- ⚡ **快速构建** - 基于 Vite 的高速构建和打包
- 🧩 **Vue 3 支持** - 完整支持 Vue 3 组件和 Composition API
- 📦 **自动注入** - 自动将热重载脚本注入到扩展中
- 🛠️ **TypeScript 支持** - 完整的 TypeScript 类型支持
- 📱 **模块化架构** - 清晰分离的背景脚本、内容脚本和弹出窗口

## 技术栈

- **Vue 3** - 用于构建用户界面
- **TypeScript** - 提供类型安全
- **Vite** - 构建工具和开发服务器
- **WebSocket** - 用于热重载功能
- **esbuild** - 编译开发脚本
- **@crxjs/vite-plugin** - Vite 的 Chrome 扩展插件

## 项目结构

```
chrome-extension-template/
├── dist/                  # 编译输出目录
│   ├── assets/            # 构建后的资源文件
│   ├── background/        # 构建后的后台脚本
│   ├── content/           # 构建后的内容脚本
│   ├── options/           # 构建后的选项页面
│   ├── popup/             # 构建后的弹出窗口
│   ├── shared/            # 共享编译资源
│   ├── src/               # 源代码构建输出
│   │   ├── assets/        # 资源文件
│   │   ├── dev/           # 热重载脚本
│   │   │   ├── background-dev.js  # 后台热重载脚本
│   │   │   └── content-dev.js     # 内容脚本热重载
│   │   ├── options/       # 选项页面构建
│   │   └── popup/         # 弹出窗口构建
│   ├── background-wrapper.js  # 后台脚本包装器
│   ├── manifest.json      # 修改后的扩展清单文件
│   └── service-worker-loader.js  # Service Worker 加载器
├── public/                # 静态资源
├── scripts/               # 开发和构建脚本
│   ├── build-dev-scripts.js  # 开发脚本构建工具
│   ├── dev-server.js      # WebSocket 服务器
│   ├── dev.js             # 开发环境启动脚本
│   └── modify-manifest.js # Manifest 修改工具
├── src/                   # 源代码
│   ├── assets/            # 资源文件
│   ├── background/        # 后台脚本
│   ├── components/        # Vue 组件
│   ├── content/           # 内容脚本
│   ├── dev/               # 热重载开发脚本
│   │   └── constants.ts   # 热重载常量
│   ├── options/           # 选项页面
│   ├── popup/             # 弹出窗口
│   │   ├── components/    # 弹出窗口组件
│   │   ├── App.vue        # 弹出窗口主组件
│   │   ├── index.html     # 弹出窗口HTML入口
│   │   ├── main.ts        # 弹出窗口入口脚本
│   │   └── style.css      # 弹出窗口样式
│   ├── utils/             # 工具函数
│   ├── index.html         # 主HTML入口
│   ├── manifest.json      # 扩展清单文件
│   └── shims-vue.d.ts     # Vue类型声明
├── .gitignore             # Git忽略配置
├── .vscode/               # VSCode配置
├── package.json           # 项目配置
├── pnpm-lock.yaml         # pnpm锁定文件
├── tsconfig.json          # TypeScript配置
├── tsconfig.node.json     # Node的TypeScript配置
└── vite.config.ts         # Vite 配置
```

## 安装

1. 克隆仓库：

```bash
git clone [仓库URL]
cd chrome-extension-template
```

2. 安装依赖：

```bash
npm install
# 或使用 pnpm
pnpm install
```

## 开发工作流

### 启动开发环境

```bash
npm run dev
# 或使用 pnpm
pnpm dev
```

这个命令会：

1. 启动 WebSocket 服务器（端口 8787）
2. 构建扩展
3. 编译开发脚本
4. 修改 manifest.json 以支持热重载
5. 监视文件变更

### 加载扩展

1. 打开 Chrome/Edge 浏览器
2. 进入扩展管理页面 (`chrome://extensions` 或 `edge://extensions`)
3. 开启"开发者模式"
4. 点击"加载已解压的扩展"
5. 选择项目的 `dist` 目录

### 开发流程

1. 修改源代码（可根据需要在根目录下的 scripts 目录下 dev.js 文件中添加需要监听的文件,当前是监听 src 目录下的所有文件）
2. 保存文件
3. 扩展将自动重新加载
4. 如果当前页面正在使用扩展，它也会自动刷新

## 热重载机制

这个项目实现了一个完整的热重载系统，工作原理如下：

1. **WebSocket 服务器** - 在开发模式下运行，监听文件变化
2. **内容脚本客户端** - 与 WebSocket 服务器建立连接
3. **后台脚本处理器** - 接收重载指令并重新加载扩展
4. **构建流程集成** - 自动将热重载脚本注入到构建过程中

热重载流程：

- 开发服务器（`scripts/dev-server.js`）启动 WebSocket 监听端口 8787
- 热重载脚本（`dist/src/dev/content-dev.js` 和 `dist/src/dev/background-dev.js`）在扩展中加载
- 当文件变更时，Vite 构建系统检测到变化并重新构建
- WebSocket 服务器发送更新通知（`UPDATE_CONTENT` 消息）
- 内容脚本接收通知并发送消息（`RELOAD` 消息）给后台脚本
- 后台脚本调用 `chrome.runtime.reload()` 重新加载扩展
- 活动页面自动刷新以应用更新后的扩展

热重载相关文件：

- `scripts/dev-server.js` - WebSocket 服务器实现
- `scripts/build-dev-scripts.js` - 编译热重载脚本
- `scripts/modify-manifest.js` - 修改 manifest 以支持热重载
- `src/dev/constants.ts` - 定义热重载使用的消息类型和常量

## 脚本说明

### `scripts/dev.js`

开发环境启动脚本，负责协调整个开发流程：

- 启动 WebSocket 服务器
- 运行 Vite 构建
- 编译开发脚本
- 修改 manifest.json
- 监视文件变化并触发更新

```javascript
// 主要命令
npm run dev
# 或使用 pnpm
pnpm dev
```

### `scripts/dev-server.js`

WebSocket 服务器模块，负责：

- 创建 HTTP 服务器作为 WebSocket 基础
- 建立与扩展的通信连接
- 处理连接和断开事件
- 提供 `notifyUpdate` 函数通知客户端更新

### `scripts/build-dev-scripts.js`

开发脚本构建工具，使用 esbuild：

- 编译后台热重载脚本
- 编译内容脚本热重载功能
- 输出到扩展的 `dist/src/dev` 目录

```javascript
// 可单独运行
npm run build-dev-scripts
```

### `scripts/modify-manifest.js`

Manifest 修改工具，负责：

- 添加 `web_accessible_resources` 配置
- 注入内容脚本
- 处理后台脚本配置
- 创建后台脚本包装器

## 构建命令

项目提供以下 npm 脚本：

```bash
# 开发模式（带热重载）
npm run dev
# 或使用 pnpm
pnpm dev

# 仅监视文件变化并构建
npm run watch
# 或使用 pnpm
pnpm watch

# 生产构建
npm run build
# 或使用 pnpm
pnpm build

# 构建开发脚本
npm run build-dev-scripts
# 或使用 pnpm
pnpm build-dev-scripts
```

## 故障排除

### WebSocket 连接失败

**症状**: 控制台没有显示 "🚀 客户端已连接" 消息。

**解决方案**:

- 确保端口 8787 没有被其他应用占用
- 刷新扩展页面以重新建立连接
- 检查网络设置，确保没有阻止 WebSocket 连接

### 热重载不工作

**症状**: 文件变更后扩展没有自动重新加载。

**解决方案**:

- 检查控制台输出，查看是否有构建错误
- 确保扩展已正确加载（加载的是 `dist` 目录）
- 尝试手动重新加载扩展并刷新页面
- 检查 `dist/manifest.json` 是否包含热重载脚本配置

### 构建错误

**症状**: 控制台显示构建错误。

**解决方案**:

- 检查源代码中的语法错误
- 确保所有依赖都已正确安装
- 尝试删除 `dist` 目录并重新启动开发环境
- 检查 TypeScript 类型错误

## 发布流程

当准备发布扩展时，使用以下步骤：

1. 更新版本号：

   ```bash
   # 在 package.json 和 src/manifest.json 中更新版本号
   ```

2. 构建生产版本：

   ```bash
   npm run build
   # 或使用 pnpm
   pnpm build
   ```

3. 打包扩展：

   - 从 `dist` 目录创建 ZIP 文件
   - 或使用 Chrome 扩展管理页面的"打包扩展"功能

4. 提交到 Chrome Web Store：
   - 登录 [Chrome Developer Dashboard](https://chrome.google.com/webstore/developer/dashboard)
   - 上传新版本
   - 提交审核

---

## 贡献

欢迎提交 Pull Request 和 Issue 来改进这个项目！

## 许可证

ISC

---

开源拯救世界
