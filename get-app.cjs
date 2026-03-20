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
  
  const getRes = await request(`https://app.mindos.com/gate/lab/api/applications/external/${appId}`, {
    method: 'GET',
    headers: { 'token': token }
  });
  console.log("App Details:", JSON.stringify(getRes, null, 2));
}

run();