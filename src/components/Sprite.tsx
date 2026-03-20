import React from 'react';

// 🌟 基础资源
import playerWalkImg from '@/assets/player-walk.png'; 
import xiaoliIdleImg from '@/assets/xiaoli-idle.png';
import chloeRunImg from '@/assets/chloe-run.png';
import vSelfieImg from '@/assets/v-selfie.png';
import xiaomeiIdleImg from '@/assets/xiaomei-idle.png';

// 🌟 私教区硬核资产 (包含新增的 6 个动作)
import coachIdleImg from '@/assets/coach-idle.png';
import coachSquatImg from '@/assets/coach-squat.png';
import playerSquatImg from '@/assets/player-squat.png';
import coachBenchpressImg from '@/assets/coach-benchpress.png';
import playerBenchpressImg from '@/assets/player-benchpress.png';
// 新增的 6 张图：
import playerWaterImg from '@/assets/player-water.png';
import coachCurlImg from '@/assets/coach-curl.png';
import playerCurlImg from '@/assets/player-curl.png';
import coachDeadliftImg from '@/assets/coach-deadlift.png';
import playerDeadliftImg from '@/assets/player-deadlift.png';
import coachCheerImg from '@/assets/coach-cheer.png';

// 🚀 扩展动作类型
export type ActionType = 'idle' | 'walk' | 'selfie' | 'run' | 'squat' | 'bench_press' | 'curl' | 'deadlift' | 'water' | 'cheer';
export type CharacterId = 'xiaoli' | 'chloe' | 'v-influencer' | 'xiaomei' | 'player' | 'coach';

interface SpriteProps {
  characterId?: CharacterId | string;
  actionType: ActionType | string;
  width?: number;
  unit?: string;
  className?: string;
}

export default function Sprite({ 
  characterId = 'player',
  actionType, 
  width = 120, 
  unit = "px",
  className = ""
}: SpriteProps) {

  const getSpriteConfig = () => {
    // 🏋️‍♂️ 教练动作库
    if (characterId === 'coach') {
      if (actionType === 'squat') return { img: coachSquatImg, frames: 6 };
      if (actionType === 'bench_press') return { img: coachBenchpressImg, frames: 4 };
      if (actionType === 'curl') return { img: coachCurlImg, frames: 6 }; // 弯举
      if (actionType === 'deadlift') return { img: coachDeadliftImg, frames: 8 }; // 划船/硬拉
      if (actionType === 'cheer') return { img: coachCheerImg, frames: 6 }; // 欢呼
      return { img: coachIdleImg, frames: 4 }; // 兜底：待机
    }
    // 🏃‍♂️ 玩家动作库
    if (characterId === 'player') {
      if (actionType === 'squat') return { img: playerSquatImg, frames: 6 };
      if (actionType === 'bench_press') return { img: playerBenchpressImg, frames: 4 };
      if (actionType === 'curl') return { img: playerCurlImg, frames: 6 };
      if (actionType === 'deadlift') return { img: playerDeadliftImg, frames: 8 };
      if (actionType === 'water') return { img: playerWaterImg, frames: 4 }; // 喝水
      return { img: playerWalkImg, frames: 4 }; // 兜底：走路/待机
    }
    // 大厅 NPC 逻辑
    if (characterId === 'xiaoli' && actionType === 'idle') return { img: xiaoliIdleImg, frames: 4 };
    if (characterId === 'chloe' && actionType === 'run') return { img: chloeRunImg, frames: 4 };
    if (characterId === 'v-influencer' && actionType === 'selfie') return { img: vSelfieImg, frames: 4 };
    if (characterId === 'xiaomei' && actionType === 'idle') return { img: xiaomeiIdleImg, frames: 4 };
    
    return { img: playerWalkImg, frames: 4 }; 
  };

  const { img, frames } = getSpriteConfig();

  if (!img) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: `${width}${unit}`, height: `${width}${unit}` }}>
        <div className="w-full h-full bg-red-500/50 rounded-full"></div>
      </div>
    );
  }

  // 调整不同动作的播放速度
  let duration = '0.8s';
  if (actionType === 'run') duration = '0.5s';  
  if (actionType === 'idle' || actionType === 'water') duration = '1.2s'; 
  if (actionType === 'squat' || actionType === 'deadlift') duration = '1.5s'; // 大重量动作慢一点
  if (actionType === 'cheer') duration = '1.0s';

  return (
    <div 
      className={`relative flex items-end justify-center pixelated ${className}`} 
      style={{ width: `${width}${unit}`, height: `${width}${unit}` }}
    >
      <style>{`
        @keyframes slide-strip-${frames} {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>
      <div className="relative overflow-hidden" style={{ width: '55%', height: '100%' }}>
        <div 
          className="absolute top-0 left-0 h-full"
          style={{ width: `${frames * 100}%`, animation: `slide-strip-${frames} ${duration} steps(${frames}) infinite` }}
        >
          <img src={img} alt={actionType} className="w-full h-full block" style={{ objectFit: 'fill' }} />
        </div>
      </div>
    </div>
  );
}