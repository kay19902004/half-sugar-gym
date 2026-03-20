import { create } from 'zustand';

export interface WorkoutTask {
  id: number;
  name: string;
  duration: number;
  tips: string[];
}

interface WorkoutState {
  plan: WorkoutTask[];
  setPlan: (plan: WorkoutTask[]) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  plan: [], // 初始为空
  setPlan: (plan) => set({ plan }),
}));