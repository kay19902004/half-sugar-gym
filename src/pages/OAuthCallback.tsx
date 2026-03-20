import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { useUserStore } from '@/store'; // 引入全局的用户仓库
import { fetchCurrentUserInfo } from '@/services/authService'; // 引入获取真实信息的 API

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // 从全局仓库拿出存 Token 和存用户信息的方法
  const setToken = useAppStore(state => state.setToken);
  const setCurrentUser = useUserStore(state => state.setCurrentUser); 
  
  const [error, setError] = useState('');
  
  // 🔐 核心防连击锁：防止 React Strict Mode 发送两次请求
  const isProcessing = useRef(false); 

  useEffect(() => {
    const code = searchParams.get('code');
    if (!code) {
      setError('URL 中缺少授权码 (code)');
      return;
    }

    // 如果已经请求过了，直接拦截，不准发第二次！
    if (isProcessing.current) return;
    isProcessing.current = true;

    const fetchTokenAndUser = async () => {
      try {
        const redirectUri = window.location.origin + '/oauth/callback';
        
        // 1. 去后厨（3001 端口）换取真实的 Access Token
        const response = await fetch('http://localhost:3001/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, redirect_uri: redirectUri })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '换取 Token 失败');
        }

        // ✅ 成功拿到 Token，存入 Zustand
        setToken(data.access_token);
        
        // 2. 🌟 灵魂注入：拿着刚到手的 Token，去 SecondMe 拉取你的真实信息！
        try {
          const userInfo = await fetchCurrentUserInfo(data.access_token);
          console.log("✅ 成功拉取真实身份:", userInfo);
          
          // 把真实信息存入全局状态（彻底替换掉之前的 User A）
          setCurrentUser({
            id: userInfo.id || `user_${Date.now()}`,
            name: userInfo.name || '真实玩家', 
            // 如果你在后台没有配 Shades，这里会给一个默认的
            shades: userInfo.shades && userInfo.shades.length > 0 ? userInfo.shades : ['健身达人', '喜欢交友'],
            avatar: userInfo.avatar || ''
          });
        } catch (infoErr) {
          // 就算拉取信息失败了，也不要卡死用户，打印个警告继续放行
          console.warn("⚠️ 获取个人信息失败，使用默认身份", infoErr);
          setCurrentUser({
            id: `user_${Date.now()}`,
            name: '神秘健身客',
            shades: ['力量训练'],
            avatar: ''
          });
        }

        // 3. 🚀 核心跳跃：带着真实的灵魂，冲进健身房！
        navigate('/gym', { replace: true });

      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err.message);
      }
    };

    fetchTokenAndUser();
  }, [searchParams, navigate, setToken, setCurrentUser]);

  // --- 下面是页面渲染 UI 部分 ---

  if (error) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center text-white font-sans">
        <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-2xl shadow-2xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">授权失败</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors">
            返回登录页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center text-white font-sans">
       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-transparent border-t-blue-500 border-b-pink-500 mb-6 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
       <p className="text-lg font-medium tracking-widest animate-pulse text-white/80">正在同步脑宇宙真实身份...</p>
    </div>
  );
}