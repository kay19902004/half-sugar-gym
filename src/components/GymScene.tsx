import React, { MouseEvent } from 'react';

export type Equipment = {
  id: string;
  src: string;
  x: number; 
  y: number; 
  width?: number; 
  zIndex?: number;
};

// 严格按照图2 (参考图) 重新排布的坐标库
export const INITIAL_EQUIPMENT: Equipment[] = [
  // === 左上：靠窗有氧区 (跑步机 + 椭圆机) ===
  { id: 'treadmill_1', src: '/assets/treadmill.png', x: 46, y: 29, width: 16 },
  { id: 'treadmill_2', src: '/assets/treadmill.png', x: 38, y: 32, width: 16 },
  { id: 'treadmill_3', src: '/assets/treadmill.png', x: 31, y: 35, width: 16 },

  { id: 'elliptical_1', src: '/assets/elliptica.png', x: 23, y: 38, width: 12 },
  { id: 'elliptical_2', src: '/assets/elliptica.png', x: 17, y: 40, width: 12 },
  { id: 'elliptical_3', src: '/assets/elliptica.png', x: 11, y: 42, width: 12 },

  // === 中上：蓝色拉伸区 ===
  { id: 'wooden_ladder', src: '/assets/wooden-ladder.png', x: 45, y: 44, width: 8 },
  { id: 'plyo_box', src: '/assets/plyo-box-color.png', x: 52, y: 38, width: 9 },
  { id: 'yoga_ball_grey', src: '/assets/yoga-ball-grey.png', x: 62, y: 38, width: 7 },
  { id: 'medicine_ball', src: '/assets/medicine-ball.png', x: 56, y: 45, width: 5 },
  
  // 地垫必须 zIndex: 0
  { id: 'yoga_mat_purple', src: '/assets/yoga-mat-purple.png', x: 42, y: 48, width: 7, zIndex: 0 },
  { id: 'yoga_mat_black', src: '/assets/yoga-mat-black.png', x: 48, y: 48, width: 7, zIndex: 0 },
  { id: 'mat_with_blocks', src: '/assets/mat-with-blocks.png', x: 65, y: 45, width: 13, zIndex: 0 },

  // === 右上：墙边收纳区 ===
  { id: 'kettlebell_water', src: '/assets/kettlebell-water-group.png', x: 75, y: 30, width: 8 },
  { id: 'kettlebell_group', src: '/assets/kettlebell-group.png', x: 80, y: 38, width: 4 },
  { id: 'ball_stand', src: '/assets/ball_stand.png', x: 92, y: 45, width: 5 },

  // === 中间偏右：重型力量区 ===
  { id: 'smith_machine', src: '/assets/smith-machine.png', x: 48, y: 65, width: 22 },
  { id: 'cable_machine', src: '/assets/cable-machine.png', x: 75, y: 62, width: 22 },

  // === 左下：自由重量区 ===
  { id: 'dumbbell_rack', src: '/assets/dumbbell-rack.png', x: 25, y: 60, width: 9 },
  { id: 'flat_bench', src: '/assets/flat-bench.png', x: 15, y: 65, width: 12 },
  { id: 'pec_deck', src: '/assets/pec-deck.png', x: 12, y: 82, width: 15 },

  // === 中下：腿部训练 ===
  { id: 'leg_press', src: '/assets/leg_press_machine.png', x: 50, y: 90, width: 18 },

  // === 右下：杠铃/拳击区 ===
  { id: 'barbell_rack', src: '/assets/barbell_rack.png', x: 64, y: 72, width: 24 },
  { id: 'plate_tree', src: '/assets/plate-tree.png', x: 62, y: 88, width: 5 },
  { id: 'reflex_bag', src: '/assets/reflex-bag.png', x: 85, y: 85, width: 4 },
];

interface GymSceneProps {
  children?: React.ReactNode; 
}

export default function GymScene({ children }: GymSceneProps) {
  const handleBackgroundClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;
    
    const xPercent = Number(((xPx / rect.width) * 100).toFixed(2));
    const yPercent = Number(((yPx / rect.height) * 100).toFixed(2));

    console.log(
      `%c📍 Map Clicked! \n%cx: ${xPercent}, y: ${yPercent}`, 
      'color: #00C48C; font-weight: bold; font-size: 14px;', 
      'color: #FF6A00; font-weight: bold;'
    );
  };

  return (
    // 关键修复：外层容器相对定位，内部用真实 img 撑开比例，绝对不拉伸！
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-2xl border border-white/10">
      
      {/* 真实背景图，自然按比例缩放 */}
      <img 
        src="/assets/gym-bg.jpeg" 
        alt="Gym Background" 
        className="w-full h-auto block pointer-events-none"
      />

      {/* 绝对定位层，用于承载器械和点击事件 */}
      <div 
        className="absolute inset-0 cursor-crosshair"
        onClick={handleBackgroundClick}
      >
        {INITIAL_EQUIPMENT.map((equip) => {
          const calculatedZIndex = equip.zIndex !== undefined ? equip.zIndex : Math.floor(equip.y);

          return (
            <div
              key={equip.id}
              className="absolute transition-all duration-300 pointer-events-none"
              style={{
                left: `${equip.x}%`,
                top: `${equip.y}%`,
                width: equip.width ? `${equip.width}%` : 'auto',
                transform: 'translate(-50%, -100%)', // 保持底部中心对齐
                zIndex: calculatedZIndex,
              }}
            >
              <img 
                src={equip.src} 
                alt={equip.id} 
                className="w-full h-auto object-contain drop-shadow-xl" 
              />
            </div>
          );
        })}

        {/* 渲染人物和对话框 */}
        {children}
      </div>
    </div>
  );
}