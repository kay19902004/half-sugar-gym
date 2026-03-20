const https = require('https');
const fs = require('fs');

function request(url, options, body = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(data);
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  const token = fs.readFileSync('.secondme-token', 'utf-8').trim();
  const integrationId = 'c5c2b5fd-d4c7-4480-b25b-2e594b3b0694';
  const payload = JSON.parse(fs.readFileSync('mcp.json', 'utf-8'));

  console.log('Updating Integration endpoint...');
  const res = await request(
    `https://app.mindos.com/gate/lab/api/integrations/${integrationId}/update`,
    {
      method: 'POST',
      headers: { token, 'Content-Type': 'application/json' },
    },
    payload
  );
  console.log(JSON.stringify(res, null, 2));
}

run();

