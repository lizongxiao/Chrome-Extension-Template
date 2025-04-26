import {
  DEV_SERVER_PORT,
  EXTENSION_NAME,
  UPDATE_CONTENT,
  RELOAD,
} from "./constants";

// 创建WebSocket连接
const ws = new WebSocket(
  `ws://localhost:${DEV_SERVER_PORT}/${encodeURIComponent(EXTENSION_NAME)}/crx`
);
let pingTimer: number | undefined;

// 连接建立时
ws.onopen = () => {
  if (pingTimer) {
    clearInterval(pingTimer);
  }
  // 每5秒发送一次ping消息，保持连接活跃
  pingTimer = setInterval(() => {
    ws.send(JSON.stringify({ type: "ping" }));
  }, 5000) as unknown as number;
};

// 接收消息时
ws.onmessage = (event) => {
  if (event.data === UPDATE_CONTENT && chrome.runtime?.id) {
    // 通知后台服务重新加载扩展
    chrome.runtime.sendMessage({ msg: RELOAD }, () => {
      // 刷新当前页面
      window.location.reload();
    });
  }
};

// 连接关闭时
ws.onclose = () => {
  if (pingTimer) {
    clearInterval(pingTimer);
  }
};
