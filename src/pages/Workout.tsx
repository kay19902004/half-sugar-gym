import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sprite from '@/components/Sprite';
import { useUserStore } from '@/store';
import workoutBg from '@/assets/studio-bg.jpg'; 
import { useWorkoutStore } from '@/store/useWorkoutStore';
import { useAppStore } from '@/store/useAppStore';
import { syncWorkoutToBrain } from '@/services/a2aService';

export default function Workout() {
  const currentUser = useUserStore(state => state.currentUser);
  const aiPlan = useWorkoutStore(state => state.plan); 
  const token = useAppStore(state => state.token); 

  const [activeTaskIndex, setActiveTaskIndex] = useState<number | null>(null);
  const [completedTasks, setCompletedTasks] = useState<number[]>([]);
  const [isPlanOpen, setIsPlanOpen] = useState(window.innerWidth > 768);
  
  const [userAction, setUserAction] = useState<string>('idle');
  const [coachBubble, setCoachBubble] = useState<string>("来吧！专属计划已生成。准备好了就点击右侧的【开始训练】！");

  if (!aiPlan || aiPlan.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white font-sans">
        <p className="text-xl mb-4 text-gray-400">哎呀，训练计划丢失了...</p>
        <Link to="/studio" className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500 transition shadow-lg">
          返回咨询室重新生成
        </Link>
      </div>
    );
  }

  const startWorkout = (taskIndex: number) => {
    if (activeTaskIndex !== null) return; 
    
    setActiveTaskIndex(taskIndex);
    setIsPlanOpen(false); // 训练时自动收起面板，避免遮挡人物动作
    
    const task = aiPlan[taskIndex];
    let step = 0;
    
    // 🚀 智能动作识别器大升级！
    let actionToPlay = 'squat'; // 默认保底动作
    if (task.name.includes('卧推')) actionToPlay = 'bench_press';
    if (task.name.includes('深蹲')) actionToPlay = 'squat';
    if (task.name.includes('弯举') || task.name.includes('手臂') || task.name.includes('二头')) actionToPlay = 'curl';
    if (task.name.includes('硬拉') || task.name.includes('划船') || task.name.includes('背')) actionToPlay = 'deadlift';
    
    setUserAction(actionToPlay); 
    setCoachBubble(`准备开始：${task.name}！`);
    
    const interval = setInterval(() => {
      if (step < task.tips.length) {
        setCoachBubble(task.tips[step]);
        step++;
      } else {
        clearInterval(interval);
        
        const taskId = task.id !== undefined ? task.id : taskIndex;
        
        setCompletedTasks(prev => {
          const newCompleted = [...prev, taskId];
          
          if (newCompleted.length === aiPlan.length) {
            // 🚀 全部完成！触发彩蛋：教练欢呼，玩家喝水！
            setUserAction('cheer'); 
            // （利用组件的 fallback 机制：发 cheer 给玩家，玩家没这个动作，会自动兜底到喝水/待机）
            setCoachBubble("🎉 太棒了！今日计划全部完成！正在把你的汗水同步给脑宇宙...");
            
            if (token) {
              const actionNames = aiPlan.map(t => t.name);
              syncWorkoutToBrain(token, actionNames).then(() => {
                setCoachBubble("🏆 记忆已同步！你的身体和脑宇宙数据双双升级！喝口水休息下吧！");
                setUserAction('water'); // 同步完，玩家切喝水动作
              }).catch(() => {
                setCoachBubble("🏆 训练已全部完成！(网络原因记忆未同步，但不影响肌肉生长)");
              });
            }
          } else {
            setUserAction('idle'); // 没做完，就站着休息准备下一个
            setCoachBubble(`漂亮！${task.name} 完成得很标准！休息一下，准备下一个动作。`);
          }
          
          return newCompleted;
        });
        
        setActiveTaskIndex(null);
      }
    }, 1500); 
  };

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans relative overflow-hidden">
      <header className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center px-6 z-50">
        <Link to="/gym" className="flex items-center text-white/80 hover:text-white transition-colors bg-black/40 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
          <ArrowLeft className="w-5 h-5 mr-2" />
          结束训练，返回大厅
        </Link>
        <h1 className="ml-auto text-white font-bold tracking-widest drop-shadow-lg text-lg">VIP 硬核训练区</h1>
      </header>

      <div 
        className="flex-1 w-full h-full relative bg-cover bg-center flex items-center justify-center"
        style={{ backgroundImage: `url(${workoutBg})` }}
      >
        <div className="absolute transition-all duration-300" style={{ left: '30%', top: '45%', zIndex: 45 }}>
          <Sprite characterId="coach" actionType={userAction === 'water' ? 'idle' : userAction} width={150} unit="px" />
          
          {coachBubble && (
            <div className="absolute bottom-full mb-12 left-1/2 -translate-x-1/2 bg-yellow-500/90 backdrop-blur-md border border-yellow-400 text-black font-bold p-3 rounded-2xl shadow-[0_10px_30px_rgba(234,179,8,0.4)] w-max max-w-[250px] whitespace-pre-wrap text-sm text-center z-[100] transform transition-all animate-bounce">
              {coachBubble}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-yellow-500/90"></div>
            </div>
          )}
          
          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-yellow-600/90 text-white text-xs px-2 py-0.5 rounded shadow-lg z-[110] whitespace-nowrap">
            硬核教练
          </div>
        </div>

        <div className="absolute transition-all duration-300" style={{ left: '48%', top: '55%', zIndex: 55, transform: 'scaleX(-1)' }}>
          {/* 🚀 玩家动画根据状态渲染 */}
          <Sprite characterId="player" actionType={userAction === 'cheer' ? 'water' : userAction} width={140} unit="px" />
          
          {/* 只有在训练的这四个动作时，才显示流汗 */}
          {['squat', 'bench_press', 'curl', 'deadlift'].includes(userAction) && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-2xl animate-ping z-[110]" style={{ transform: 'scaleX(-1)' }}>
              💦
            </div>
          )}

          <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded shadow-lg z-[110] whitespace-nowrap" style={{ transform: 'scaleX(-1)' }}>
            {currentUser?.name || '你'}
          </div>
        </div>

        {/* 悬浮打开按钮（在面板折叠时显示） */}
        {!isPlanOpen && (
          <button 
            onClick={() => setIsPlanOpen(true)}
            className="absolute top-20 right-4 z-[150] bg-black/60 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-2 hover:bg-black/80 transition-all animate-in fade-in"
          >
            📋 <span className="text-sm font-bold">训练计划</span>
          </button>
        )}

        {/* 训练计划面板（展开状态） */}
        {isPlanOpen && (
          <div className="absolute top-20 right-4 w-64 max-h-[65vh] rounded-2xl md:w-80 md:right-8 md:top-24 md:bottom-24 md:max-h-none md:rounded-3xl bg-black/80 md:bg-black/40 backdrop-blur-xl border border-white/20 p-4 md:p-6 flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.5)] z-[100] animate-in slide-in-from-right-8 fade-in duration-300">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 md:pb-4 mb-4 md:mb-6">
              <h2 className="text-white text-base md:text-xl font-bold flex items-center">
                📋 今日 AI 专属计划
              </h2>
              <button 
                onClick={() => setIsPlanOpen(false)}
                className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 md:space-y-4 custom-scrollbar pr-2">
            {aiPlan.map((task, index) => {
              const taskId = task.id !== undefined ? task.id : index;
              const isCompleted = completedTasks.includes(taskId);
              const isActive = activeTaskIndex === index;
              
              return (
                <div 
                  key={taskId} 
                  className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all ${
                    isCompleted ? 'bg-green-500/10 border-green-500/30' : 
                    isActive ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                    'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={`font-bold text-sm md:text-base ${isCompleted ? 'text-green-400 line-through opacity-60' : 'text-white'}`}>
                      {index + 1}. {task.name}
                    </h3>
                    {isCompleted && <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-green-400" />}
                  </div>
                  
                  {!isCompleted && (
                    <button 
                      onClick={() => startWorkout(index)}
                      disabled={activeTaskIndex !== null}
                      className={`mt-2 w-full py-1.5 md:py-2 rounded-lg md:rounded-xl flex items-center justify-center font-bold text-xs md:text-sm transition-all ${
                        isActive ? 'bg-blue-500 text-white animate-pulse' : 
                        activeTaskIndex !== null ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed' : 
                        'bg-white text-black hover:bg-gray-200'
                      }`}
                    >
                      {isActive ? '训练进行中...' : <><PlayCircle className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" /> 开始训练</>}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {completedTasks.length === aiPlan.length && (
            <div className="mt-4 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-2xl text-center animate-pulse">
              <span className="text-2xl block mb-1">🏆</span>
              <p className="text-yellow-400 font-bold text-sm">今日健康积分 +100</p>
              <p className="text-white/60 text-xs mt-1">已同步至脑宇宙</p>
            </div>
          )}
        </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 4px; }
      `}</style>
    </div>
  );
}