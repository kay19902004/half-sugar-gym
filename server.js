import express from 'express'; 
import { createProxyMiddleware } from 'http-proxy-middleware'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import cors from 'cors'; 

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const app = express(); 
app.use(cors()); 

// 托管前端打包后的静态文件 
app.use(express.static(path.join(__dirname, 'dist'))); 

// 【核心代理】把所有前端发往 /gate 的请求，原封不动地转发给 Mindverse AI 
app.use('/gate', createProxyMiddleware({ 
  target: 'https://api.mindverse.com', 
  changeOrigin: true, 
  secure: false,
  // 强制重写：忽略 Express 的裁剪，直接拿浏览器的原始完整路径去请求 
  pathRewrite: (path, req) => req.originalUrl
})); 

// React 路由兜底：任何不认识的请求，统统返回大厅首页 
app.use((req, res) => { 
  res.sendFile(path.join(__dirname, 'dist', 'index.html')); 
}); 

const PORT = process.env.PORT || 8080; 
app.listen(PORT, () => { 
  console.log(`智能管家已上线，正在监听端口: ${PORT}`); 
});