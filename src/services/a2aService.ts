// 1. 流式聊天搭讪
export const generateIcebreakerStream = async (
  token: string, 
  myInfo: { name: string, shades: string[] }, 
  strangerInfo: { name: string, shades: string[] },
  onChunk: (text: string) => void
) => {
  console.log("🚀 开始请求 SecondMe Chat API...");
  
  const response = await fetch('/gate/lab/api/secondme/chat/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `我遇到了健身房的跑友 ${strangerInfo.name}，他/她的兴趣是 ${strangerInfo.shades.join(',')}。请主动向他/她打个招呼，一两句话即可，语气要自然、热情，符合我（${myInfo.name}，喜欢${myInfo.shades.join(',')}）的人设。不要输出任何解释。`,
      systemPrompt: '你现在是一个在虚拟健身房里锻炼的真实人类分身。',
      model: 'anthropic/claude-sonnet-4-5'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ API 请求失败:", response.status, errorText);
    throw new Error(`API 报错: ${response.status}`);
  }

  if (!response.body) throw new Error('ReadableStream not supported.');
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').map(line => line.trim());
    
    for (const line of lines) {
      if (!line) continue;

      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        
        if (dataStr === '[DONE]') {
          console.log("✅ 流式接收完毕");
          break;
        }

        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content || '';
          fullText += content;
          onChunk(fullText);
        } catch (e) {
          console.error('⚠️ SSE JSON 解析错误, 原始数据:', dataStr);
        }
      } else if (line.startsWith('{')) {
         console.warn("⚠️ 收到非预期的 JSON:", line);
      }
    }
  }
  
  console.log("📝 最终生成的搭讪内容:", fullText);
  return fullText;
};

// 2. 上报社交记忆
export const saveSocialMemory = async (token: string, strangerName: string, chatSummary: string) => {
  if (!chatSummary) return;

  const response = await fetch('/gate/lab/api/secondme/agent_memory/ingest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: { kind: 'thread' },
      action: 'reply',
      displayText: `在自主健身房遇到了 ${strangerName}。聊天记录：${chatSummary}`,
      refs: [
        {
          objectType: 'user_interaction',
          objectId: `user_${Date.now()}`,
          contentPreview: chatSummary
        }
      ],
      importance: 0.6
    })
  });
  return response.json();
};

// 3. 小美的流式回复逻辑
export const generateReplyStream = async (
  token: string, 
  myInfo: { name: string, shades: string[] }, 
  strangerInfo: { name: string, shades: string[] },
  chatHistory: string, 
  onChunk: (text: string) => void
) => {
  console.log("🚀 开始请求小美的回复...");
  
  const response = await fetch('/gate/lab/api/secondme/chat/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `我是 ${myInfo.name}，刚才我对你说："${chatHistory}"。请根据你的兴趣（${strangerInfo.shades.join(',')}），给我一个自然、友好的简短回复，一两句话即可。不要输出任何解释，直接说话。`,
      systemPrompt: `你现在是健身房里的真实用户 ${strangerInfo.name}。`,
      model: 'anthropic/claude-sonnet-4-5'
    })
  });

  if (!response.ok) throw new Error(`小美 API 报错: ${response.status}`);
  if (!response.body) throw new Error('ReadableStream not supported.');
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').map(line => line.trim());
    
    for (const line of lines) {
      if (!line) continue;
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') break;
        try {
          const data = JSON.parse(dataStr);
          fullText += data.choices?.[0]?.delta?.content || '';
          onChunk(fullText); 
        } catch (e) {}
      }
    }
  }
  return fullText;
};

// 4. 教练生成综合体测与训练计划的流式接口（全能私教版）
export const generateCoachPlanStream = async (
  token: string, 
  userInfo: { name: string, shades: string[] }, 
  userInput: string,
  onChunk: (text: string) => void
) => {
  const response = await fetch('/gate/lab/api/secondme/chat/stream', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: `作为我的高级AI私教，我的数据/诉求是："${userInput}"，我的运动偏好是："${userInfo.shades.join(',')}"。
      请严格按以下两步执行：
      1. 先用一句话点评并鼓励我。
      2. 紧接着，立刻输出一个综合体测与训练计划的 JSON 对象！必须根据我的身高体重计算BMI！
      JSON格式必须严格如下(不要输出任何markdown标记)：
      {
        "stats": {
          "height": 175,
          "weight": 85,
          "bmi": 27.8,
          "status": "偏胖"
        },
        "diet": "建议采用高蛋白低碳水饮食，多吃鸡胸肉、西兰花，戒除含糖饮料。",
        "workouts": [
          {"id": 1, "name": "深蹲", "duration": 5, "tips": ["保持呼吸", "稳住"]},
          {"id": 2, "name": "哑铃卧推", "duration": 3, "tips": ["核心收紧", "坚持"]}
        ]
      }`
    })
  });

  if (!response.ok) throw new Error('教练 API 报错');
  if (!response.body) throw new Error('ReadableStream not supported.');
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let fullText = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    
    const lines = chunk.split('\n').map(line => line.trim());
    for (const line of lines) {
      if (!line) continue;
      if (line.startsWith('data: ')) {
        const dataStr = line.slice(6).trim();
        if (dataStr === '[DONE]') break;
        try {
          const data = JSON.parse(dataStr);
          const content = data.choices?.[0]?.delta?.content || data.message?.content || data.content || '';
          fullText += content;
          
          // 🚀 核心修改：遇到 '{' 截断，防止大模型的 JSON 代码直接打印在聊天气泡里
          const displayOnlyText = fullText.split('{')[0].trim();
          onChunk(displayOnlyText || '教练正在为您生成专属体测报告...'); 
        } catch (e) {}
      }
    }
  }
  return fullText;
};

// 5. 训练完成后的“记忆同步”接口
export const syncWorkoutToBrain = async (token: string, actions: string[]) => {
  console.log("🧠 正在将训练成果写入脑宇宙记忆...");
  const actionListStr = actions.join('、');
  const memoryText = `学员今天非常出色地完成了我安排的训练计划，包含动作：${actionListStr}。请记住TA的努力，下次见面时要夸奖TA！`;

  try {
    const response = await fetch('/gate/lab/api/secondme/memory/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: memoryText
      })
    });
    
    if (response.ok) {
      console.log("✅ 记忆同步成功！AI 已记住你的汗水！");
    }
  } catch (error) {
    console.error("同步记忆失败:", error);
  }
};