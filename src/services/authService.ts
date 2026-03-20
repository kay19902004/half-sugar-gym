export const getLoginUrl = (): string => {
  const clientId = import.meta.env.VITE_SECONDME_CLIENT_ID;
  
  if (!clientId) {
    console.error('未找到 VITE_SECONDME_CLIENT_ID 环境变量，请在根目录的 .env 文件中配置。');
  }

  const baseUrl = 'https://go.second.me/oauth/';
  
  // 1. 将常量的声明移到大括号外面
  const redirectUri = window.location.origin + '/oauth/callback';

  // 2. 在大括号里面使用标准的“键: 值”格式
  const params = new URLSearchParams({
    client_id: clientId || '',
    redirect_uri: redirectUri, 
    response_type: 'code',
    scope: 'user.info user.info.shades chat'
  });
  
  return `${baseUrl}?${params.toString()}`;
};

export const fetchCurrentUserInfo = async (token: string) => {
  try {
    const response = await fetch('https://api.mindverse.com/gate/lab/api/secondme/user/info', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.code === 0 && data.data) {
      return data.data;
    } else {
      throw new Error(data.message || 'API returned non-zero code');
    }
  } catch (error) {
    console.error('fetchCurrentUserInfo error:', error);
    throw error;
  }
};