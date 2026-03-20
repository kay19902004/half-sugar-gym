import React from 'react';
import { EquipmentConfig } from '@/config/gymMap';

interface EquipmentProps {
  config: EquipmentConfig;
  isEditMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export default function Equipment({ config, isEditMode, isSelected, onSelect }: EquipmentProps) {
  // Y-Sorting: y 值越大（越靠下），z-index 越高，确保遮挡关系正确
  const zIndex = Math.floor(config.y) + (config.zIndexOffset || 0);

  return (
    <div
      className={`absolute transition-all duration-300 ${isEditMode ? 'cursor-pointer hover:brightness-110' : ''} ${isSelected ? 'ring-4 ring-red-500 rounded-lg' : ''}`}
      style={{
        left: `${config.x}%`,
        top: `${config.y}%`,
        width: `${config.width}%`,
        zIndex,
        // 极其重要：底部中心对齐，如果存在旋转也一并应用
        transform: `translate(-50%, -100%) ${config.rotate ? `rotate(${config.rotate}deg)` : ''}`,
      }}
      onClick={(e) => {
        if (isEditMode && onSelect) {
          e.stopPropagation(); // 阻止冒泡，避免点击背景取消选中
          onSelect();
        }
      }}
    >
      <img 
        src={config.imageSrc} 
        alt={config.name} 
        className="w-full h-auto pointer-events-none drop-shadow-2xl select-none" 
        style={{ minHeight: '40px' }} // 防止图片未加载时容器塌陷
      />
      {isEditMode && (
        <div className="absolute top-0 left-0 bg-black/50 text-white text-[10px] px-1 rounded">
          {config.name}
        </div>
      )}
    </div>
  );
}
