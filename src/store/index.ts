import { create } from 'zustand';
import { ActionType } from '../components/Sprite';

interface UserInfo {
  id: string;
  name: string;
  height: number;
  weight: number;
  shades: string[]; // 兴趣标签
}

interface UserState {
  currentUser: UserInfo;
  setCurrentUser: (user: Partial<UserInfo>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: {
    id: 'user_a',
    name: '我 (User A)',
    height: 175,
    weight: 70,
    shades: ['力量训练', '增肌', '高蛋白饮食'],
  },
  setCurrentUser: (user) => set((state) => ({ currentUser: { ...state.currentUser, ...user } })),
}));

interface AgentMemory {
  id: string;
  participants: string[];
  summary: string;
  timestamp: number;
}

interface SocialState {
  memories: AgentMemory[];
  addMemory: (memory: AgentMemory) => void;
}

export const useSocialStore = create<SocialState>((set) => ({
  memories: [],
  addMemory: (memory) => set((state) => ({ memories: [...state.memories, memory] })),
}));
