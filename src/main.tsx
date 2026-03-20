import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App'; // 直接引入 App
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 这里绝对不能再包 <BrowserRouter> 了，直接渲染 App 即可 */}
    <App />
  </React.StrictMode>
);