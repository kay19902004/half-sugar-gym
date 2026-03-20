import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import Sprite, { ActionType, CharacterId } from '@/components/Sprite';
import GymScene from '@/components/GymScene';
import { useUserStore, useSocialStore } from '@/store';
import { useAppStore } from '@/store/useAppStore';
import { generateIcebreakerStream, generateReplyStream, saveSocialMemory } from '@/services/a2aService';

// 🌟 核心造物：建立 AI 健身房“花名册” (NPC 数组 - 已修复坐标空气墙)
const gymNPCList = [
  {
    id: 'npc_xiaomei',
    name: '瑜伽女神小美',
    shades: ['瑜伽', '普拉提', '轻食'],
    pos: { x: 60, y: 55 }, // 挪到灰色大地垫右侧
    characterId: 'xiaomei' as CharacterId,
    action: 'idle' as ActionType,
  },
  {
    id: 'npc_xiaoli',
    name: '摸鱼小李',
    shades: ['跑步机摸鱼', '看手机', '想下班'],
    pos: { x: 85, y: 45 }, // 从架子上拔下来，放到右侧壶铃区前面的空地
    characterId: 'xiaoli' as CharacterId,
    action: 'idle' as ActionType,
  },
  {
    id: 'npc_chloe',
    name: '元气少女Chloe',
    shades: ['跑步机暴汗', '高强有氧', '耳机听电音'],
    pos: { x: 30, y: 75 }, // 左下角空地，很安全
    characterId: 'chloe' as CharacterId,
    action: 'run' as ActionType,
  },
  {
    id: 'npc_vinfluencer',
    name: '网红博主小V',
    shades: ['自拍机位', '网红打卡', '抱怨灯光不配合'],
    pos: { x: 32, y: 48 }, // 从跑步机边缘拉下来，挪到紫色瑜伽垫附近
    characterId: 'v-influencer' as CharacterId,
    action: 'selfie' as ActionType,
  }
];

