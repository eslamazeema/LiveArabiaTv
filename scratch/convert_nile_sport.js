const https = require('https');
const crypto = require('crypto');

function fetchUrl(url, options = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, options, (res) => {
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

function postData(url, postBody, headers = {}) {
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
        body: Buffer.concat(data).toString('utf8')
      }));
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

async function convertElahmadToM3u8(channelId) {
  console.log(`1. Fetching radiant.php?id=${channelId}...`);
  const pageRes = await fetchUrl(`https://www.elahmad.ru/tv/radiant.php?id=${channelId}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });

  const pageHtml = pageRes.body.toString('utf8');
  const csrfMatch = pageHtml.match(/name="csrf-token" content="([^"]+)"/);
  if (!csrfMatch) throw new Error('CSRF token not found');
  const csrf = csrfMatch[1];
  console.log('CSRF Token:', csrf);

  let cookieHeader = '';
  if (pageRes.headers['set-cookie']) {
    cookieHeader = pageRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }

  console.log(`2. Posting to embed_result_elahmad_82.php for ${channelId}...`);
  const postBody = `id=${channelId}&csrf_token=${encodeURIComponent(csrf)}`;
  const apiRes = await postData('https://www.elahmad.ru/tv/result/embed_result_elahmad_82.php', postBody, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`,
    'Origin': 'https://www.elahmad.ru',
    'Cookie': cookieHeader
  });

  const json = JSON.parse(apiRes.body);
  const cipher = Buffer.from(json.link_4, 'base64');
  const key = Buffer.from(json.key, 'hex');
  const iv = Buffer.from(json.iv, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(cipher, null, 'utf8');
  decrypted += decipher.final('utf8');

  console.log('Decrypted URL:', decrypted);
  const baseUrl = decrypted.replace('/index.html', '');

  // 3. Fetch sub-playlist (v0 or index)
  let subPlUrl = `${baseUrl}/v0/playlist.html`;
  let plRes = await fetchUrl(subPlUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
    }
  });

  if (plRes.status !== 200) {
    // try direct index
    subPlUrl = decrypted;
    plRes = await fetchUrl(subPlUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
      }
    });
  }

  const rawM3u8 = plRes.body.toString('utf8');
  console.log('\nPlaylist status:', plRes.status);
  console.log('Playlist preview:\n', rawM3u8.slice(0, 400));

  // Rewrite chunks: strip k9x_
  const rewritten = rawM3u8.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const cleanChunk = trimmed.replace('k9x_', '');
      return `${baseUrl}/v0/${cleanChunk}`;
    }
    return line;
  }).join('\n');

  return { baseUrl, rewritten };
}

convertElahmadToM3u8('nile_sport').then(res => {
  console.log('\n=======================================');
  console.log('SUCCESSFULLY GENERATED CLEAN .M3U8 FOR NILE SPORT:');
  console.log(res.rewritten.slice(0, 500));
  console.log('=======================================');
}).catch(err => console.error('Error:', err));
