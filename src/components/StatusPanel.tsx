import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatusData {
  height: number;
  weight: number;
  bmi: number;
  trend: 'up' | 'down' | 'stable';
}

export default function StatusPanel({ data }: { data: StatusData }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm w-full">
      <h3 className="text-gray-800 font-semibold mb-4 text-lg">用户状态 (User Status)</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Height */}
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">身高</span>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{data.height}</span>
            <span className="text-xs text-gray-500 ml-1">cm</span>
          </div>
        </div>

        {/* Weight */}
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">体重</span>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{data.weight}</span>
            <span className="text-xs text-gray-500 ml-1">kg</span>
          </div>
        </div>

        {/* BMI */}
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm mb-1">BMI</span>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold text-[#FF6A00]">{data.bmi.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center text-sm border-t border-gray-100 pt-3">
        <span className="text-gray-500 mr-2">近期趋势:</span>
        {data.trend === 'up' && (
          <div className="flex items-center text-red-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>上升</span>
          </div>
        )}
        {data.trend === 'down' && (
          <div className="flex items-center text-[#00C48C]">
            <TrendingDown className="w-4 h-4 mr-1" />
            <span>下降</span>
          </div>
        )}
        {data.trend === 'stable' && (
          <div className="flex items-center text-gray-400">
            <Minus className="w-4 h-4 mr-1" />
            <span>稳定</span>
          </div>
        )}
      </div>
    </div>
  );
}
