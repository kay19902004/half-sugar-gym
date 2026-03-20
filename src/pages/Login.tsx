import React from 'react';
import { getLoginUrl } from '@/services/authService';
import { Dumbbell } from 'lucide-react';

export default function Login() {
  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/assets/gym-bg.jpg')] bg-cover bg-center opacity-20 filter blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#1E1E1E] via-transparent to-[#1E1E1E]"></div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl flex flex-col items-center text-center">
        
        {/* Logo/Icon */}
        <div className="w-24 h-24 bg-gradient-to-br from-[#00C48C] to-[#008F66] rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,196,140,0.3)] transform rotate-3 hover:rotate-6 transition-transform">
          <Dumbbell className="w-12 h-12 text-white" />
        </div>

        {/* Titles */}
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-4">
          SecondMe Fitness
        </h1>
        <p className="text-gray-400 text-lg mb-10">
          连接你的数字分身，开启智能健身体验。
        </p>

        {/* Login Button */}
        <button 
          onClick={handleLogin}
          className="w-full relative group bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 overflow-hidden flex items-center justify-center"
        >
          {/* Button glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          
          <span className="relative z-10 flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            连接 SecondMe 账号
          </span>
        </button>

        <p className="text-xs text-gray-500 mt-6">
          登录即表示您同意我们的服务条款与隐私协议
        </p>
      </div>
    </div>
  );
}
