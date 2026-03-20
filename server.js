import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';

// 处理 ESM 下的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// 托管 dist 目录下的静态文件
app.use(express.static(path.join(__dirname, 'dist')));

// 1. 代理 /api 请求到本地或线上的后端服务
app.use(
  '/api',
  createProxyMiddleware({
    // 硬编码！千万不要去 import vite.config.ts
    // 如果您把后端部署到了另一个地址，请把这里的 http://localhost:3001 改成您的后端绝对地址
    target: 'http://localhost:3001', 
    changeOrigin: true,
  })
);

// 2. 代理 /gate 请求到 Mindverse API
app.use(
  '/gate',
  createProxyMiddleware({
    target: 'https://api.mindverse.com',
    changeOrigin: true,
  })
);

// SPA 路由兜底：所有未命中的请求都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Express server is running on port ${PORT}`);
});
