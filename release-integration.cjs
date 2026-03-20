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
  const integrationId = 'c5c2b5fd-d4c7-4480-b25b-2e594b3b0694';
  
  console.log("Validating Integration...");
  const validateRes = await request(`https://app.mindos.com/gate/lab/api/integrations/${integrationId}/validate`, {
    method: 'POST',
    headers: { 'token': token, 'Content-Type': 'application/json' }
  }, { versionNumber: 1 });
  
  console.log("Validation Result:", JSON.stringify(validateRes, null, 2));

  // If validation passes or has acceptable warnings, release it
  if (validateRes.code === 0) {
    console.log("\nSubmitting for Release...");
    const releaseRes = await request(`https://app.mindos.com/gate/lab/api/integrations/${integrationId}/release`, {
      method: 'POST',
      headers: { 'token': token, 'Content-Type': 'application/json' }
    }, { versionNumber: 1 });
    console.log("Release Result:", JSON.stringify(releaseRes, null, 2));
  }
}

run();