// 自动检测环境：本地开发 → localhost:8000，部署 → 相对路径（后端同时提供前端静态文件）
const API_BASE_URL = (() => {
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return 'http://localhost:8000';
  }
  // 部署后前后端同域（FastAPI 直接 serve 前端），用相对路径即可
  return '';
})();
