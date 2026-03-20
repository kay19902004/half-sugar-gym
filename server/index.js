import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';

// 处理 ESM 下的 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🎯 关键修复：强制指定去上一级（根目录）读取 .env 文件！
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/auth/token', async (req, res) => {
  const { code, redirect_uri } = req.body;
  try {
    console.log('👉 收到前端换取 Token 请求，code:', code);
    
    // 🔍 检查护城河：看看有没有成功拿到 .env 里的密码
    if (!process.env.SECONDME_CLIENT_ID) {
      console.log('🚨 糟糕！后端没有读取到 Client ID，请检查 .env 文件！');
    } else {
      console.log('✅ 成功加载应用凭证，准备换取 Token...');
    }

    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('redirect_uri', redirect_uri);
    formData.append('client_id', process.env.SECONDME_CLIENT_ID);
    formData.append('client_secret', process.env.SECONDME_CLIENT_SECRET);

    const response = await axios.post(
      'https://api.mindverse.com/gate/lab/api/oauth/token/code',
      formData.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        }
      }
    );

    if (response.data && response.data.code === 0 && response.data.data) {
      console.log('🎉 苍天啊大地啊！成功获取到最终的 Access Token!');
      res.json({ access_token: response.data.data.accessToken });
    } else {
      console.error('❌ Token 响应报错:', response.data);
      res.status(400).json({ error: '获取 Token 失败', details: response.data });
    }
  } catch (error) {
    console.error('❌ 请求崩溃:', error.response?.data || error.message);
    res.status(500).json({ error: '服务器内部错误' });
  }
});

const PORT = process.env.PORT || 3001;

// ==========================================
// 🎯 生产环境大一统：托管前端静态资源 & 路由兜底
// ==========================================
// 把外层项目 build 出来的 dist 目录作为静态资源托管
app.use(express.static(path.join(__dirname, '../dist')));

// SPA 路由兜底：所有未命中的请求都返回 index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 代理服务器已启动，正在持续监听 http://localhost:${PORT}`);
});