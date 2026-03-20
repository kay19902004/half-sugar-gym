import express from 'express'; 
import { createProxyMiddleware } from 'http-proxy-middleware'; 
import path from 'path'; 
import { fileURLToPath } from 'url'; 
import cors from 'cors'; 
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const __filename = fileURLToPath(import.meta.url); 
const __dirname = path.dirname(__filename); 

const app = express(); 
app.use(cors()); 

// ==========================================
// 🚀 MCP 服务器设置
// ==========================================
const mcpServer = new Server({
  name: "half-sugar-gym-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// 定义可供 OpenClaw 使用的 Tool
mcpServer.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_fitness_plan",
        description: "获取用户的专属健身计划。调用前请确保已获得用户的 SecondMe Token。",
        inputSchema: {
          type: "object",
          properties: {
            user_intent: {
              type: "string",
              description: "用户的身体诉求或目标，例如：想减脂、想练胸肌"
            }
          },
          required: ["user_intent"]
        }
      },
      {
        name: "record_workout",
        description: "记录用户刚刚完成的健身动作到脑宇宙社交记忆中。",
        inputSchema: {
          type: "object",
          properties: {
            actions: {
              type: "array",
              items: { type: "string" },
              description: "用户完成的健身动作列表，例如：['深蹲', '卧推']"
            }
          },
          required: ["actions"]
        }
      }
    ]
  };
});

// 监听 Tool 调用请求
mcpServer.setRequestHandler(CallToolRequestSchema, async (request) => {
  // 必须通过 HTTP 标头拦截拿到用户的 Token，这取决于 SSE 连接阶段如何处理
  // 此处只是模拟具体实现，正式环境应从请求上下文中提取 Token。
  switch (request.params.name) {
    case "get_fitness_plan":
      return {
        content: [
          {
            type: "text",
            text: `已为你生成针对 "${request.params.arguments?.user_intent}" 的专属训练计划：\n1. 热身：慢跑 5 分钟\n2. 力量：深蹲 4 组 x 12 次\n3. 核心：平板支撑 3 组 x 1 分钟`
          }
        ]
      };
    case "record_workout":
      const actions = request.params.arguments?.actions || [];
      return {
        content: [
          {
            type: "text",
            text: `成功将你的训练动作 [${actions.join(', ')}] 写入到你的脑宇宙中！你的数字分身已经记住了你的汗水。`
          }
        ]
      };
    default:
      throw new Error(`Unknown tool: ${request.params.name}`);
  }
});

// MCP SSE 挂载点
let transport;
app.get("/mcp/sse", async (req, res) => {
  // 这里必须验证 SecondMe 的 Authorization: Bearer <Token>
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).send("Unauthorized: Missing Bearer Token");
    return;
  }
  console.log("Client connected to MCP SSE, Token:", authHeader.substring(0, 15) + "...");
  transport = new SSEServerTransport("/mcp/messages", res);
  await mcpServer.connect(transport);
});

// MCP Messages 端点
app.post("/mcp/messages", express.json(), async (req, res) => {
  if (!transport) {
    res.status(400).send("No active MCP SSE session");
    return;
  }
  await transport.handlePostMessage(req, res);
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