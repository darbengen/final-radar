// 自动检测环境：
//   本地开发 → localhost:8000
//   Railway 部署 → 前后端同域，相对路径
//   GitHub Pages → 连 Railway 后端
const API_BASE_URL = (() => {
  const host = window.location.hostname;
  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
    return 'http://localhost:8000';
  }
  if (host.includes('github.io')) {
    // GitHub Pages 前端 + Railway 后端
    return 'https://final-radar.up.railway.app';
  }
  // Railway / 自定义域名 → 前后端同域（FastAPI serve 前端）
  return '';
})();
