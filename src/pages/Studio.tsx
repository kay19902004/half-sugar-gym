import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, ArrowRight, Dumbbell, Activity, Utensils, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sprite from '@/components/Sprite';
import { useUserStore } from '@/store';
import { useAppStore } from '@/store/useAppStore';
import consultBg from '@/assets/consult-bg.jpg';
import { generateCoachPlanStream } from '@/services/a2aService'; 
import { useWorkoutStore } from '@/store/useWorkoutStore'; 

export default function Studio() {
  const currentUser = useUserStore(state => state.currentUser);
  const token = useAppStore(state => state.token);
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // 🌟 新增状态：用来存放解析出来的报告全览数据
  const [reportData, setReportData] = useState<any>(null); 
  const [showReport, setShowReport] = useState(false); // 控制报告面板的显示
  
  const [coachBubble, setCoachBubble] = useState<string | null>(null);
  const [userBubble, setUserBubble] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setCoachBubble(`欢迎来到静谧咨询室，${currentUser?.name || '学员'}。在流汗之前我们先聊聊。请告诉我你的真实数据 (例如：身高175，体重85kg，最近老坐办公室，想瘦肚子)，我来为你制定体测报告。`);
    }, 1000);
  }, [currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [coachBubble]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !token || isTyping) return;
    
    const currentInput = inputText;
    setInputText('');
    setIsTyping(true);

    setUserBubble(currentInput);
    setCoachBubble(null);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setUserBubble(null);
    setCoachBubble("..."); 

    try {
      const userInfo = { name: currentUser?.name || '学员', shades: currentUser?.shades || ['健身'] };
      
      const finalFullText = await generateCoachPlanStream(token, userInfo, currentInput, (streamedText) => {
        // 遇到 '{' 就截断文字，避免 JSON 代码露馅
        const displayOnlyText = streamedText.split('{')[0].trim();
        setCoachBubble(displayOnlyText || '教练正在奋笔疾书写计划...');
      });

      // 🔍 智能抠取大括号 {} 里的完整 JSON 对象
      const firstBrace = finalFullText.indexOf('{');
      const lastBrace = finalFullText.lastIndexOf('}');

      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = finalFullText.substring(firstBrace, lastBrace + 1);
        try {
          const parsedData = JSON.parse(jsonStr);
          console.log("✅ 成功解析 AI 综合体测报告:", parsedData);
          
          // 1. 把报告数据存到当前页面用来展示
          setReportData(parsedData);
          // 2. 只把 workouts 数组存到全局仓库，这样不会破坏 Workout.tsx 的逻辑！
          useWorkoutStore.getState().setPlan(parsedData.workouts);
          
          // 3. 弹出华丽的报告面板！
          setTimeout(() => {
            setShowReport(true);
          }, 1500);

        } catch (e) {
          console.error("解析 JSON 失败", e);
          setCoachBubble("抱歉，我的计划单写错了格式，能再说一遍你的数据吗？");
        }
      } else {
        setCoachBubble("抱歉，生成报告失败了，麻烦你再重新发一遍数据。");
      }
      
    } catch (error) {
      console.error("生成计划失败:", error);
      setCoachBubble("抱歉，我的脑宇宙连接出了点问题，能再说一次吗？");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center px-6 z-50">
        <Link to="/gym" className="flex items-center text-white/80 hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回大厅
        </Link>
      </header>

      <div 
        className="flex-1 w-full h-full relative bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${consultBg})` }}
      >
        <div className="absolute transition-all duration-300" style={{ left: '35%', top: '55%', zIndex: 50 }}>
          <Sprite characterId="coach" actionType="idle" width={140} unit="px" />
          
          {coachBubble && (
            <div 
              ref={messagesEndRef}
              className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-xl border border-white/20 text-white p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-max max-w-[320px] max-h-[300px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed custom-scrollbar z-[100]"
            >
              {coachBubble}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white/10"></div>
            </div>
          )}
          
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-white text-xs px-2 py-0.5 rounded shadow-lg z-[110] whitespace-nowrap">
            硬核教练
          </div>
        </div>

        <div className="absolute transition-all duration-300" style={{ left: '70%', top: '65%', zIndex: 60, transform: 'scaleX(-1)' }}>
          <Sprite characterId="player" actionType="idle" width={140} unit="px" />
          
          {userBubble && (
            <div className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 bg-blue-500/20 backdrop-blur-xl border border-blue-400/30 text-white p-4 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] w-max max-w-[280px] whitespace-pre-wrap text-sm z-[100]" style={{ transform: 'scaleX(-1)' }}>
              {userBubble}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-blue-500/20"></div>
            </div>
          )}

          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded shadow-lg z-[110] whitespace-nowrap" style={{ transform: 'scaleX(-1)' }}>
            {currentUser?.name || '你'}
          </div>
        </div>
      </div>

      {/* 🚀 终极武器：全屏半透明 AI 体测报告面板！ */}
      {showReport && reportData && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-500">
          <div className="bg-[#121212]/90 border border-white/10 shadow-2xl rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-white/10 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Activity className="w-6 h-6 mr-3 text-blue-400" />
                AI 专属体测与训练报告
              </h2>
              <button onClick={() => setShowReport(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
              {/* 身体数据模块 */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <h3 className="text-gray-400 text-sm font-semibold mb-4 flex items-center uppercase tracking-wider">
                  <Scale className="w-4 h-4 mr-2" /> 身体数据分析
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-black/40 rounded-xl p-4 text-center">
                    <div className="text-gray-500 text-xs mb-1">身高</div>
                    <div className="text-white font-bold text-xl">{reportData.stats?.height} <span className="text-xs font-normal">cm</span></div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 text-center">
                    <div className="text-gray-500 text-xs mb-1">体重</div>
                    <div className="text-white font-bold text-xl">{reportData.stats?.weight} <span className="text-xs font-normal">kg</span></div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 text-center">
                    <div className="text-gray-500 text-xs mb-1">BMI</div>
                    <div className="text-blue-400 font-bold text-xl">{reportData.stats?.bmi}</div>
                  </div>
                  <div className="bg-black/40 rounded-xl p-4 text-center flex flex-col items-center justify-center">
                    <div className="text-gray-500 text-xs mb-1">状态</div>
                    <div className="bg-yellow-500/20 text-yellow-400 text-sm px-2 py-1 rounded-md font-bold">{reportData.stats?.status}</div>
                  </div>
                </div>
              </div>

              {/* 饮食建议模块 */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <h3 className="text-gray-400 text-sm font-semibold mb-3 flex items-center uppercase tracking-wider">
                  <Utensils className="w-4 h-4 mr-2" /> 教练饮食建议
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {reportData.diet}
                </p>
              </div>

              {/* 训练计划预览 */}
              <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                <h3 className="text-gray-400 text-sm font-semibold mb-3 flex items-center uppercase tracking-wider">
                  <Dumbbell className="w-4 h-4 mr-2" /> 今日动作排期
                </h3>
                <div className="space-y-2">
                  {reportData.workouts?.map((w: any, idx: number) => (
                    <div key={idx} className="bg-black/40 rounded-lg p-3 flex items-center justify-between">
                      <span className="text-white font-bold">{idx + 1}. {w.name}</span>
                      <span className="text-gray-500 text-xs px-2 py-1 bg-white/5 rounded">{w.duration} 组</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-black/40 border-t border-white/10 shrink-0">
               <Link to="/workout" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-4 rounded-xl font-bold shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center transition-all transform hover:scale-[1.02]">
                  <Dumbbell className="w-5 h-5 mr-2" />
                  报告确认完毕，立刻前往硬核训练区 <ArrowRight className="w-5 h-5 ml-2" />
               </Link>
            </div>
          </div>
        </div>
      )}

      {/* 底部输入框 (仅在没有全屏报告时可用) */}
      {!showReport && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-2 rounded-2xl flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isTyping}
              placeholder={isTyping ? "教练正在为你规划..." : "输入你的真实数据 (如：身高175，体重85kg，想瘦肚子)..."}
              className="flex-1 bg-transparent text-white px-4 py-3 text-sm focus:outline-none placeholder-white/50 disabled:opacity-50"
            />
            <button 
              onClick={handleSendMessage}
              disabled={isTyping || !inputText.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
      `}</style>
    </div>
  );
}