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
  const mcpData = JSON.parse(fs.readFileSync('mcp.json', 'utf-8'));
  
  console.log("Creating Integration...");
  const res = await request('https://app.mindos.com/gate/lab/api/integrations/create', {
    method: 'POST',
    headers: { 'token': token, 'Content-Type': 'application/json' }
  }, mcpData);
  
  console.log("Integration Creation Result:", JSON.stringify(res, null, 2));
}

run();