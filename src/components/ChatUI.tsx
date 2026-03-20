import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'coach' | 'system';
}

interface ChatUIProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isLoading?: boolean;
}

export default function ChatUI({ messages, onSendMessage, isLoading }: ChatUIProps) {
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <h3 className="font-semibold text-gray-800">实时指导 (Live Coaching)</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isCoach = msg.sender === 'coach';
          const isSystem = msg.sender === 'system';
          
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isCoach ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  isCoach
                    ? 'bg-gradient-to-r from-[#FF6A00] to-orange-400 text-white rounded-tl-sm'
                    : 'bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-tr-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-2xl rounded-tl-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在生成训练计划...
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入您的指导消息..."
            disabled={isLoading}
            className="flex-1 h-12 px-4 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:border-[#FF6A00] focus:ring-1 focus:ring-[#FF6A00] transition-colors text-gray-800 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !inputText.trim()}
            className="h-12 px-6 bg-[#FF6A00] hover:bg-orange-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors flex items-center justify-center shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
