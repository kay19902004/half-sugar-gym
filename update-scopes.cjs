const https = require('https');
const fs = require('fs');

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

async function run() {
  const token = fs.readFileSync('.secondme-token', 'utf-8').trim();
  const appId = '6f04b988-0307-49e8-9ccc-aecb943c4427';
  
  console.log("Updating app scopes...");
  const updateRes = await request(`https://app.mindos.com/gate/lab/api/applications/external/${appId}/update`, {
    method: 'POST',
    headers: { 'token': token, 'Content-Type': 'application/json' }
  }, {
    appName: "Half Sugar Gym",
    appDescription: "这是一个链接真实世界，真正能够帮助你解决身材问题和健康问题的智能健身房，我们的Agent教练将会根据你的实际状况为你量身定制健身计划。",
    redirectUris: ["https://half-sugar-gym.up.railway.app/oauth/callback"],
    // Added user.info.softmemory for social memory
    allowedScopes: ["user.info", "chat", "user.info.softmemory", "note.add"]
  });
  console.log("Update res:", updateRes);
}

run();