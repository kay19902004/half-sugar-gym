import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'dist')));

// Proxy endpoints based on vite.config.ts and previous setup
// 1. Proxy /api to the backend server (which handles /api/auth/token, /api/coach/plan)
// In a full production setup, the backend logic (server/index.js) might be integrated here,
// but assuming it's still running separately or we want to proxy to mindverse
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:3001', // Your local/internal backend server
    changeOrigin: true,
  })
);

// 2. Proxy /gate to Mindverse API
app.use(
  '/gate',
  createProxyMiddleware({
    target: 'https://api.mindverse.com',
    changeOrigin: true,
  })
);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
