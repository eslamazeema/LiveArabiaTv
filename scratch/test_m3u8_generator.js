const https = require('https');
const crypto = require('crypto');

let cachedBaseUrl = null;
let cacheTime = 0;

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

async function getNatGeoBaseUrl() {
  if (cachedBaseUrl && (Date.now() - cacheTime < 10 * 60 * 1000)) {
    return cachedBaseUrl;
  }

  // 1. Fetch radiant.php
  const pageRes = await fetchUrl('https://www.elahmad.ru/tv/radiant.php?id=natgeo_1', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });

  const pageHtml = pageRes.body.toString('utf8');
  const csrfMatch = pageHtml.match(/name="csrf-token" content="([^"]+)"/);
  if (!csrfMatch) throw new Error('CSRF token not found');
  const csrf = csrfMatch[1];

  let cookieHeader = '';
  if (pageRes.headers['set-cookie']) {
    cookieHeader = pageRes.headers['set-cookie'].map(c => c.split(';')[0]).join('; ');
  }

  // 2. Post to embed_result
  const postBody = `id=natgeo_1&csrf_token=${encodeURIComponent(csrf)}`;
  const apiRes = await postData('https://www.elahmad.ru/tv/result/embed_result_elahmad_82.php', postBody, {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://www.elahmad.ru/tv/radiant.php?id=natgeo_1',
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

  // decrypted is like: https://acc5.accessdatacloud.shop/sokaprem/pgezdbthvbps/index.html
  cachedBaseUrl = decrypted.replace('/index.html', '');
  cacheTime = Date.now();
  console.log('Resolved NatGeo stream base URL:', cachedBaseUrl);
  return cachedBaseUrl;
}

async function generateM3u8() {
  const baseUrl = await getNatGeoBaseUrl();
  // Fetch v0 playlist
  const plRes = await fetchUrl(`${baseUrl}/v0/playlist.html`, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': 'https://www.elahmad.ru/tv/radiant.php?id=natgeo_1'
    }
  });

  const rawM3u8 = plRes.body.toString('utf8');
  // Rewrite chunks: strip k9x_ and make absolute URL
  const rewritten = rawM3u8.split('\n').map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const cleanChunk = trimmed.replace('k9x_', '');
      return `${baseUrl}/v0/${cleanChunk}`;
    }
    return line;
  }).join('\n');

  return rewritten;
}

generateM3u8().then(m3u8 => {
  console.log('=== GENERATED CLEAN .M3U8 PLAYLIST ===');
  console.log(m3u8.slice(0, 600));
  console.log('=======================================');
}).catch(err => console.error(err));
