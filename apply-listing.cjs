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
  
  console.log("\nApplying for listing with all fields...");
  const listingRes = await request(`https://app.mindos.com/gate/lab/api/applications/external/${appId}/apply-listing`, {
    method: 'POST',
    headers: { 'token': token, 'Content-Type': 'application/json' }
  }, {
    appName: "Half Sugar Gym",
    appDescription: "这是一个链接真实世界，真正能够帮助你解决身材问题和健康问题的智能健身房，我们的Agent教练将会根据你的实际状况为你量身定制健身计划。",
    redirectUris: ["https://half-sugar-gym.up.railway.app/oauth/callback"],
    allowedScopes: ["user.info", "chat"],
    subtitle: "AI 驱动的智能健身房",
    iconUrl: "https://mindverseglobal-cos-1309544882.cos.ap-shanghai.myqcloud.com/uploads/2268239/20260320/16a222f0acc44b7e.png",
    ogImageUrl: "https://mindverseglobal-cos-1309544882.cos.ap-shanghai.myqcloud.com/uploads/2268239/20260320/a443747410fa4435.png",
    screenshots: ["https://mindverseglobal-cos-1309544882.cos.ap-shanghai.myqcloud.com/uploads/2268239/20260320/a443747410fa4435.png"],
    websiteUrl: "https://half-sugar-gym.up.railway.app",
    supportUrl: "https://half-sugar-gym.up.railway.app",
    privacyPolicyUrl: "https://half-sugar-gym.up.railway.app"
  });
  console.log("Listing res:", listingRes);
}

run();