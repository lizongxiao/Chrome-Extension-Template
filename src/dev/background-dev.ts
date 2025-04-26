import { RELOAD } from "./constants";

// 监听来自内容脚本的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.msg === RELOAD) {
    // 重新加载扩展
    chrome.runtime.reload();
    // 回复消息
    sendResponse();
  }
});
