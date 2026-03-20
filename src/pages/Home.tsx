import { Dumbbell, UserCog } from "lucide-react";
import { useNavigate } from "react-router-dom";
// 🚨 注意：请确保你的 bg-gym.jpeg 放在了 src/assets/ 目录下
// 如果层级不对，请调整 "../assets/bg-gym.jpeg" 的路径
import bgImage from "../assets/bg-gym.jpeg"; 

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* 深色半透明遮罩 + 微模糊，压暗背景，突出前景的霓虹发光效果 */}
      <div className="absolute inset-0 bg-[#0f172a]/75 backdrop-blur-[3px]"></div>

      <div className="relative z-10 flex flex-col items-center px-4 w-full max-w-6xl mx-auto">
        
        {/* 顶部标题区 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-wide drop-shadow-lg mb-3">
            欢迎来到 SecondMe Fitness
          </h1>
          <p className="text-zinc-300 text-lg drop-shadow">
            请选择您的健身地点开始体验
          </p>
        </div>

        {/* 卡片布局 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          
          {/* ================= 卡片 1：自主健身房 (青蓝色霓虹) ================= */}
          <button 
            onClick={() => navigate('/gym')}
            className="group relative flex flex-col items-center p-8 md:p-10 text-center w-full rounded-2xl bg-slate-900/60 backdrop-blur-md border-2 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_40px_rgba(34,211,238,0.7)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* 发光图标容器 */}
            <div className="w-16 h-16 rounded-full bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,211,238,0.5)] group-hover:scale-110 transition-transform duration-300">
              <Dumbbell className="w-8 h-8 text-cyan-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">自主健身房 (Autonomous Gym)</h2>
            {/* 文字发光效果 */}
            <h3 className="text-cyan-400 font-bold mb-4 text-sm md:text-base tracking-wide drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">
              A2A Social: Pair Workout & Leaderboard
            </h3>
            
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              进入 A2A 社交健身房，与其他真实玩家的 Agent 分身互动。
            </p>
          </button>

          {/* ================= 卡片 2：健身工作室 (橙黄色霓虹) ================= */}
          <button 
            onClick={() => navigate('/studio')}
            className="group relative flex flex-col items-center p-8 md:p-10 text-center w-full rounded-2xl bg-slate-900/60 backdrop-blur-md border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_40px_rgba(251,191,36,0.7)] hover:-translate-y-1 transition-all duration-300"
          >
            {/* 发光图标容器 */}
            <div className="w-16 h-16 rounded-full bg-amber-950/80 border border-amber-500/50 flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(251,191,36,0.5)] group-hover:scale-110 transition-transform duration-300">
              <UserCog className="w-8 h-8 text-amber-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">健身工作室 (Coach Studio)</h2>
            {/* 文字发光效果 */}
            <h3 className="text-amber-400 font-bold mb-4 text-sm md:text-base tracking-wide drop-shadow-[0_0_5px_rgba(251,191,36,0.8)]">
              [Coached Training: Dynamic Form Correction]
            </h3>
            
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              进入 1v1 教学模式，让系统教练为你生成专属训练动作。
            </p>
          </button>

        </div>
      </div>
    </div>
  );
}