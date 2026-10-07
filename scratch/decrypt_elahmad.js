const https = require('https');
const crypto = require('crypto');

function fetchPage() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.elahmad.ru',
      path: '/tv/radiant.php?id=natgeo_1',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.elahmad.ru/'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ html: data, cookies }));
    });
    req.on('error', reject);
    req.end();
  });
}

function fetchStreamData(csrf, cookies) {
  return new Promise((resolve, reject) => {
    const postData = `id=natgeo_1&csrf_token=${encodeURIComponent(csrf)}`;
    const cookieHeader = cookies.map(c => c.split(';')[0]).join('; ');

    const options = {
      hostname: 'www.elahmad.ru',
      path: '/tv/result/embed_result_elahmad_82.php',
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.elahmad.ru/tv/radiant.php?id=natgeo_1',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Cookie': cookieHeader,
        'X-Requested-With': 'XMLHttpRequest'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ raw: data, error: e.message });
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log("1. Fetching radiant.php?id=natgeo_1...");
  const { html, cookies } = await fetchPage();
  
  const csrfMatch = html.match(/meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  if (!csrfMatch) {
    console.error("Could not find csrf-token in HTML");
    return;
  }
  const csrf = csrfMatch[1];
  console.log("CSRF Token found:", csrf);

  console.log("2. Posting to embed_result_elahmad_82.php...");
  const result = await fetchStreamData(csrf, cookies);
  console.log("Server response:", result);

  if (result.link_4 && result.key && result.iv) {
    const key = Buffer.from(result.key, 'hex');
    const iv = Buffer.from(result.iv, 'hex');
    const ciphertext = Buffer.from(result.link_4, 'base64');

    const algo = key.length === 32 ? 'aes-256-cbc' : (key.length === 16 ? 'aes-128-cbc' : 'aes-192-cbc');
    console.log(`Key length: ${key.length} bytes -> Algo: ${algo}`);

    const decipher = crypto.createDecipheriv(algo, key, iv);
    decipher.setAutoPadding(true);
    let decrypted = decipher.update(ciphertext, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    console.log("\n=======================================================");
    console.log("SUCCESS! DECRYPTED .m3u8 STREAM URL:");
    console.log(decrypted);
    console.log("=======================================================\n");
  }
}

run().catch(console.error);
