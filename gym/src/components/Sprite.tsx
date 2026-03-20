import React from 'react';

// 🌟 引入所有像素美术资源
import playerWalkImg from '@/assets/player-walk.png'; 
import coachGestureImg from '@/assets/coach-gesture.png'; 
import xiaoliIdleImg from '@/assets/xiaoli-idle.png';
import chloeRunImg from '@/assets/chloe-run.png';
import vSelfieImg from '@/assets/v-selfie.png';
import xiaomeiIdleImg from '@/assets/xiaomei-idle.png';
import benchPressImg from '@/assets/bench-press.png';

export type ActionType = 'idle' | 'walk' | 'workout' | 'coach_talk' | 'selfie' | 'run';
export type CharacterId = 'xiaoli' | 'chloe' | 'v-influencer' | 'xiaomei' | 'player' | 'coach';

interface SpriteProps {
  x?: number;
  y?: number;
  characterId?: CharacterId | string;
  actionType: ActionType | string;
  exerciseName?: string | null;
  width?: number;
  unit?: string;
  className?: string;
  useImage?: boolean;
}

export default function Sprite({ 
  characterId,
  actionType, 
  exerciseName,
  width = 120, 
  unit = "px",
  className = ""
}: SpriteProps) {

  const getSpriteConfig = () => {
    if (actionType === 'workout' && exerciseName) return benchPressImg;
    const cid = characterId || 'player'; 
    if (cid === 'player' && actionType === 'walk') return playerWalkImg;
    if (cid === 'xiaoli' && actionType === 'idle') return xiaoliIdleImg;
    if (cid === 'chloe' && actionType === 'run') return chloeRunImg;
    if (cid === 'v-influencer' && actionType === 'selfie') return vSelfieImg;
    if (cid === 'xiaomei' && actionType === 'idle') return xiaomeiIdleImg;
    if (cid === 'coach') return coachGestureImg;
    if (cid === 'player') return playerWalkImg;
    return null;
  };

  const img = getSpriteConfig();

  if (!img) {
    return (
      <div className={`relative flex items-center justify-center ${className}`} style={{ width: `${width}${unit}`, height: `${width}${unit}` }}>
        <div className="w-full h-full bg-red-500/50 rounded-full flex items-center justify-center text-[10px] text-white font-bold">缺图</div>
      </div>
    );
  }

  let duration = '0.8s';
  if (actionType === 'run') duration = '0.5s';  
  if (actionType === 'idle') duration = '1.2s'; 
  if (actionType === 'selfie') duration = '1s'; 

  // 🚀 终极渲染引擎：正方形外壳 + 长方形视野
  return (
    <div 
      // 保持最外层是 120x120，这样人物在地图上的坐标就不会乱，并且 items-end 保证脚踩地
      className={`relative flex items-end justify-center pixelated ${className}`} 
      style={{ width: `${width}${unit}`, height: `${width}${unit}` }}
    >
      <style>{`
        @keyframes slide-strip {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
      `}</style>

      {/* 🚪 核心外挂：竖长方形取景框！将宽度限制为 55%，完美贴合人体的真实比例！彻底屏蔽两边的重影！ */}
      <div 
        className="relative overflow-hidden" 
        style={{ width: '55%', height: '100%' }}
      >
        {/* 🎬 4帧胶片带：宽度永远是取景框的 4 倍 */}
        <div 
          className="absolute top-0 left-0 h-full"
          style={{ width: '400%', animation: `slide-strip ${duration} steps(4) infinite` }}
        >
          <img 
            src={img} 
            alt={actionType}
            // 🚀 fill 属性：强行无视 AI 乱七八糟的原图比例，把图片严丝合缝地贴满胶片，保住所有头和脚！
            className="w-full h-full block" 
            style={{ objectFit: 'fill' }} 
          />
        </div>
      </div>
    </div>
  );
}