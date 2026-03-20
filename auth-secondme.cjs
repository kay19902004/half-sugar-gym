const https = require('https');

function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function start() {
  console.log("Starting SecondMe CLI Auth...");
  const res = await request('https://app.mindos.com/gate/lab/api/auth/cli/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (res.code !== 0) {
    console.error("Failed to create session:", res);
    return;
  }
  
  const { sessionId, userCode } = res.data;
  const authUrl = `https://develop.second.me/auth/cli?session=${sessionId}`;
  
  console.log("\n=============================================");
  console.log("请在浏览器中打开以下链接进行授权：");
  console.log(authUrl);
  console.log("如果需要输入 Code，请填写：", userCode);
  console.log("=============================================\n");
  console.log("正在等待授权完成 (polling)...");

  // poll
  const pollInterval = setInterval(async () => {
    const pollRes = await request(`https://app.mindos.com/gate/lab/api/auth/cli/session/${sessionId}/poll`, {
      method: 'GET'
    });
    
    if (pollRes.data && pollRes.data.status === 'authorized') {
      clearInterval(pollInterval);
      console.log("\n✅ 授权成功！");
      let token = pollRes.data.token;
      if (token.includes('|')) {
        token = token.split('|')[0];
      }
      console.log("Token已获取并保存到 .secondme-token");
      require('fs').writeFileSync('.secondme-token', token);
      process.exit(0);
    } else if (pollRes.data && pollRes.data.status === 'expired') {
      clearInterval(pollInterval);
      console.log("\n❌ 授权已过期，请重试。");
      process.exit(1);
    }
  }, 3000);
}

start();