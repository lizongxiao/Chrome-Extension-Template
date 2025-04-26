/**
 * WebSocket服务器模块
 * 
 * 该模块实现了一个WebSocket服务器，用于与Chrome扩展客户端通信，
 * 在扩展开发过程中提供热重载功能。
 * 
 * 功能：
 * 1. 创建HTTP服务器作为WebSocket的基础
 * 2. 实现WebSocket服务器，处理客户端连接
 * 3. 提供通知客户端更新的接口
 * 4. 自动处理端口冲突
 */

import http from 'http';
import { WebSocketServer } from 'ws';

// 常量定义
const PORT = 8787;
const UPDATE_CONTENT = 'UPDATE_CONTENT';
const EXTENSION_NAME = 'web-update-alerts';

/**
 * 创建HTTP服务器
 * 
 * 创建一个基础HTTP服务器，作为WebSocket服务器的基础。
 * 自动处理端口冲突，如果指定端口被占用，会尝试下一个端口。
 * 
 * @param {number} port - 希望使用的端口号
 * @returns {Promise<Object>} - 包含服务器实例和实际使用的端口号
 */
function createServer(port) {
  const server = http.createServer();

  return new Promise((resolve, reject) => {
    const onError = (e) => {
      if (e.code === 'EADDRINUSE') {
        console.log(`🔴 端口 ${port} 已被占用，尝试下一个端口...`);
        server.listen(++port);
      } else {
        server.removeListener('error', onError);
        reject(e);
      }
    };

    server.on('error', onError);
    server.listen(port, () => {
      console.log(`🉑 WebSocket 服务器已启动，端口: ${port}`);
      server.removeListener('error', onError);
      resolve({ server, port });
    });
  });
}

/**
 * 启动WebSocket开发服务器
 * 
 * 创建WebSocket服务器并处理客户端连接，实现与Chrome扩展的通信。
 * 当扩展内容脚本或后台脚本需要重新加载时，通过该服务器通知客户端。
 * 
 * @returns {Promise<Object>} - 包含notifyUpdate函数和服务器端口的对象
 */
async function startDevServer() {
  const { server, port } = await createServer(PORT);
  const wss = new WebSocketServer({ noServer: true });
  let socket = null;

  // 处理WebSocket连接
  wss.on('connection', (ws) => {
    console.log('🚀 客户端已连接 ');
    socket = ws;

    // 处理客户端消息
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'ping') {
          // 处理心跳消息，保持连接活跃
        }
      } catch (e) {
        // 忽略无效消息
      }
    });

    // 处理连接关闭
    ws.on('close', () => {
      // console.log('🔴 客户端已断开连接 ');
      socket = null;
    });
  });

  // 处理HTTP升级请求，升级为WebSocket连接
  server.on('upgrade', (request, socket, head) => {
    if (request.url === `/${encodeURIComponent(EXTENSION_NAME)}/crx`) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  // 导出通知客户端更新的函数和端口号
  return {
    /**
     * 通知客户端更新
     * 
     * 发送更新消息到已连接的客户端，触发扩展重新加载
     */
    notifyUpdate: () => {
      if (socket) {
        socket.send(UPDATE_CONTENT);
        // console.log('✅ 通知客户端更新 ');
      }
    },
    port
  };
}

// 导出模块
export { startDevServer }; 