export default function Gym() {
  const currentUser = useUserStore(state => state.currentUser);
  const addMemory = useSocialStore(state => state.addMemory);
  const memories = useSocialStore(state => state.memories);
  const token = useAppStore(state => state.token);

  // 玩家初始出生点在左下角安全区
  const [posA, setPosA] = useState({ x: 20, y: 80 }); 
  const [targetPos, setTargetPos] = useState({ x: 50, y: 60 }); 
  
  const [isInteracting, setIsInteracting] = useState(false);
  const [cooldown, setCooldown] = useState(false); 
  const [currentNPC, setCurrentNPC] = useState<typeof gymNPCList[0] | null>(null);
  const [chatBubble, setChatBubble] = useState<{ text: string; speaker: 'A' | 'B' } | null>(null);

  // 🤖 自主寻路漫游引擎 (已加入 Y 轴空气墙)
  useEffect(() => {
    if (isInteracting) return;

    const timer = setInterval(() => {
      setPosA(prev => {
        const dx = targetPos.x - prev.x;
        const dy = targetPos.y - prev.y;
        const distToTarget = Math.hypot(dx, dy);

        // 到达目标点，生成新的安全目标点
        if (distToTarget < 2) {
          setTargetPos({
            x: Math.max(10, Math.min(90, prev.x + (Math.random() - 0.5) * 60)),
            // 🚀 空气墙：强行限制只能在下半区(y: 40~85)溜达，绝对上不了墙！
            y: Math.max(40, Math.min(85, prev.y + (Math.random() - 0.5) * 60))
          });
          return prev;
        }

        const speed = 0.25;
        return {
          x: prev.x + (dx / distToTarget) * speed,
          y: prev.y + (dy / distToTarget) * speed
        };
      });
    }, 50); 

    return () => clearInterval(timer);
  }, [isInteracting, targetPos]);

  // 🤖 雷达探测系统
  useEffect(() => {
    if (isInteracting || cooldown) return; 

    let closestNPCData = null;
    let minDist = Infinity;

    for (const npc of gymNPCList) {
      const dist = Math.hypot(posA.x - npc.pos.x, posA.y - npc.pos.y);
      if (dist < minDist && dist < 12) { 
        minDist = dist;
        closestNPCData = npc;
      }
    }

    if (closestNPCData) {
      setCurrentNPC(closestNPCData);
      triggerA2AInteraction(closestNPCData);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posA, isInteracting, cooldown]);

  // 🤖 A2A 双向社交逻辑
  const triggerA2AInteraction = async (targetNPC: typeof gymNPCList[0]) => {
    if (!token) return;

    setIsInteracting(true);
    
    const infoA = { name: currentUser?.name || '真实玩家', shades: currentUser?.shades || ['力量训练'] };
    const infoB = { name: targetNPC.name, shades: targetNPC.shades };

    try {
      setChatBubble({ text: '...', speaker: 'A' });
      const finalChatA = await generateIcebreakerStream(
        token, infoA, infoB,
        (currentText) => setChatBubble({ text: currentText, speaker: 'A' })
      );
      if (!finalChatA) throw new Error("A 没有说话");

      await new Promise(res => setTimeout(res, 2500));
      setChatBubble(null);

      await new Promise(res => setTimeout(res, 500));
      setChatBubble({ text: '...', speaker: 'B' }); 
      const finalChatB = await generateReplyStream(
        token, infoA, infoB, finalChatA, 
        (currentText) => setChatBubble({ text: currentText, speaker: 'B' })
      );

      await new Promise(res => setTimeout(res, 4000));
      setChatBubble(null);

      const fullMemorySummary = `${infoA.name} 说："${finalChatA}"\n\n${infoB.name} 回复："${finalChatB}"`;
      await saveSocialMemory(token, targetNPC.name, fullMemorySummary);
      addMemory({
        id: Date.now().toString(),
        participants: [infoA.name, infoB.name],
        summary: fullMemorySummary,
        timestamp: Date.now()
      });

    } catch (error) {
      console.error("社交互动中断:", error);
      setChatBubble(null);
    }

    setIsInteracting(false);
    setCurrentNPC(null); 
    setCooldown(true); 
    
    // 🚀 聊完天离开的目标点，也必须加上空气墙限制！
    setTargetPos({ 
      x: Math.max(10, Math.min(90, 20 + Math.random() * 60)), 
      y: Math.max(40, Math.min(85, 40 + Math.random() * 40)) 
    }); 
    
    setTimeout(() => {
      setCooldown(false);
    }, 15000); 
  };

  return (
    <div className="min-h-screen relative bg-[#1E1E1E] overflow-hidden font-sans flex flex-col items-center justify-center">
      <header className="absolute top-0 left-0 right-0 h-14 bg-black/20 backdrop-blur-md flex items-center px-6 z-[9999] border-b border-white/10">
        <Link to="/" className="flex items-center text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          返回首页
        </Link>
        <h1 className="ml-auto text-white font-semibold text-lg tracking-wide">自主健身房 (Agent 小镇模拟器)</h1>
      </header>

      <div className="absolute top-20 left-6 z-[9999]">
        <Link 
          to="/studio" 
          className="bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(202,138,4,0.4)] flex items-center transition-all transform hover:scale-105 border border-yellow-400/50"
        >
          <span className="text-xl mr-2">🏋️‍♂️</span>
          进入 VIP 私教工作室
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 relative w-full mt-16 mb-20 z-0">
        <GymScene>
          
          <div className="absolute transition-all duration-75 pointer-events-none" style={{ left: `${posA.x}%`, top: `${posA.y}%`, zIndex: Math.floor(posA.y) + 100 }}>
            <Sprite x={0} y={0} characterId="player" actionType="walk" width={120} unit="px" />
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              {currentUser?.name || '真实玩家'} (User A)
            </div>
            {chatBubble?.speaker === 'A' && (
              <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 bg-white text-black text-sm px-4 py-3 rounded-2xl shadow-xl z-50 w-64 whitespace-normal break-words text-left leading-relaxed">
                {chatBubble.text}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
              </div>
            )}
          </div>

          {gymNPCList.map(npc => (
            <div 
              key={npc.id} 
              className="absolute transition-all duration-300 pointer-events-none" 
              style={{ left: `${npc.pos.x}%`, top: `${npc.pos.y}%`, zIndex: Math.floor(npc.pos.y) + 100 }}
            >
              <Sprite x={0} y={0} characterId={npc.characterId} actionType={npc.action} width={120} unit="px" />
              
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-700/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {npc.name}
              </div>
              
              {currentNPC?.id === npc.id && chatBubble?.speaker === 'B' && (
                <div className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 bg-white text-black text-sm px-4 py-3 rounded-2xl shadow-xl z-50 w-64 whitespace-normal break-words text-left leading-relaxed">
                  {chatBubble.text}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                </div>
              )}
            </div>
          ))}

        </GymScene>
      </div>

      <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md px-5 py-3 rounded-full border border-white/20 z-[9999] shadow-2xl flex items-center gap-3">
        <Activity className={`w-5 h-5 ${isInteracting ? 'text-yellow-400 animate-pulse' : cooldown ? 'text-gray-400' : 'text-green-400 animate-pulse'}`} />
        <span className="text-white text-sm font-bold tracking-wider">
          {isInteracting ? `正在与 ${currentNPC?.name || 'AI'} 进行社交...` : cooldown ? '社交冷却中，正在自主溜达...' : '自主漫游中...'}
        </span>
      </div>

      <div className="absolute bottom-24 right-6 bg-white/90 backdrop-blur-md rounded-xl p-4 shadow-lg min-w-[250px] max-w-[300px] z-[9999] border border-white/20 max-h-[35vh] flex flex-col">
        <div className="flex items-center text-gray-800 mb-3 font-semibold border-b border-gray-200 pb-2 shrink-0">
          <MessageSquare className="w-4 h-4 mr-2 text-blue-500" />
          社交记忆 (Agent Memory)
        </div>
        <div className="overflow-y-auto space-y-3 custom-scrollbar">
          {memories.length === 0 ? (
            <div className="text-sm text-gray-500 italic">暂无社交互动，等待 Agent 自主寻路偶遇...</div>
          ) : (
            memories.map(mem => (
              <div key={mem.id} className="text-sm bg-gray-50 p-2 rounded border border-gray-100 shadow-sm">
                <div className="text-xs text-gray-400 mb-1">{new Date(mem.timestamp).toLocaleTimeString()}</div>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">{mem.summary}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}