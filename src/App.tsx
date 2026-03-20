import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "@/pages/Home";
import Gym from "@/pages/Gym";
import Studio from "@/pages/Studio";
import Login from "@/pages/Login";
import OAuthCallback from "@/pages/OAuthCallback";
import Workout from "@/pages/Workout"; 
import { useAppStore } from "@/store/useAppStore";

// 路由守卫：没登录就踢回登录页
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default function App() {
  return (
    // 这里是整个项目唯一的 Router
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        
        <Route 
          path="/gym" 
          element={
            <ProtectedRoute>
              <Gym />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/studio" 
          element={
            <ProtectedRoute>
              <Studio />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/workout" 
          element={
            <ProtectedRoute>
              <Workout />
            </ProtectedRoute>
          } 
        />
        
        {/* 404 兜底路由：匹配不到的路径直接跳回首页 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}