const https = require('https');
const crypto = require('crypto');

function fetchHttps(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(data)
      }));
    }).on('error', reject);
  });
}

function postHttps(url, postBody, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = https.request({
      hostname: parsed.hostname,
      port: 443,
      path: parsed.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postBody),
        ...headers
      }
    }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        body: Buffer.concat(data).toString('utf8')
      }));
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

async function getElahmadM3u8(channelId) {
  const pageRes = await fetchHttps(`https://www.elahmad.ru/tv/radiant.php?id=${channelId}`, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  });
  const html = pageRes.body.toString('utf8');
  const csrfMatch = html.match(/name="csrf-token" content="([^"]+)"/);
  if (!csrfMatch) throw new Error('CSRF not found');
  const csrf = csrfMatch[1];
  let cookies = '';
  if (pageRes.headers['set-cookie']) {
    cookies = pageRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }

  const postBody = `id=${encodeURIComponent(channelId)}&csrf_token=${encodeURIComponent(csrf)}`;
  const apiRes = await postHttps('https://www.elahmad.ru/tv/result/embed_result_elahmad_82.php', postBody, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`,
    'Origin': 'https://www.elahmad.ru',
    'Cookie': cookies
  });

  const json = JSON.parse(apiRes.body);
  const cipher = Buffer.from(json.link_4, 'base64');
  const key = Buffer.from(json.key, 'hex');
  const iv = Buffer.from(json.iv, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(cipher, null, 'utf8');
  decrypted += decipher.final('utf8');

  // Case 1: .m3u8 stream (e.g. games2.elahmad.store)
  if (decrypted.includes('.m3u8')) {
    const masterRes = await fetchHttps(decrypted, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
    });
    const masterBody = masterRes.body.toString('utf8');
    const masterBase = decrypted.substring(0, decrypted.lastIndexOf('/') + 1);

    // If it's a master playlist pointing to subplaylists (e.g. mono.m3u8)
    const subLine = masterBody.split('\n').map(l => l.trim()).find(l => l && !l.startsWith('#') && l.includes('.m3u8'));
    if (subLine) {
      const subUrl = subLine.startsWith('http') ? subLine : masterBase + subLine;
      const subRes = await fetchHttps(subUrl, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
      });
      const subBody = subRes.body.toString('utf8');
      const subBase = subUrl.substring(0, subUrl.lastIndexOf('/') + 1);

      // Rewrite segment URLs to absolute URLs
      return subBody.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          return trimmed.startsWith('http') ? trimmed : subBase + trimmed;
        }
        return line;
      }).join('\n');
    }

    // Direct media playlist
    return masterBody.split('\n').map(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        return trimmed.startsWith('http') ? trimmed : masterBase + trimmed;
      }
      return line;
    }).join('\n');
  }

  // Case 2: html/chunk base (e.g. accessdatacloud.shop like natgeo_1)
  const baseUrl = decrypted.replace('/index.html', '');
  const plRes = await fetchHttps(`${baseUrl}/v0/playlist.html`, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
  });
  const rawM3u8 = plRes.body.toString('utf8');
  return rawM3u8.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const cleanChunk = trimmed.replace('k9x_', '');
      return `${baseUrl}/v0/${cleanChunk}`;
    }
    return line;
  }).join('\n');
}

async function run() {
  console.log('Testing Nile Sport...');
  const nileM3u8 = await getElahmadM3u8('nile_sport');
  console.log('Nile Sport preview:\n', nileM3u8.slice(0, 300));

  console.log('\nTesting Nat Geo...');
  const natgeoM3u8 = await getElahmadM3u8('natgeo_1');
  console.log('Nat Geo preview:\n', natgeoM3u8.slice(0, 300));
}

run().catch(console.error);
