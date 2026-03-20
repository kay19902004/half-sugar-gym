import express from 'express'; 
import { createProxyMiddleware } from 'http-proxy-middleware'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import cors from 'cors'; 
import { randomUUID } from 'node:crypto';
import * as z from 'zod/v4';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const app = express(); 
app.use(cors()); 

const mcpServer = new McpServer(
  {
    name: 'half-sugar-gym-mcp',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

mcpServer.registerTool(
  'get_fitness_plan',
  {
    description: '获取用户的专属健身计划。',
    inputSchema: {
      user_intent: z.string().describe('用户的身体诉求或目标，例如：想减脂、想练胸肌')
    }
  },
  async ({ user_intent }) => {
    return {
      content: [
        {
          type: 'text',
          text: `已为你生成针对“${user_intent}”的专属训练计划：\n1. 热身：慢跑 5 分钟\n2. 力量：深蹲 4 组 x 12 次\n3. 核心：平板支撑 3 组 x 1 分钟`
        }
      ]
    };
  }
);

mcpServer.registerTool(
  'record_workout',
  {
    description: '记录用户刚刚完成的健身动作到脑宇宙。',
    inputSchema: {
      actions: z.array(z.string()).describe("用户完成的健身动作列表，例如：['深蹲', '卧推']")
    }
  },
  async ({ actions }) => {
    return {
      content: [
        {
          type: 'text',
          text: `成功记录训练动作：${actions.join('、')}`
        }
      ]
    };
  }
);

const transports = {};

app.use('/mcp', express.json());
app.all('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];
    let transport;

    if (sessionId && transports[sessionId]) {
      const existingTransport = transports[sessionId];
      if (existingTransport instanceof StreamableHTTPServerTransport) {
        transport = existingTransport;
      } else {
        res.status(400).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Bad Request: Session exists but uses a different transport protocol'
          },
          id: null
        });
        return;
      }
    } else if (!sessionId && req.method === 'POST' && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports[sid] = transport;
        }
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) delete transports[sid];
      };

      await mcpServer.connect(transport);
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error'
        },
        id: null
      });
    }
  }
});

// ==========================================
// 原有业务代理
// ==========================================
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
