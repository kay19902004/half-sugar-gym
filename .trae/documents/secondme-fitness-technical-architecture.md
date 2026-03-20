## 1. Architecture design
```mermaid
graph TD
  A[User Browser] --> B[React Frontend + Vite]
  B --> C[React Router]
  C --> D[/studio Page]
  C --> E[/gym Page]
  D --> F[Canvas 2D Renderer]
  D --> G[Chat UI Component]
  D --> H[Status Panel Component]
  E --> I[Canvas 2D Renderer]
  E --> J[Action Control Component]

  subgraph "Frontend Layer"
    B
    C
    D
    E
    F
    G
    H
    I
    J
  end
```

## 2. Technology Description
- Frontend: React@18 + TypeScript@5 + TailwindCSS@3 + Vite
- Initialization Tool: vite-init
- Backend: 无（纯前端静态部署，后续可接入 Supabase 扩展用户体系）
- 2D 渲染：HTML5 Canvas API（优先）或 CSS 绝对定位兜底

## 3. Route definitions
| Route | Purpose |
|-------|---------|
| /studio | 教练工作室，左右分栏，左侧 2D 场景右侧聊天与状态 |
| /gym | 自主健身房，全屏 2D 场景，用户自由训练 |

## 4. API definitions
本期无后端，故无网络 API。仅定义组件 Props 类型：

Sprite 组件 Props
```typescript
type ActionType = 'idle' | 'squat' | 'push_up';

interface SpriteProps {
  x: number;          // 场景坐标 px
  y: number;
  actionType: ActionType;
  size?: number;      // 可选，默认 64
}
```

## 5. Server architecture diagram
不适用，纯前端项目。

## 6. Data model
不适用，本期无持久化需求；状态通过 React useState 局部管理。后续若接入 Supabase，可扩展 users、messages、workouts 表。