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
  console.log("Fetching app list...");
  const res = await request('https://app.mindos.com/gate/lab/api/applications/external/list', {
    method: 'GET',
    headers: { 'token': token }
  });
  console.log(JSON.stringify(res, null, 2));
}

run();