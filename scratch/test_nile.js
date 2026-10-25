const https = require('https');
const crypto = require('crypto');

async function test() {
  const pageRes = await new Promise(r => https.get('https://www.elahmad.ru/tv/radiant.php?id=nile_sport', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let d = []; res.on('data', c => d.push(c)); res.on('end', () => r({ headers: res.headers, body: Buffer.concat(d).toString('utf8') }));
  }));
  const csrf = pageRes.body.match(/name="csrf-token" content="([^"]+)"/)[1];
  const cookies = (pageRes.headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; ');

  const postBody = 'id=nile_sport&csrf_token=' + encodeURIComponent(csrf);
  const parsed = new URL('https://www.elahmad.ru/tv/result/embed_result_elahmad_82.php');
  const apiRes = await new Promise(r => {
    const req = https.request({
      hostname: parsed.hostname, port: 443, path: parsed.pathname, method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postBody),
        'User-Agent': 'Mozilla/5.0',
        'Referer': 'https://www.elahmad.ru/tv/radiant.php?id=nile_sport',
        'Origin': 'https://www.elahmad.ru',
        'Cookie': cookies
      }
    }, res => {
      let d = []; res.on('data', c => d.push(c)); res.on('end', () => r(Buffer.concat(d).toString('utf8')));
    });
    req.write(postBody); req.end();
  });

  const json = JSON.parse(apiRes);
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(json.key, 'hex'), Buffer.from(json.iv, 'hex'));
  let decrypted = decipher.update(Buffer.from(json.link_4, 'base64'), null, 'utf8') + decipher.final('utf8');
  console.log('Decrypted URL:', decrypted);

  // Fetch master
  const masterRes = await new Promise(r => https.get(decrypted, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let d = []; res.on('data', c => d.push(c)); res.on('end', () => r({ status: res.statusCode, body: Buffer.concat(d).toString('utf8') }));
  }));
  console.log('Master Status:', masterRes.status);
  console.log('Master Body:\n' + masterRes.body);

  const subLine = masterRes.body.split('\n').find(l => l.includes('mono.m3u8'));
  const baseUrl = decrypted.substring(0, decrypted.lastIndexOf('/') + 1);
  const subUrl = baseUrl + subLine.trim();
  console.log('Sub URL:', subUrl);

  const subRes = await new Promise(r => https.get(subUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let d = []; res.on('data', c => d.push(c)); res.on('end', () => r({ status: res.statusCode, body: Buffer.concat(d).toString('utf8') }));
  }));
  console.log('Sub Status:', subRes.status);
  console.log('Sub Body preview:\n' + subRes.body.slice(0, 400));

  // Check first ts chunk
  const chunkLine = subRes.body.split('\n').find(l => l.includes('.ts'));
  if (chunkLine) {
    const chunkSubBase = subUrl.substring(0, subUrl.lastIndexOf('/') + 1);
    const chunkUrl = (chunkLine.startsWith('http') ? chunkLine : chunkSubBase + chunkLine).trim();
    console.log('Chunk URL:', chunkUrl);
    const chunkRes = await new Promise(r => https.get(chunkUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let len = 0; res.on('data', c => len += c.length); res.on('end', () => r({ status: res.statusCode, length: len }));
    }));
    console.log('Chunk HTTP Status:', chunkRes.status, 'Bytes:', chunkRes.length);
  }
}
test().catch(console.error);
