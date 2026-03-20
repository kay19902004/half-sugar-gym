import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  height?: number;
  weight?: number;
  shades?: string[];
}

interface AppState {
  token: string | null;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  setToken: (token: string) => void;
  setUserInfo: (info: UserInfo) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      userInfo: null,
      
      setToken: (token: string) => set({ 
        token, 
        isAuthenticated: !!token 
      }),
      
      setUserInfo: (info: UserInfo) => set({ 
        userInfo: info 
      }),
      
      logout: () => set({ 
        token: null, 
        isAuthenticated: false, 
        userInfo: null 
      }),
    }),
    {
      name: 'secondme-fitness-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the token and auth state, you might want to fetch fresh user info on load
      partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
