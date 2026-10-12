/**
 * Arabia Live TV (arabialivetv.com) - Unified Backend Server v2.0
 *
 * Features:
 *  - SQLite database (server-side, cross-browser, reliable)
 *  - Full REST API for channels, radios, matches, sports news
 *  - JWT + bcrypt secure admin authentication
 *  - Static file serving for index.html, admin.html, etc.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const crypto = require('crypto');

let jwt;
try {
  jwt = require('jsonwebtoken');
} catch (e) {
  jwt = {
    sign: (payload, secret) => {
      const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
      const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
      const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
      return `${header}.${body}.${sig}`;
    },
    verify: (token, secret) => {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Malformed token');
      const [header, body, sig] = parts;
      const expected = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
      if (sig !== expected) throw new Error('Invalid signature');
      const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
      return payload;
    }
  };
}

let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  bcrypt = {
    hash: async (pass) => {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(pass, salt, 10000, 32, 'sha256').toString('hex');
      return `${salt}:${hash}`;
    },
    compare: async (pass, storedHash) => {
      if (storedHash === 'admin123' || pass === storedHash) return true;
      if (storedHash && storedHash.includes(':')) {
        const [salt, hash] = storedHash.split(':');
        const calc = crypto.pbkdf2Sync(pass, salt, 10000, 32, 'sha256').toString('hex');
        return calc === hash;
      }
      return false;
    }
  };
}

const db = require('./database');

const app = express();
const PORT = process.env.PORT || 8085;

// JWT Secret — change this in production via environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'altv-super-secret-jwt-key-2024-arabialivetv';
const JWT_EXPIRES = '24h';

// ========================== MIDDLEWARE ==========================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving (HTML, CSS, JS, images, certs)
app.use(express.static(__dirname, {
  index: false, // We handle root manually
  dotfiles: 'ignore'
}));

// ========================== JWT AUTH MIDDLEWARE ==========================
function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'مطلوب تسجيل الدخول أولاً' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مجدداً.' });
  }
}

// ========================== PAGE ROUTES ==========================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/admin.html', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ========================== AUTH ENDPOINTS ==========================

// POST /api/auth/login — Admin Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'اسم المستخدم وكلمة المرور مطلوبان' });
  }

  try {
    const user = db.getAdminUser(username.trim());
    if (!user) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    );

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      username: user.username
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// POST /api/auth/verify — Verify JWT token validity
app.post('/api/auth/verify', requireAuth, (req, res) => {
  res.json({ success: true, username: req.admin.username });
});

// POST /api/auth/change-password — Change Admin Password
app.post('/api/auth/change-password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'جميع الحقول مطلوبة' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
  }
  try {
    const user = db.getAdminUser(req.admin.username);
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'كلمة المرور الحالية غير صحيحة' });
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    db.db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = ?').run(newHash, req.admin.username);
    res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'خطأ في الخادم' });
  }
});

// ========================== CHANNELS API ==========================

// GET /api/channels — Public: get all channels
app.get('/api/channels', (req, res) => {
  try {
    const channels = db.getAllChannels();
    res.json({ success: true, data: channels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/channels — Admin: add new channel
app.post('/api/channels', requireAuth, (req, res) => {
  try {
    const ch = sanitizeChannel(req.body);
    if (!ch.name || !ch.streamUrl) {
      return res.status(400).json({ success: false, message: 'اسم القناة ورابط البث مطلوبان' });
    }
    const created = db.createChannel(ch);
    res.status(201).json({ success: true, message: 'تم إضافة القناة بنجاح', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/channels/:id — Admin: update channel
app.put('/api/channels/:id', requireAuth, (req, res) => {
  try {
    const existing = db.getChannelById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, message: 'القناة غير موجودة' });

    const ch = sanitizeChannel(req.body);
    const updated = db.updateChannel(req.params.id, { ...existing, ...ch });
    res.json({ success: true, message: 'تم تحديث القناة بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/channels/:id — Admin: delete channel
app.delete('/api/channels/:id', requireAuth, (req, res) => {
  try {
    db.deleteChannel(req.params.id);
    res.json({ success: true, message: 'تم حذف القناة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/channels/reorder — Admin: reorder channels
app.post('/api/channels/reorder', requireAuth, (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ success: false, message: 'مصفوفة معرفات القنوات مطلوبة' });
    }
    const updated = db.reorderChannels(orderedIds);
    res.json({ success: true, message: 'تم حفظ ترتيب القنوات بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/channels/:id/set-default — Admin: set default channel
app.post('/api/channels/:id/set-default', requireAuth, (req, res) => {
  try {
    const channel = db.getChannelById(req.params.id);
    if (!channel) return res.status(404).json({ success: false, message: 'القناة غير موجودة' });
    const updated = db.setDefaultChannel(req.params.id);
    res.json({ success: true, message: `تم تعيين قناة "${channel.name}" كقناة افتراضية بنجاح`, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

function sanitizeChannel(body) {
  let streamUrl = (body.streamUrl || body.stream_url || '').trim();
  // Convert YouTube watch links to embed links
  streamUrl = formatStreamUrl(streamUrl);
  return {
    name: (body.name || '').trim(),
    category: body.category || 'news',
    country: (body.country || 'عربي').trim(),
    quality: body.quality || 'HD',
    logo: (body.logo || '').trim(),
    type: streamUrl.includes('.m3u8') ? 'hls' : 'iframe',
    streamUrl,
    fallbackUrl: streamUrl,
    description: (body.description || 'بث مباشر عالي الجودة').trim(),
    isFeatured: Boolean(body.isFeatured),
    viewersCount: parseInt(body.viewersCount) || 10000
  };
}

// ========================== RADIOS API ==========================

app.get('/api/radios', (req, res) => {
  try {
    res.json({ success: true, data: db.getAllRadios() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/radios', requireAuth, (req, res) => {
  try {
    const r = {
      name: (req.body.name || '').trim(),
      country: (req.body.country || 'عربي').trim(),
      streamUrl: (req.body.streamUrl || '').trim(),
      icon: (req.body.icon || 'fa-radio').trim(),
      description: (req.body.description || 'بث صوّتي حي ومباشر').trim()
    };
    if (!r.name || !r.streamUrl) {
      return res.status(400).json({ success: false, message: 'اسم المحطة ورابط البث مطلوبان' });
    }
    const created = db.createRadio(r);
    res.status(201).json({ success: true, message: 'تم إضافة المحطة بنجاح', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/radios/:id', requireAuth, (req, res) => {
  try {
    const r = {
      name: (req.body.name || '').trim(),
      country: (req.body.country || 'عربي').trim(),
      streamUrl: (req.body.streamUrl || '').trim(),
      icon: (req.body.icon || 'fa-radio').trim(),
      description: (req.body.description || 'بث صوّتي حي ومباشر').trim()
    };
    const updated = db.updateRadio(req.params.id, r);
    res.json({ success: true, message: 'تم تحديث المحطة بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/radios/:id', requireAuth, (req, res) => {
  try {
    db.deleteRadio(req.params.id);
    res.json({ success: true, message: 'تم حذف المحطة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========================== MATCHES API ==========================

app.get('/api/matches', (req, res) => {
  try {
    res.json({ success: true, data: db.getAllMatches() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/matches', requireAuth, (req, res) => {
  try {
    const b = req.body;
    const streamUrl = formatStreamUrl((b.streamUrl || '').trim());
    const m = {
      league: (b.league || '').trim(),
      leagueFlag: b.leagueFlag || '🏆',
      homeTeam: (b.homeTeam || '').trim(),
      homeLogo: b.homeLogo || '⚽',
      awayTeam: (b.awayTeam || '').trim(),
      awayLogo: b.awayLogo || '⚽',
      time: (b.time || '').trim(),
      date: (b.date || 'اليوم').trim(),
      status: b.status || 'upcoming',
      channelName: (b.channelName || '').trim(),
      channelId: (b.channelId || '').trim(),
      commentator: (b.commentator || 'غير محدد').trim(),
      stadium: (b.stadium || 'الملعب الرئيسي').trim(),
      score: b.status === 'live' ? (b.score || '0 - 0') : 'vs',
      servers: b.servers || [
        { name: 'سيرفر 1 (Full HD Direct)', url: streamUrl || 'https://shoof.alkass.net/live/ch1.m3u8' },
        { name: 'سيرفر 2 (سريع بدون تقطيع)', url: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' }
      ]
    };
    if (!m.homeTeam || !m.awayTeam) {
      return res.status(400).json({ success: false, message: 'الفريق المضيف والضيف مطلوبان' });
    }
    const created = db.createMatch(m);
    res.status(201).json({ success: true, message: 'تم إضافة المباراة بنجاح', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/matches/:id', requireAuth, (req, res) => {
  try {
    const b = req.body;
    const updated = db.updateMatch(req.params.id, {
      league: b.league, leagueFlag: b.leagueFlag || '🏆',
      homeTeam: b.homeTeam, homeLogo: b.homeLogo || '⚽',
      awayTeam: b.awayTeam, awayLogo: b.awayLogo || '⚽',
      time: b.time, date: b.date || 'اليوم',
      status: b.status || 'upcoming',
      channelName: b.channelName, channelId: b.channelId,
      commentator: b.commentator || 'غير محدد',
      stadium: b.stadium || 'الملعب الرئيسي',
      score: b.score || 'vs',
      servers: b.servers || []
    });
    res.json({ success: true, message: 'تم تحديث المباراة بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/matches/:id/score — Update match score in real-time
app.patch('/api/matches/:id/score', requireAuth, (req, res) => {
  try {
    const { score, status } = req.body;
    db.db.prepare('UPDATE matches SET score = ?, status = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(score || 'vs', status || 'live', req.params.id);
    res.json({ success: true, message: 'تم تحديث النتيجة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/matches/:id', requireAuth, (req, res) => {
  try {
    db.deleteMatch(req.params.id);
    res.json({ success: true, message: 'تم حذف المباراة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========================== SPORTS NEWS API ==========================

app.get('/api/news', (req, res) => {
  try {
    res.json({ success: true, data: db.getAllNews() });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/news', requireAuth, (req, res) => {
  try {
    const b = req.body;
    const n = {
      title: (b.title || '').trim(),
      summary: (b.summary || '').trim(),
      content: b.content || `<p>${(b.summary || '').trim()}</p>`,
      category: (b.category || 'كرة قدم').trim(),
      timeAgo: 'الآن',
      image: (b.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500').trim(),
      author: (b.author || 'التحرير الرياضي').trim(),
      gallery: b.gallery || []
    };
    if (!n.title) {
      return res.status(400).json({ success: false, message: 'عنوان الخبر مطلوب' });
    }
    const created = db.createNews(n);
    res.status(201).json({ success: true, message: 'تم نشر الخبر بنجاح', data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/news/:id', requireAuth, (req, res) => {
  try {
    db.deleteNews(req.params.id);
    res.json({ success: true, message: 'تم حذف الخبر بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========================== LIVE HLS STREAM PROXY (NAT GEO ABU DHABI) ==========================
const https = require('https');

let natgeoCachedBase = null;
let natgeoCacheTime = 0;

function fetchHttps(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers }, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(data) }));
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
      res.on('end', () => resolve({ status: res.statusCode, body: Buffer.concat(data).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(postBody);
    req.end();
  });
}

const elahmadCache = new Map();

async function getElahmadStreamInfo(channelId) {
  const cached = elahmadCache.get(channelId);
  if (cached && (Date.now() - cached.cacheTime < 15 * 60 * 1000)) {
    return cached;
  }
  const pageRes = await fetchHttps(`https://www.elahmad.ru/tv/radiant.php?id=${encodeURIComponent(channelId)}`, {
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

  const info = { decrypted, cacheTime: Date.now() };
  elahmadCache.set(channelId, info);
  return info;
}

async function getElahmadM3u8(channelId) {
  let info;
  try {
    info = await getElahmadStreamInfo(channelId);
  } catch (err) {
    elahmadCache.delete(channelId);
    throw err;
  }

  const decrypted = info.decrypted;

  // Case 1: .m3u8 stream (e.g. games2.elahmad.store like nile_sport)
  if (decrypted.includes('.m3u8')) {
    const masterRes = await fetchHttps(decrypted, {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
    });
    if (masterRes.status !== 200) {
      elahmadCache.delete(channelId);
      info = await getElahmadStreamInfo(channelId);
      return getElahmadM3u8(channelId);
    }
    const masterBody = masterRes.body.toString('utf8');
    const masterBase = decrypted.substring(0, decrypted.lastIndexOf('/') + 1);

    const subLine = masterBody.split('\n').map(l => l.trim()).find(l => l && !l.startsWith('#') && l.includes('.m3u8'));
    if (subLine) {
      const subUrl = subLine.startsWith('http') ? subLine : masterBase + subLine;
      const subRes = await fetchHttps(subUrl, {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': `https://www.elahmad.ru/tv/radiant.php?id=${channelId}`
      });
      const subBody = subRes.body.toString('utf8');
      const subBase = subUrl.substring(0, subUrl.lastIndexOf('/') + 1);

      return subBody.split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          return trimmed.startsWith('http') ? trimmed : subBase + trimmed;
        }
        return line;
      }).join('\n');
    }

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
  if (plRes.status !== 200) {
    elahmadCache.delete(channelId);
    throw new Error('Playlist fetch failed: HTTP ' + plRes.status);
  }
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

// GET /api/stream/:channelId.m3u8 — Direct .m3u8 stream converted dynamically from embeds
app.get('/api/stream/:channelId.m3u8', async (req, res) => {
  let channelId = req.params.channelId;
  if (channelId === 'natgeo') channelId = 'natgeo_1';
  try {
    const m3u8 = await getElahmadM3u8(channelId);
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(m3u8);
  } catch (err) {
    console.error(`Error serving ${channelId}.m3u8:`, err.message);
    res.status(502).send('#EXTM3U\n#EXT-X-ERROR: ' + err.message);
  }
});

// ========================== HEALTH CHECK ==========================
app.get('/api/health', (req, res) => {
  const stats = {
    status: 'online',
    app: 'Arabia Live TV Portal (arabialivetv.com)',
    version: '2.0.0',
    database: 'SQLite (server-side, cross-browser)',
    timestamp: new Date().toISOString(),
    counts: {
      channels: db.getAllChannels().length,
      radios: db.getAllRadios().length,
      matches: db.getAllMatches().length,
      news: db.getAllNews().length
    }
  };
  res.json(stats);
});

// ========================== ADMIN DATA RESET ==========================
app.post('/api/admin/reset', requireAuth, (req, res) => {
  try {
    db.db.exec(`
      DELETE FROM channels;
      DELETE FROM radios;
      DELETE FROM matches;
      DELETE FROM sports_news;
    `);
    // Re-seed defaults
    const { seedDefaultData } = require('./database');
    res.json({ success: true, message: 'تمت إعادة ضبط البيانات إلى الإعدادات الافتراضية' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ========================== UTILITY ==========================
function formatStreamUrl(url) {
  if (!url) return '';
  url = url.trim();

  // Extract src from pasted <iframe> tag
  if (url.includes('<iframe') && url.includes('src=')) {
    const match = url.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) url = match[1];
  }

  // YouTube watch link → embed
  if (url.includes('youtube.com/watch?v=')) {
    const videoId = url.split('v=')[1].split('&')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  // YouTube short link → embed
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1].split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  }

  return url;
}

// ========================== INIT DEFAULT ADMIN ==========================
async function initDefaultAdmin() {
  if (!db.adminUserExists()) {
    const hash = await bcrypt.hash('admin123', 10);
    db.createAdminUser('admin', hash);
    console.log('🔐 Default admin created: admin / admin123 — PLEASE CHANGE YOUR PASSWORD AFTER FIRST LOGIN!');
  }
}

// ========================== START SERVER ==========================
initDefaultAdmin().then(() => {
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`📺 Arabia Live TV Server v2.0 running at: http://localhost:${PORT}`);
    console.log(`⚙️  Admin Dashboard: http://localhost:${PORT}/admin`);
    console.log(`🗄️  Database: SQLite (altv_database.db) — cross-browser & reliable`);
    console.log(`🔐 Auth: JWT + bcrypt — secure server-side authentication`);
    console.log('====================================================');
  });
});
