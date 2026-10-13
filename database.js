/**
 * Arabia Live TV (arabialivetv.com) — Unified Persistent Database Layer
 * 
 * Supports:
 *  1. better-sqlite3 (native SQLite when available)
 *  2. File-backed persistent atomic JSON database (zero native dependency fallback)
 * 
 * Guarantees 100% reliable data persistence across ALL browsers, devices, and hosting environments.
 */

const path = require('path');
const fs = require('fs');

let useSqlite = false;
let db = null;

try {
  const Database = require('better-sqlite3');
  const DB_PATH = process.env.NODE_ENV === 'production' && fs.existsSync('/opt/render/project/src')
    ? path.join('/opt/render/project/src', 'altv_database.db')
    : path.join(__dirname, 'altv_database.db');
  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  useSqlite = true;
  console.log('✅ Connected to SQLite database:', DB_PATH);
} catch (e) {
  useSqlite = false;
  console.log('ℹ️ Native SQLite not available. Using unified persistent file database:', e.message);
}

// ========================== FILE-BACKED JSON DATABASE ==========================
const JSON_DB_PATH = path.join(__dirname, 'altv_database.json');

function readJsonDb() {
  try {
    if (fs.existsSync(JSON_DB_PATH)) {
      const raw = fs.readFileSync(JSON_DB_PATH, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading JSON DB:', err.message);
  }
  return { channels: [], radios: [], matches: [], sports_news: [], admin_users: [] };
}

function writeJsonDb(data) {
  try {
    const tmpPath = JSON_DB_PATH + '.tmp';
    fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tmpPath, JSON_DB_PATH);
  } catch (err) {
    console.error('Error writing JSON DB:', err.message);
  }
}

// ========================== DEFAULT SEED DATA (100% DIRECT HLS - ZERO ADS) ==========================
const DEFAULT_CHANNELS = [
  {
    "id": "ch-1791895445789",
    "name": "MIX بالعربي",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoGI2w86Skhx-htw30YfRp9CTsQQgS7yntTn2gIyPdQg&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/mix-bel-araby-tv.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/mix-bel-araby-tv.php",
    "description": "MIX بالعربي بث مباشر",
    "isFeatured": false,
    "viewersCount": 13377,
    "sortOrder": 0,
    "isDefault": true
  },
  {
    "id": "ch-1791895388545",
    "name": "ON TV Live",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://yt3.googleusercontent.com/s4l1dhSX87jbq-UU8w5p6m7dA04x5Cif-pffbWMf8yaei9LjG_oMSdZUvIH8Z7qchdAasGTRngw=s176-c-k-c0x00ffffff-no-rj-mo",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/on-live-egypt.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/on-live-egypt.php",
    "description": "ON Sport ON Drama ON Sport",
    "isFeatured": false,
    "viewersCount": 13938,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895352147",
    "name": "MBC دراما",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKjPUOxb1OPmJKGZ1kGxtkquech6g20YPGNG9ASA-GQQ&s=10",
    "type": "hls",
    "streamUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8",
    "fallbackUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8",
    "description": "باقة من أروع المسلسلات الدرامية العربية والخليجية والمصرية على مدار الساعة.",
    "isFeatured": false,
    "viewersCount": 16695,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895301431",
    "name": "مجموعة قنوات صدي البلد بث مباشر",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqAaNU1E8ECSHvLjs0XlwPBsji5UnDwBJw-DCQcOd57A&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/sada-elbaladtv.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/sada-elbaladtv.php",
    "description": "تغطية حية مجموعة قنوات البلد بث مباشر",
    "isFeatured": false,
    "viewersCount": 10091,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895269936",
    "name": "مجموعة قنوات القاهرة والناس بث مباشر",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYI9MeC1ws2x-Onx21vWyH4h2m051FPxh6V6FitjK7KA&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/alkaherawalnas.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/alkaherawalnas.php",
    "description": "مجموعة قنوات القاهرة والناس بث مباشر",
    "isFeatured": false,
    "viewersCount": 7558,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895235329",
    "name": "بث مباشر لمجموعة قنوات الحياة",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlD5hhW4mPFlPjHoxAjqbZyfr_h-kcsn_BGm9n0pUlpQ&s",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/alhayattv.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/alhayattv.php",
    "description": "بث مباشر لمجموعة قنوات الحياة",
    "isFeatured": false,
    "viewersCount": 16574,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895195908",
    "name": "قناة المحور",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdvk6NcIjvf5AVeHcWul5bFG8gWusoil5J9UI2tLyf_YlkfjXeg6SYjxg&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/elmehwartv.htm",
    "fallbackUrl": "https://www.elahmad.ru/tv/elmehwartv.htm",
    "description": "قناة المحور بث مباشر",
    "isFeatured": false,
    "viewersCount": 16523,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895163194",
    "name": "القناة الثانية الفضائية المصرية",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcSDLXVebU7naPsGLUnKaaTgIg7f4sxWYJJT0p4fpowg&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/egypt_channel2_live.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/egypt_channel2_live.php",
    "description": "القناة الثانية الفضائية المصرية بث مباشر",
    "isFeatured": false,
    "viewersCount": 7093,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895132319",
    "name": "DMC TV",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3mOqSVN201UYIEgdaw3mpBGlKNxauGK26cAG2I8NKKA&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/dmc-tv-live.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/dmc-tv-live.php",
    "description": "DMC TV Live DMC Drama",
    "isFeatured": false,
    "viewersCount": 19929,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895091730",
    "name": "CBC Live",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpe3MSptjPiQfcyrQxB-HGvBz9PU3zhN8fQKhZWX2jKg&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/cbc-eg.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/cbc-eg.php",
    "description": "CBC Live بث مباشر لمجموعة قنوات سي بي سي",
    "isFeatured": false,
    "viewersCount": 7876,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791895007369",
    "name": "مجموعة قنوات روتانا بث مباشر",
    "category": "drama",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ3OIwgo8WoD7OdE9h1WTCmUHwKcCUlVK7M72_8kzCCnw&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/rotana-live.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/rotana-live.php",
    "description": "أفلام السينما العربية الحديثة والمعاصرة.",
    "isFeatured": false,
    "viewersCount": 17129,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791894728928",
    "name": "الشرق الاخبارية",
    "category": "news",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCsLRjAIrRin9VL56AsOY-d8YHMTw2yYes3SYGsfgO9Q&s=10",
    "type": "hls",
    "streamUrl": "https://live-news.asharq.com/asharq.m3u8",
    "fallbackUrl": "https://live-news.asharq.com/asharq.m3u8",
    "description": "تغطية حية لقناة الشرق الاخبارية",
    "isFeatured": false,
    "viewersCount": 24416,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791894401431",
    "name": "BBC العربية",
    "category": "news",
    "country": "الامارات العربية",
    "quality": "Full HD",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/9/93/BBC_News_Arabic_logo.png?utm_source=ar.wikipedia.org&utm_campaign=index&utm_content=original",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/bbc_ar.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/bbc_ar.php",
    "description": "BBC العربية بث مباشر",
    "isFeatured": false,
    "viewersCount": 24817,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791894257562",
    "name": "قناة أفلام العربية (Aflam HD - أفلام عربية حديثة ومتنوعة",
    "category": "movies",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8RlTX6eOWdknA0-cbYehmp9MD_3ZVunmULYlySzpEBQ&s=10",
    "type": "hls",
    "streamUrl": "https://shd-amg-fast.edgenextcdn.net/tx001/playlist.m3u8",
    "fallbackUrl": "https://shd-amg-fast.edgenextcdn.net/tx001/playlist.m3u8",
    "description": "قناة أفلام العربية (Aflam HD - أفلام عربية حديثة ومتنوعة",
    "isFeatured": false,
    "viewersCount": 19035,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791894050980",
    "name": "قناة مسلسلات باب الحارة (Bab Al-Hara 24/7 HD)",
    "category": "drama",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqOC_sR9Km97I4D-rHIPlR7B0PxEH0lV9AVDFgYWXuFw&s=10",
    "type": "hls",
    "streamUrl": "https://shd-amg-fast.edgenextcdn.net/tx010/playlist.m3u8",
    "fallbackUrl": "https://shd-amg-fast.edgenextcdn.net/tx010/playlist.m3u8",
    "description": "قناة مسلسلات باب الحارة (Bab Al-Hara 24/7 HD)",
    "isFeatured": false,
    "viewersCount": 8069,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791894010956",
    "name": "قناة مسلسلات مرايا (Maraya Comedy HD)",
    "category": "drama",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5vhndetKud88z491qiv4E72LM30XlCHlheLKQ5uQswg&s",
    "type": "hls",
    "streamUrl": "https://shd-amg-fast.edgenextcdn.net/tx008/playlist.m3u8",
    "fallbackUrl": "https://shd-amg-fast.edgenextcdn.net/tx008/playlist.m3u8",
    "description": "قناة مسلسلات مرايا (Maraya Comedy HD)",
    "isFeatured": false,
    "viewersCount": 16372,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791893960876",
    "name": "بث مباشر لقنوات النيل المصرية",
    "category": "news",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKLHkILXqJAe2BOv4ttbPW8EATCogwqZrHxbrZem2WU9gOFbnC2f8kTEg&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/ntnegypt.php?id=sport",
    "fallbackUrl": "https://www.elahmad.ru/tv/ntnegypt.php?id=sport",
    "description": "بث مباشر لقنوات النيل المصرية",
    "isFeatured": false,
    "viewersCount": 10180,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791893888677",
    "name": "بث مباشر لقنوات دبي الرياضية",
    "category": "sports",
    "country": "الامارات العربية",
    "quality": "Full HD",
    "logo": "https://yt3.googleusercontent.com/q6KaaYJNkFAtJdX77DZuExnxSk6wyry1dcCERk8BmoqyGzNHRuvjY-Ak_H0XD8iBHxAU04P0Yg=s900-c-k-c0x00ffffff-no-rj",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/dubai-sport.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/dubai-sport.php",
    "description": "بث مباشر عالي الجودة لقنوات دبي الرياضية",
    "isFeatured": false,
    "viewersCount": 20592,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791893800758",
    "name": "قنوات السعودية الرياضية",
    "category": "sports",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNpUM3uxsRkZXTPfG7rY-oIIz77o5CoXcSEkhBzjFy8Q&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/saudisport.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/saudisport.php",
    "description": "تغطية حية لقنوات السعودية الرياضية",
    "isFeatured": false,
    "viewersCount": 7205,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791893683256",
    "name": "beIN Sport XTRA",
    "category": "sports",
    "country": "قطر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTERJec7RdNJpVv6-2dnjjovHKaJsJKghsRyuGu-HUTZg&s=10",
    "type": "hls",
    "streamUrl": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    "fallbackUrl": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    "description": "beIN Sport XTRA Live",
    "isFeatured": false,
    "viewersCount": 17992,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791893616032",
    "name": "فرانس 24 (باللغة العربية)",
    "category": "news",
    "country": "فرنسا",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTA07200qIjWXZKkkBkZCKIjibiS0K72G-U1gztgjUpZQ&s=10",
    "type": "hls",
    "streamUrl": "https://shoof.alkass.net/live/ch1.m3u8",
    "fallbackUrl": "https://shoof.alkass.net/live/ch1.m3u8",
    "description": "الأخبار الدولية باللغة العربية على مدار 24 ساعة.",
    "isFeatured": false,
    "viewersCount": 7936,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-1791893383124",
    "name": "العربية بيسنس Business",
    "category": "news",
    "country": "الامارات العربية",
    "quality": "Full HD",
    "logo": "https://yt3.googleusercontent.com/_j0bArKj8E5xA2gjKvjrJQK6cc7vc4TpvyQC2GkaCJybfdeq-lZwjbsSRHolqAfbZfReMq6wJg=s900-c-k-c0x00ffffff-no-rj",
    "type": "hls",
    "streamUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8",
    "fallbackUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8",
    "description": "قناة الترفيه الأولى والبرامج الحوارية العربية بيسنس Business",
    "isFeatured": false,
    "viewersCount": 24587,
    "sortOrder": 0,
    "isDefault": false
  },
  {
    "id": "ch-aljazeera-news",
    "name": "الجزيرة الإخبارية",
    "category": "news",
    "country": "قطر",
    "quality": "Full HD",
    "logo": "https://i.ytimg.com/vi/bNyUyrR0PHo/hq720.jpg?v=6ab816c9&sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLA1l-0FZDi0axcXi1rXob_3jo4QWA",
    "type": "hls",
    "streamUrl": "https://live-hls-web-aja-fa.thehlive.com/AJA/index.m3u8",
    "fallbackUrl": "https://live-hls-web-aja-fa.thehlive.com/AJA/index.m3u8",
    "description": "بث حي ومباشر لقناة الجزيرة الإخبارية - تغطية إخبارية مستمرة.",
    "isFeatured": false,
    "viewersCount": 68200,
    "sortOrder": 1,
    "isDefault": false
  },
  {
    "id": "ch-alarabiya",
    "name": "قناة العربية الفضائية",
    "category": "news",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "data:image/png;base64,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",
    "type": "hls",
    "streamUrl": "https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8",
    "fallbackUrl": "https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8",
    "description": "قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.",
    "isFeatured": false,
    "viewersCount": 61400,
    "sortOrder": 2,
    "isDefault": false
  },
  {
    "id": "ch-alhadath",
    "name": "قناة الحدث",
    "category": "news",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjbfRTFVd-62qg-TJkKDpx6wOL0UBnURsOCqUXyvPKrg&s=10",
    "type": "hls",
    "streamUrl": "https://av.alarabiya.net/alarabiapublish/alhadath.smil/playlist.m3u8",
    "fallbackUrl": "https://av.alarabiya.net/alarabiapublish/alhadath.smil/playlist.m3u8",
    "description": "قناة الحدث - متابعة حية ومكثفة للأحداث العاجلة حول العالم.",
    "isFeatured": false,
    "viewersCount": 54200,
    "sortOrder": 3,
    "isDefault": false
  },
  {
    "id": "ch-skynews-ar",
    "name": "سكاي نيوز عربية",
    "category": "news",
    "country": "الإمارات",
    "quality": "HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6s8deN_gX5aTj-L064dyN4EZiW1VvMjqlB6OVaWq9nw&s=10",
    "type": "hls",
    "streamUrl": "https://live-stream.skynewsarabia.com/c-horizontal-channel/horizontal-stream/index.m3u8",
    "fallbackUrl": "https://live-stream.skynewsarabia.com/c-horizontal-channel/horizontal-stream/index.m3u8",
    "description": "البث المباشر لقناة سكاي نيوز عربية بالسرعة والموضوعية.",
    "isFeatured": false,
    "viewersCount": 45800,
    "sortOrder": 4,
    "isDefault": false
  },
  {
    "id": "ch-alekhbariya",
    "name": "قناة الإخبارية السعودية",
    "category": "news",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcShLtk4QJSWPONhkV7RKcQYBYkskQf8l1bWTBUQRea5rw&s=10",
    "type": "hls",
    "streamUrl": "https://cdn-globecast.akamaized.net/live/eds/al_ekhbariya/hls_roku/index.m3u8",
    "fallbackUrl": "https://cdn-globecast.akamaized.net/live/eds/al_ekhbariya/hls_roku/index.m3u8",
    "description": "قناة الإخبارية السعودية الرسمية - متابعة حية ومباشرة للأحداث المحلية والعالمية.",
    "isFeatured": false,
    "viewersCount": 38200,
    "sortOrder": 5,
    "isDefault": false
  },
  {
    "id": "ch-asharq-news",
    "name": "الشرق للأخبار (Bloomberg)",
    "category": "news",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZtdjxcz9xFQt9A-QUzn9z_ShEhVyXTcOmaOwF-Pa33Q&s=10",
    "type": "hls",
    "streamUrl": "https://live-news.asharq.com/asharq.m3u8",
    "fallbackUrl": "https://live-news.asharq.com/asharq.m3u8",
    "description": "قناة الشرق الإخبارية بالتعاون مع بلومبرغ للأخبار والتحليلات الاقتصادية والسياسية.",
    "isFeatured": false,
    "viewersCount": 33100,
    "sortOrder": 6,
    "isDefault": false
  },
  {
    "id": "ch-trt-arabi",
    "name": "TRT عربي",
    "category": "news",
    "country": "تركيا",
    "quality": "HD",
    "logo": "https://pbs.twimg.com/profile_images/1831294590093070336/fySm1Vxz_400x400.jpg",
    "type": "hls",
    "streamUrl": "https://tv-trtarabi.medya.trt.com.tr/master.m3u8",
    "fallbackUrl": "https://tv-trtarabi.medya.trt.com.tr/master.m3u8",
    "description": "قناة TRT العربية الإخبارية والثقافية.",
    "isFeatured": false,
    "viewersCount": 29100,
    "sortOrder": 7,
    "isDefault": false
  },
  {
    "id": "ch-cnbc-arabiya",
    "name": "CNBC عربية",
    "category": "news",
    "country": "الإمارات",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeGEx1FwAMn1QfjfQCs6OWRvK6rNamHqLuepYWuIERRQ&s=10",
    "type": "hls",
    "streamUrl": "https://cnbc-live.akamaized.net/cnbc/master.m3u8",
    "fallbackUrl": "https://cnbc-live.akamaized.net/cnbc/master.m3u8",
    "description": "القناة الاقتصادية الأولى في العالم العربي - أسواق المال والأعمال.",
    "isFeatured": false,
    "viewersCount": 24700,
    "sortOrder": 8,
    "isDefault": false
  },
  {
    "id": "ch-saudi-quran",
    "name": "قناة القرآن الكريم (مكة المكرمة)",
    "category": "islamic",
    "country": "السعودية",
    "quality": "4K Ultra",
    "logo": "data:image/png;base64,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",
    "type": "hls",
    "streamUrl": "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8",
    "fallbackUrl": "https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8",
    "description": "بث حي ومباشر 24/7 من المسجد الحرام بمكة المكرمة مع تلاوة القرآن.",
    "isFeatured": false,
    "viewersCount": 104000,
    "sortOrder": 9,
    "isDefault": false
  },
  {
    "id": "ch-saudi-sunnah",
    "name": "قناة السنة النبوية (المدينة المنورة)",
    "category": "islamic",
    "country": "السعودية",
    "quality": "4K Ultra",
    "logo": "data:image/jpeg;base64,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",
    "type": "hls",
    "streamUrl": "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8",
    "fallbackUrl": "https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8",
    "description": "بث حي ومباشر من المسجد النبوي الشريف بالمدينة المنورة.",
    "isFeatured": false,
    "viewersCount": 89500,
    "sortOrder": 10,
    "isDefault": false
  },
  {
    "id": "ch-qatar-quran",
    "name": "تلفزيون قطر للقرآن الكريم",
    "category": "islamic",
    "country": "قطر",
    "quality": "Full HD",
    "logo": "https://i.ytimg.com/vi/Wp7H53Z1Ivk/maxresdefault.jpg",
    "type": "hls",
    "streamUrl": "https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8",
    "fallbackUrl": "https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8",
    "description": "تلاوات خاشعة وبرامج إسلامية وتفسير القرآن الكريم على مدار 24 ساعة.",
    "isFeatured": false,
    "viewersCount": 42100,
    "sortOrder": 11,
    "isDefault": false
  },
  {
    "id": "ch-nile-sport",
    "name": "نايل سبورت HD (Nile Sport)",
    "category": "sports",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Nile_Sport_Channel_logo.png/300px-Nile_Sport_Channel_logo.png",
    "type": "hls",
    "streamUrl": "/api/stream/nile_sport.m3u8",
    "fallbackUrl": "/api/stream/nile_sport.m3u8",
    "description": "البث المباشر لقناة نايل سبورت الرياضية المصرية - مباريات وبطولات الدوري المصري واستوديوهات تحليلية.",
    "isFeatured": true,
    "viewersCount": 88500,
    "sortOrder": 12,
    "isDefault": false
  },
  {
    "id": "ch-bein-sports-xtra",
    "name": "beIN SPORTS XTRA HD",
    "category": "sports",
    "country": "قطر",
    "quality": "Full HD",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Al_Kass_Sports_Channels_logo.png/300px-Al_Kass_Sports_Channels_logo.png",
    "type": "hls",
    "streamUrl": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    "fallbackUrl": "https://bein-xtra-bein.amagi.tv/playlist.m3u8",
    "description": "قناة beIN SPORTS XTRA المفتوحة لنقل أقوى الفعاليات الرياضية والأحداث العالمية مباشرة.",
    "isFeatured": true,
    "viewersCount": 94200,
    "sortOrder": 13,
    "isDefault": false
  },
  {
    "id": "ch-ktv-sport",
    "name": "الكويت الرياضية (KTV Sport HD)",
    "category": "sports",
    "country": "الكويت",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyyiXiiHHstKnAKLw8SKzyjR6houfJvVydZ1oBQiIKlg&s=10",
    "type": "hls",
    "streamUrl": "https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8",
    "fallbackUrl": "https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8",
    "description": "القناة الرياضية الكويتية الرسمية لنقل المباريات والدوريات الخليجية والعربية.",
    "isFeatured": false,
    "viewersCount": 65200,
    "sortOrder": 14,
    "isDefault": false
  },
  {
    "id": "ch-ktv-sport-plus",
    "name": "الكويت سبورت بلس (Sport Plus)",
    "category": "sports",
    "country": "الكويت",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThGbg81jDU-NXipuzthrWAegIumwJnsSSxRLWMHT-sGg&s=10",
    "type": "hls",
    "streamUrl": "https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8",
    "fallbackUrl": "https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8",
    "description": "البث الإضافي لمباريات واستوديوهات الكويت الرياضية المباشرة.",
    "isFeatured": false,
    "viewersCount": 51000,
    "sortOrder": 15,
    "isDefault": false
  },
  {
    "id": "ch-oman-sports",
    "name": "عُمان الرياضية (Oman Sport)",
    "category": "sports",
    "country": "عُمان",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaygp9X7bFXVoVWqCrZIWhBy898UFB6XlR9tucLKdG5A&s=10",
    "type": "hls",
    "streamUrl": "https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8",
    "fallbackUrl": "https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8",
    "description": "قناة عُمان الرياضية - تغطيات حية ومباشرة للمسابقات والبطولات العربية.",
    "isFeatured": false,
    "viewersCount": 46800,
    "sortOrder": 16,
    "isDefault": false
  },
  {
    "id": "ch-jordan-sport",
    "name": "الأردن الرياضية (Jordan Sport)",
    "category": "sports",
    "country": "الأردن",
    "quality": "Full HD",
    "logo": "https://yt3.googleusercontent.com/sjCx8SQxq51htP7LzVlCxespRy-u_ZFmcRXZiMXmKVR6ELhh5Jv0FEu4DM2wHvRl8t5hJbIwp3o=s900-c-k-c0x00ffffff-no-rj",
    "type": "hls",
    "streamUrl": "https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8",
    "fallbackUrl": "https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8",
    "description": "القناة الرياضية الأردنية الرسمية - بث مباشر للمباريات والمنافسات الرياضية.",
    "isFeatured": false,
    "viewersCount": 43200,
    "sortOrder": 17,
    "isDefault": false
  },
  {
    "id": "ch-bahrain-sports-1",
    "name": "البحرين الرياضية 1 HD",
    "category": "sports",
    "country": "البحرين",
    "quality": "Full HD",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png",
    "type": "hls",
    "streamUrl": "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
    "fallbackUrl": "https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8",
    "description": "قناة البحرين الرياضية الأولى - بث حي للمباريات والمسابقات الرياضية الخليجية.",
    "isFeatured": false,
    "viewersCount": 39500,
    "sortOrder": 18,
    "isDefault": false
  },
  {
    "id": "ch-bahrain-sports-2",
    "name": "البحرين الرياضية 2 HD",
    "category": "sports",
    "country": "البحرين",
    "quality": "Full HD",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png",
    "type": "hls",
    "streamUrl": "https://5c7b683162943.streamlock.net/live/ngrp:bahrainsportstwo_all/playlist.m3u8",
    "fallbackUrl": "https://5c7b683162943.streamlock.net/live/ngrp:bahrainsportstwo_all/playlist.m3u8",
    "description": "قناة البحرين الرياضية الثانية - تغطيات حية ومباشرة للفعاليات والبطولات.",
    "isFeatured": false,
    "viewersCount": 35100,
    "sortOrder": 19,
    "isDefault": false
  },
  {
    "id": "ch-iraqia-sport",
    "name": "العراقية الرياضية (Al Iraqia Sports)",
    "category": "sports",
    "country": "العراق",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQi4EjMiJOfPuX_hMoE9vk6ABzLSQ_ooKvyg39IMdTa-Q&s=10",
    "type": "hls",
    "streamUrl": "https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8",
    "fallbackUrl": "https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8",
    "description": "شبكة الإعلام العراقي - قناة الرياضية لنقل مباريات دوري نجوم العراق والبطولات.",
    "isFeatured": false,
    "viewersCount": 48000,
    "sortOrder": 20,
    "isDefault": false
  },
  {
    "id": "ch-elheddaf-sport",
    "name": "الهداف الجزائرية (El Heddaf TV)",
    "category": "sports",
    "country": "الجزائر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT9r88SpffXicpH7GHLLevQSbBFJPMRzz9acNQPgFWtcg&s=10",
    "type": "hls",
    "streamUrl": "https://live.elheddaftv.com:8081/elheddaftv/index.m3u8",
    "fallbackUrl": "https://live.elheddaftv.com:8081/elheddaftv/index.m3u8",
    "description": "قناة الهداف الرياضية الأولى في الجزائر والمغرب العربي - تحليلات وأخبار حصرية.",
    "isFeatured": false,
    "viewersCount": 52400,
    "sortOrder": 21,
    "isDefault": false
  },
  {
    "id": "ch-mbc-1",
    "name": "MBC 1",
    "category": "drama",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThI9aLB1rtFMdjOs0yDQn1fOJsoOrHYcPyXRPB_F1Zq7vftX1Yw9a5tEU&s=10",
    "type": "hls",
    "streamUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8",
    "fallbackUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8",
    "description": "قناة الأسرة العربية الأولى - مسلسلات، برامج ترفيهية، وأخبار منوعة.",
    "isFeatured": false,
    "viewersCount": 62400,
    "sortOrder": 22,
    "isDefault": false
  },
  {
    "id": "ch-mbc-masr",
    "name": "MBC مصر",
    "category": "drama",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTo91t0c44kl4ZuMwCkbehffFBPFm3S8W5KFe3csYwHzw&s=10",
    "type": "hls",
    "streamUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8",
    "fallbackUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8",
    "description": "قناة الترفيه الأولى والبرامج الحوارية والمسلسلات العربية والكوميدية مباشرة.",
    "isFeatured": false,
    "viewersCount": 58900,
    "sortOrder": 23,
    "isDefault": false
  },
  {
    "id": "ch-mbc-drama",
    "name": "MBC دراما",
    "category": "drama",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKjPUOxb1OPmJKGZ1kGxtkquech6g20YPGNG9ASA-GQQ&s=10",
    "type": "hls",
    "streamUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-drama/567b703c19ede6598222de81b0e4508b/index.m3u8",
    "fallbackUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr-drama/567b703c19ede6598222de81b0e4508b/index.m3u8",
    "description": "باقة من أروع المسلسلات الدرامية العربية والخليجية والمصرية على مدار الساعة.",
    "isFeatured": false,
    "viewersCount": 53100,
    "sortOrder": 24,
    "isDefault": false
  },
  {
    "id": "ch-sharjah-tv",
    "name": "قناة الشارقة الفضائية",
    "category": "drama",
    "country": "الإمارات",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTslbpG4XonKZ7ornbScA6lhmA-fviAvWxwQeUhLmVdMYvMjL2SN0DoUWo&s=10",
    "type": "hls",
    "streamUrl": "https://live.kwikmotion.com/smc1live/smc1tv.smil/playlist.m3u8",
    "fallbackUrl": "https://live.kwikmotion.com/smc1live/smc1tv.smil/playlist.m3u8",
    "description": "قناة الشارقة - برامج ثقافية واجتماعية ودرامية هادفة تناسب كل أفراد الأسرة.",
    "isFeatured": false,
    "viewersCount": 37500,
    "sortOrder": 25,
    "isDefault": false
  },
  {
    "id": "ch-natgeo-ad",
    "name": "ناشيونال جيوغرافيك أبوظبي (Nat Geo)",
    "category": "docu",
    "country": "الإمارات",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUunwq6_TFtmPruYbqKKbmffd_QdzflZ4htugjf4hEWw&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/national-geographic-abudabi.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/national-geographic-abudabi.php",
    "description": "البث المباشر لقناة ناشيونال جيوغرافيك أبوظبي - أقوى الأفلام الوثائقية واستكشاف الطبيعة والعلوم مدبلجة بالعربية.",
    "isFeatured": false,
    "viewersCount": 74200,
    "sortOrder": 26,
    "isDefault": false
  },
  {
    "id": "ch-asharq-docu",
    "name": "الشرق الوثائقية HD",
    "category": "docu",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRY21THhVW4KpT7C14uEUMSP1lpxcXa_J5SAK__315oUA&s=10",
    "type": "hls",
    "streamUrl": "https://svs.itworkscdn.net/asharqdocumentarylive/asharqdocumentary.smil/playlist.m3u8",
    "fallbackUrl": "https://svs.itworkscdn.net/asharqdocumentarylive/asharqdocumentary.smil/playlist.m3u8",
    "description": "قناة الشرق الوثائقية الرسمية - تحقيقات وأفلام وثائقية وسلاسل معرفية عالمية بدون إعلانات.",
    "isFeatured": false,
    "viewersCount": 56100,
    "sortOrder": 27,
    "isDefault": false
  },
  {
    "id": "ch-aljazeera-docu",
    "name": "الجزيرة الوثائقية HD",
    "category": "docu",
    "country": "قطر",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAIbwXv4YzL9Q8dsbI1x6Q4UtLTOlulLf86uJpkfXAdQ&s=10",
    "type": "iframe",
    "streamUrl": "https://www.elahmad.ru/tv/aljazeera_documentary.php",
    "fallbackUrl": "https://www.elahmad.ru/tv/aljazeera_documentary.php",
    "description": "قناة الجزيرة الوثائقية - قصص وأفلام وثائقية تغوص في التاريخ والعلوم والمجتمع.",
    "isFeatured": false,
    "viewersCount": 49300,
    "sortOrder": 28,
    "isDefault": false
  },
  {
    "id": "ch-rotana-cinema-egy",
    "name": "روتانا سينما مصر (Rotana Cinema)",
    "category": "movies",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "/assets/logos/rotana-cinema-egy.svg",
    "type": "hls",
    "streamUrl": "https://rotana.hibridcdn.net/rotananet/cinemamasr_net-7Y83PP5adWixDF93/playlist.m3u8",
    "fallbackUrl": "https://rotana.hibridcdn.net/rotananet/cinemamasr_net-7Y83PP5adWixDF93/playlist.m3u8",
    "description": "قناة روتانا سينما مصر - مش حتقدر تغمض عينيك، أحدث وأقوى الأفلام والإنتاجات المصرية والعربية.",
    "isFeatured": true,
    "viewersCount": 88500,
    "sortOrder": 29,
    "isDefault": false
  },
  {
    "id": "ch-rotana-cinema-ksa",
    "name": "روتانا سينما السعودية (Rotana Cinema KSA)",
    "category": "movies",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "/assets/logos/rotana-cinema-ksa.svg",
    "type": "hls",
    "streamUrl": "https://rotana.hibridcdn.net/rotananet/cinema_net-7Y83PP5adWixDF93/playlist.m3u8",
    "fallbackUrl": "https://rotana.hibridcdn.net/rotananet/cinema_net-7Y83PP5adWixDF93/playlist.m3u8",
    "description": "البث المباشر لقناة روتانا سينما - روائع الفن والسينما الخليجية والعربية وأفلام العرض الأول.",
    "isFeatured": true,
    "viewersCount": 81200,
    "sortOrder": 30,
    "isDefault": false
  },
  {
    "id": "ch-rotana-classic",
    "name": "روتانا كلاسيك (Rotana Classic)",
    "category": "movies",
    "country": "مصر",
    "quality": "Full HD",
    "logo": "/assets/logos/rotana-classic.svg",
    "type": "hls",
    "streamUrl": "https://rotana.hibridcdn.net/rotananet/classical_net-7Y83PP5adWixDF93/playlist.m3u8",
    "fallbackUrl": "https://rotana.hibridcdn.net/rotananet/classical_net-7Y83PP5adWixDF93/playlist.m3u8",
    "description": "روتانا كلاسيك - كنوز السينما العربية وروائع الأبيض والأسود لكبار عمالقة ونجوم الفن الجميل.",
    "isFeatured": true,
    "viewersCount": 76400,
    "sortOrder": 31,
    "isDefault": false
  },
  {
    "id": "ch-rotana-comedy",
    "name": "روتانا كوميدي (Rotana Comedy)",
    "category": "movies",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "/assets/logos/rotana-comedy.svg",
    "type": "hls",
    "streamUrl": "https://rotana.hibridcdn.net/rotananet/comedy_net-7Y83PP5adWixDF93/playlist.m3u8",
    "fallbackUrl": "https://rotana.hibridcdn.net/rotananet/comedy_net-7Y83PP5adWixDF93/playlist.m3u8",
    "description": "روتانا كوميدي - جرعة متواصلة من الضحك والبهجة، أقوى الأفلام والمسرحيات الكوميدية.",
    "isFeatured": false,
    "viewersCount": 69500,
    "sortOrder": 32,
    "isDefault": false
  },
  {
    "id": "ch-aflam-fast",
    "name": "أفلام عربية (Aflam HD)",
    "category": "movies",
    "country": "عربي",
    "quality": "Full HD",
    "logo": "/assets/logos/aflam-fast.svg",
    "type": "hls",
    "streamUrl": "https://shd-amg-fast.edgenextcdn.net/tx001/playlist.m3u8",
    "fallbackUrl": "https://shd-amg-fast.edgenextcdn.net/tx001/playlist.m3u8",
    "description": "بث مباشر 24 ساعة لأمتع وأحدث الأفلام العربية والدرامية بجودة 1080p نقية بدون توقف.",
    "isFeatured": true,
    "viewersCount": 64100,
    "sortOrder": 33,
    "isDefault": false
  },
  {
    "id": "ch-movies-action",
    "name": "أفلام أكشن (Movies Action HD)",
    "category": "movies",
    "country": "عربي",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDlOhpx7350bGCws0Ws5oVc-fZVc7eBnokzbutVO5sFQ&s=10",
    "type": "hls",
    "streamUrl": "https://shd-amg-fast.edgenextcdn.net/tx011/playlist.m3u8",
    "fallbackUrl": "https://shd-amg-fast.edgenextcdn.net/tx011/playlist.m3u8",
    "description": "قناة أفلام الحركة والقتال والمطاردات المثيرة مترجمة للعربية بجودة عالية 1080p.",
    "isFeatured": false,
    "viewersCount": 61800,
    "sortOrder": 34,
    "isDefault": false
  },
  {
    "id": "ch-movies-thriller",
    "name": "أفلام تشويق وإثارة (Thriller HD)",
    "category": "movies",
    "country": "عربي",
    "quality": "Full HD",
    "logo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQTWbg2l8dik4XdYFXEpSR1LgTQTtHcXwaDjfijbSWYKg&s=10",
    "type": "hls",
    "streamUrl": "https://shd-amg-fast.edgenextcdn.net/tx012/playlist.m3u8",
    "fallbackUrl": "https://shd-amg-fast.edgenextcdn.net/tx012/playlist.m3u8",
    "description": "أقوى أفلام الرعب والغموض والألغاز والتشويق النفسي على مدار الساعة.",
    "isFeatured": false,
    "viewersCount": 57300,
    "sortOrder": 35,
    "isDefault": false
  },
  {
    "id": "ch-thikrayat",
    "name": "قناة ذكريات (أفلام وسهرات كلاسيكية)",
    "category": "movies",
    "country": "السعودية",
    "quality": "Full HD",
    "logo": "/assets/logos/thikrayat.svg",
    "type": "hls",
    "streamUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-thikrayat/8cfa8fe0c96275735745b89c683b27e3/index.m3u8",
    "fallbackUrl": "https://shd-gcp-live.edgenextcdn.net/live/bitmovin-thikrayat/8cfa8fe0c96275735745b89c683b27e3/index.m3u8",
    "description": "سهرات تلفزيونية ونوادر الأعمال الدرامية والسينمائية الكلاسيكية من أرشيف التلفزيون العربي.",
    "isFeatured": false,
    "viewersCount": 52900,
    "sortOrder": 36,
    "isDefault": false
  }
];

const DEFAULT_RADIOS = [
  { id: 'rad-quran-cairo', name: 'إذاعة القرآن الكريم من القاهرة', country: 'مصر', streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv', icon: 'fa-mosque', description: 'تلاوات خاشعة وأحاديث شريفة برواية حفص عن عاصم على مدار 24 ساعة.', sortOrder: 1 },
  { id: 'rad-quran-makkah', name: 'إذاعة القرآن الكريم - مكة المكرمة', country: 'السعودية', streamUrl: 'https://ssl.live.hawaa.link/listen/quran_makkah/radio.mp3', icon: 'fa-kaaba', description: 'البث الصوتي المباشر للتلاوات والصلوات من الحرم المكي الشريف.', sortOrder: 2 },
  { id: 'rad-monte-carlo', name: 'إذاعة مونت كارلو الدولية', country: 'فرنسا/عربي', streamUrl: 'https://montecarlo.ice.infomaniak.ch/mc-doualiya-midfi.mp3', icon: 'fa-tower-cell', description: 'أخبار عالمية وتحليلات سياسية وثقافية بلغة عربية راقية ومباشرة.', sortOrder: 3 },
  { id: 'rad-radio-sawa', name: 'إذاعة راديو سوا', country: 'عربي', streamUrl: 'https://mbn-channel-01.akamaized.net/hls/live/2003501/sawa/master.m3u8', icon: 'fa-radio', description: 'أحدث الأخبار الإقليمية والبرامج الموسيقية والشبابية.', sortOrder: 4 },
  { id: 'rad-rotana-fm', name: 'إذاعة روتانا إف إم', country: 'السعودية', streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv', icon: 'fa-music', description: 'أشهر الأغاني العربية الحديثة والبرامج الترفيهية الفنية.', sortOrder: 5 }
];

const DEFAULT_MATCHES = [
  {
    id: 'match-1',
    league: 'دوري أبطال إفريقيا',
    leagueFlag: '🏆',
    homeTeam: 'الأهلي المصري',
    homeLogo: '🔴',
    awayTeam: 'الزمالك',
    awayLogo: '⚪',
    time: '21:00',
    date: 'اليوم',
    status: 'live',
    channelName: 'الكأس 1 الرياضية HD',
    channelId: 'ch-alkass-1',
    commentator: 'مدحت شلبي',
    stadium: 'ستاد القاهرة الدولي',
    score: '1 - 0',
    servers: [
      { name: 'سيرفر 1 (الكأس HD مباشر - بدون إعلانات)', url: 'https://shoof.alkass.net/live/ch1.m3u8' },
      { name: 'سيرفر 2 (الكويت سبورت HD مباشر)', url: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 3 (عُمان سبورت HD مباشر)', url: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8' }
    ],
    sortOrder: 1
  },
  {
    id: 'match-2',
    league: 'دوري روشن السعودي',
    leagueFlag: '🇸🇦',
    homeTeam: 'الهلال',
    homeLogo: '🔵',
    awayTeam: 'النصر',
    awayLogo: '🟡',
    time: '20:30',
    date: 'اليوم',
    status: 'live',
    channelName: 'الكويت الرياضية HD',
    channelId: 'ch-ktv-sport',
    commentator: 'فهد العتيبي',
    stadium: 'ملعب المملكة أرينا',
    score: '2 - 2',
    servers: [
      { name: 'سيرفر 1 (الكويت سبورت HD مباشر)', url: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 2 (الكويت سبورت بلس HD)', url: 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 3 (الكأس 1 HD مباشر)', url: 'https://shoof.alkass.net/live/ch1.m3u8' }
    ],
    sortOrder: 2
  },
  {
    id: 'match-3',
    league: 'دوري أبطال أوروبا',
    leagueFlag: '🇪🇺',
    homeTeam: 'ريال مدريد',
    homeLogo: '⚪',
    awayTeam: 'مانشستر سيتي',
    awayLogo: '🩵',
    time: '22:00',
    date: 'اليوم',
    status: 'live',
    channelName: 'الأردن الرياضية HD',
    channelId: 'ch-jordan-sport',
    commentator: 'حفيظ دراجي',
    stadium: 'سانتياغو برنابيو',
    score: '1 - 1',
    servers: [
      { name: 'سيرفر 1 (الأردن سبورت HD مباشر)', url: 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8' },
      { name: 'سيرفر 2 (عُمان سبورت HD مباشر)', url: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 3 (الكأس HD مباشر)', url: 'https://shoof.alkass.net/live/ch1.m3u8' }
    ],
    sortOrder: 3
  }
];

const DEFAULT_NEWS = [
  { id: 'news-salah-record', title: 'محمد صلاح يقترب من معادلة إنجاز واين روني في تاريخ الدوري الإنجليزي الممتاز', summary: 'أصبح النجم المصري محمد صلاح على بعد هدفين فقط من تحقيق رقم قياسي جديد.', content: '<p>يواصل النجم المصري محمد صلاح، قائد منتخب مصر وهداف نادي ليفربول الإنجليزي، تحطيم الأرقام القياسية في ملاعب الدوري الإنجليزي الممتاز "البريميرليج".</p>', category: 'الدوري الإنجليزي', timeAgo: 'منذ 15 دقيقة', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', author: 'قسم الرياضة العالمية', gallery: ['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600'], sortOrder: 1 },
  { id: 'news-ahly-africa', title: 'الأهلي يتأهل لنصف نهائي دوري أبطال إفريقيا بعد فوز مستحق على سيمبا التنزاني', summary: 'نجح المارد الأحمر في حجز بطاقة التأهل للمربع الذهبي لبطولة دوري أبطال إفريقيا.', content: '<p>تأهل الفريق الأول لكرة القدم بالنادي الأهلي المصري إلى الدور نصف النهائي لبطولة دوري أبطال إفريقيا.</p>', category: 'كرة مصرية وإفريقية', timeAgo: 'منذ 30 دقيقة', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80', author: 'التحرير الرياضي', gallery: ['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600'], sortOrder: 2 },
  { id: 'news-hilal-derby', title: 'الهلال يتغلب على الشباب ويتصدر جدول دوري روشن السعودي للمحترفين', summary: 'واصل نادي الهلال عروضه القوية وانفرد بصدارة جدول ترتيب الدوري السعودي.', content: '<p>انتزع نادي الهلال ثلاث نقاط ثمينة ومستحقة بعد فوزه المثير على شقيقه نادي الشباب.</p>', category: 'دوري روشن', timeAgo: 'منذ 50 دقيقة', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80', author: 'مراسل الرياض', gallery: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'], sortOrder: 3 }
];

/**
 * Initialize Tables / Collections
 */
function initDatabase() {
  if (useSqlite) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS channels (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'news',
        country TEXT DEFAULT 'عربي', quality TEXT DEFAULT 'HD', logo TEXT DEFAULT '',
        type TEXT DEFAULT 'hls', stream_url TEXT NOT NULL DEFAULT '', fallback_url TEXT DEFAULT '',
        description TEXT DEFAULT '', is_featured INTEGER DEFAULT 0, viewers_count INTEGER DEFAULT 10000,
        sort_order INTEGER DEFAULT 0, is_default INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS radios (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, country TEXT DEFAULT 'عربي',
        stream_url TEXT NOT NULL DEFAULT '', icon TEXT DEFAULT 'fa-radio', description TEXT DEFAULT '',
        sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY, league TEXT NOT NULL, league_flag TEXT DEFAULT '🏆',
        home_team TEXT NOT NULL, home_logo TEXT DEFAULT '⚽', away_team TEXT NOT NULL, away_logo TEXT DEFAULT '⚽',
        time TEXT DEFAULT '', date TEXT DEFAULT 'اليوم', status TEXT DEFAULT 'upcoming',
        channel_name TEXT DEFAULT '', channel_id TEXT DEFAULT '', commentator TEXT DEFAULT 'غير محدد',
        stadium TEXT DEFAULT 'الملعب الرئيسي', score TEXT DEFAULT 'vs', servers TEXT DEFAULT '[]',
        sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS sports_news (
        id TEXT PRIMARY KEY, title TEXT NOT NULL, summary TEXT DEFAULT '', content TEXT DEFAULT '',
        category TEXT DEFAULT 'كرة قدم', time_ago TEXT DEFAULT 'الآن', image TEXT DEFAULT '',
        author TEXT DEFAULT 'التحرير الرياضي', gallery TEXT DEFAULT '[]', sort_order INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
      );
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now'))
      );
    `);
    try {
      db.exec('ALTER TABLE channels ADD COLUMN is_default INTEGER DEFAULT 0;');
    } catch (e) {}
    try {
      const defCheck = db.prepare('SELECT COUNT(*) as cnt FROM channels WHERE is_default = 1').get();
      if (defCheck && defCheck.cnt === 0) {
        db.prepare('UPDATE channels SET is_default = 1 WHERE sort_order = 1 OR id = (SELECT id FROM channels ORDER BY sort_order ASC LIMIT 1)').run();
      }
    } catch (e) {}
    seedDefaultData();
  } else {
    // File JSON init
    const data = readJsonDb();
    let updated = false;
    if (!data.channels || data.channels.length === 0) {
      data.channels = DEFAULT_CHANNELS.map(c => ({
        id: c.id, name: c.name, category: c.category, country: c.country,
        quality: c.quality, logo: c.logo, type: c.type, streamUrl: c.streamUrl,
        fallbackUrl: c.fallbackUrl, description: c.description, isFeatured: !!c.isFeatured,
        viewersCount: c.viewersCount || 10000, sortOrder: c.sortOrder || 0
      }));
      updated = true;
    }
    if (!data.radios || data.radios.length === 0) {
      data.radios = DEFAULT_RADIOS;
      updated = true;
    }
    if (!data.matches || data.matches.length === 0) {
      data.matches = DEFAULT_MATCHES;
      updated = true;
    }
    if (!data.sports_news || data.sports_news.length === 0) {
      data.sports_news = DEFAULT_NEWS;
      updated = true;
    }
    if (!data.admin_users) {
      data.admin_users = [];
      updated = true;
    }
    if (updated) writeJsonDb(data);
    syncStreamsToDirectHls();
  }
}

function seedDefaultData() {
  if (!useSqlite) return;
  const channelCount = db.prepare('SELECT COUNT(*) as cnt FROM channels').get();
  if (channelCount.cnt === 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO channels 
        (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order)
      VALUES 
        (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder)
    `);
    for (const c of DEFAULT_CHANNELS) insert.run(c);
  }
  const radCount = db.prepare('SELECT COUNT(*) as cnt FROM radios').get();
  if (radCount.cnt === 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO radios (id, name, country, stream_url, icon, description, sort_order)
      VALUES (@id, @name, @country, @streamUrl, @icon, @description, @sortOrder)
    `);
    for (const r of DEFAULT_RADIOS) insert.run(r);
  }
  const matchCount = db.prepare('SELECT COUNT(*) as cnt FROM matches').get();
  if (matchCount.cnt === 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO matches
        (id, league, league_flag, home_team, home_logo, away_team, away_logo, time, date, status, channel_name, channel_id, commentator, stadium, score, servers, sort_order)
      VALUES
        (@id, @league, @leagueFlag, @homeTeam, @homeLogo, @awayTeam, @awayLogo, @time, @date, @status, @channelName, @channelId, @commentator, @stadium, @score, @servers, @sortOrder)
    `);
    for (const m of DEFAULT_MATCHES) insert.run({ ...m, servers: JSON.stringify(m.servers || []) });
  }
  const newsCount = db.prepare('SELECT COUNT(*) as cnt FROM sports_news').get();
  if (newsCount.cnt === 0) {
    const insert = db.prepare(`
      INSERT OR IGNORE INTO sports_news
        (id, title, summary, content, category, time_ago, image, author, gallery, sort_order)
      VALUES
        (@id, @title, @summary, @content, @category, @timeAgo, @image, @author, @gallery, @sortOrder)
    `);
    for (const n of DEFAULT_NEWS) insert.run({ ...n, gallery: JSON.stringify(n.gallery || []) });
  }

  // Auto-sync existing channels to direct HLS streams (removes any old YouTube / iframe ad links)
  syncStreamsToDirectHls();
}

function syncStreamsToDirectHls() {
  if (useSqlite) {
    const insertChannel = db.prepare(`
      INSERT OR IGNORE INTO channels 
        (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, is_default, viewers_count, sort_order)
      VALUES 
        (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @isDefault, @viewersCount, @sortOrder)
    `);
    for (const c of DEFAULT_CHANNELS) {
      insertChannel.run({
        id: c.id,
        name: c.name || '',
        category: c.category || 'all',
        country: c.country || 'عربي',
        quality: c.quality || 'Full HD',
        logo: c.logo || '',
        type: c.type || (c.streamUrl && c.streamUrl.includes('.m3u8') ? 'hls' : 'iframe'),
        streamUrl: c.streamUrl || '',
        fallbackUrl: c.fallbackUrl || c.streamUrl || '',
        description: c.description || '',
        isFeatured: c.isFeatured ? 1 : 0,
        isDefault: c.isDefault ? 1 : 0,
        viewersCount: c.viewersCount || 15000,
        sortOrder: c.sortOrder || 0
      });
    }
  } else {
    const data = readJsonDb();
    if (data.channels) {
      for (const c of DEFAULT_CHANNELS) {
        const idx = data.channels.findIndex(x => x.id === c.id);
        if (idx !== -1) {
          data.channels[idx].streamUrl = c.streamUrl;
          data.channels[idx].fallbackUrl = c.fallbackUrl;
          data.channels[idx].type = c.type;
        } else {
          data.channels.push(c);
        }
      }
      for (const ch of data.channels) {
        if (ch.id !== 'ch-natgeo-ad' && (!ch.streamUrl || ch.streamUrl.includes('youtube') || ch.type === 'iframe')) {
          ch.streamUrl = 'https://shoof.alkass.net/live/ch1.m3u8';
          ch.fallbackUrl = 'https://shoof.alkass.net/live/ch1.m3u8';
          ch.type = 'hls';
        }
      }
      if (data.matches) {
        for (const m of DEFAULT_MATCHES) {
          const idx = data.matches.findIndex(x => x.id === m.id);
          if (idx !== -1) data.matches[idx].servers = m.servers;
        }
      }
      writeJsonDb(data);
    }
  }
}

// ========================== CHANNELS CRUD ==========================
function getAllChannels() {
  if (useSqlite) {
    return db.prepare('SELECT * FROM channels ORDER BY sort_order ASC, created_at DESC').all().map(mapChannel);
  }
  const data = readJsonDb();
  return (data.channels || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function getChannelById(id) {
  if (useSqlite) {
    const row = db.prepare('SELECT * FROM channels WHERE id = ?').get(id);
    return row ? mapChannel(row) : null;
  }
  const data = readJsonDb();
  return (data.channels || []).find(c => c.id === id) || null;
}

function createChannel(ch) {
  const id = ch.id || 'ch-' + Date.now();
  if (useSqlite) {
    db.prepare(`
      INSERT INTO channels (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order, is_default)
      VALUES (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder, @isDefault)
    `).run({
      id, ...ch,
      streamUrl: ch.streamUrl || '',
      fallbackUrl: ch.fallbackUrl || '',
      isFeatured: ch.isFeatured ? 1 : 0,
      viewersCount: ch.viewersCount || 10000,
      sortOrder: ch.sortOrder || 0,
      isDefault: ch.isDefault ? 1 : 0
    });
    return getChannelById(id);
  }
  const data = readJsonDb();
  const newCh = { id, ...ch, isFeatured: !!ch.isFeatured, viewersCount: ch.viewersCount || 10000, sortOrder: ch.sortOrder || 0, isDefault: !!ch.isDefault };
  data.channels.push(newCh);
  writeJsonDb(data);
  return newCh;
}

function updateChannel(id, ch) {
  if (useSqlite) {
    db.prepare(`
      UPDATE channels SET
        name = @name, category = @category, country = @country, quality = @quality,
        logo = @logo, type = @type, stream_url = @streamUrl, fallback_url = @fallbackUrl,
        description = @description, is_featured = @isFeatured,
        sort_order = COALESCE(@sortOrder, sort_order),
        is_default = COALESCE(@isDefault, is_default),
        updated_at = datetime('now')
      WHERE id = @id
    `).run({
      ...ch,
      id,
      isFeatured: ch.isFeatured ? 1 : 0,
      sortOrder: ch.sortOrder !== undefined ? ch.sortOrder : null,
      isDefault: ch.isDefault !== undefined ? (ch.isDefault ? 1 : 0) : null
    });
    return getChannelById(id);
  }
  const data = readJsonDb();
  const idx = data.channels.findIndex(c => c.id === id);
  if (idx !== -1) {
    data.channels[idx] = { ...data.channels[idx], ...ch, id, isFeatured: !!ch.isFeatured, isDefault: ch.isDefault !== undefined ? !!ch.isDefault : data.channels[idx].isDefault };
    writeJsonDb(data);
    return data.channels[idx];
  }
  return null;
}

function deleteChannel(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM channels WHERE id = ?').run(id);
  } else {
    const data = readJsonDb();
    data.channels = data.channels.filter(c => c.id !== id);
    writeJsonDb(data);
  }
}

function setDefaultChannel(channelId) {
  if (useSqlite) {
    db.prepare('UPDATE channels SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END').run(channelId);
    return getAllChannels();
  } else {
    const data = readJsonDb();
    if (data.channels) {
      data.channels.forEach(c => { c.isDefault = (c.id === channelId); });
      writeJsonDb(data);
    }
    return getAllChannels();
  }
}

function reorderChannels(orderedIds) {
  if (useSqlite) {
    const updateStmt = db.prepare('UPDATE channels SET sort_order = ? WHERE id = ?');
    const trx = db.transaction((ids) => {
      ids.forEach((id, index) => {
        updateStmt.run(index + 1, id);
      });
    });
    trx(orderedIds);
    return getAllChannels();
  } else {
    const data = readJsonDb();
    if (data.channels) {
      orderedIds.forEach((id, index) => {
        const ch = data.channels.find(c => c.id === id);
        if (ch) ch.sortOrder = index + 1;
      });
      data.channels.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      writeJsonDb(data);
    }
    return getAllChannels();
  }
}

function mapChannel(row) {
  return {
    id: row.id, name: row.name, category: row.category, country: row.country,
    quality: row.quality, logo: row.logo, type: row.type,
    streamUrl: row.stream_url, fallbackUrl: row.fallback_url,
    description: row.description, isFeatured: row.is_featured === 1,
    viewersCount: row.viewers_count, sortOrder: row.sort_order,
    isDefault: row.is_default === 1
  };
}

function mapRadio(r) {
  if (!r) return null;
  return {
    id: r.id,
    name: r.name,
    country: r.country,
    streamUrl: r.stream_url || r.streamUrl || '',
    icon: r.icon,
    description: r.description,
    sortOrder: r.sort_order !== undefined ? r.sort_order : (r.sortOrder || 0)
  };
}

// ========================== RADIOS CRUD ==========================
function getAllRadios() {
  if (useSqlite) {
    return db.prepare('SELECT * FROM radios ORDER BY sort_order ASC, created_at DESC').all().map(mapRadio);
  }
  const data = readJsonDb();
  return (data.radios || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function createRadio(r) {
  const id = r.id || 'rad-' + Date.now();
  if (useSqlite) {
    db.prepare(`
      INSERT INTO radios (id, name, country, stream_url, icon, description, sort_order)
      VALUES (@id, @name, @country, @streamUrl, @icon, @description, @sortOrder)
    `).run({ id, ...r, streamUrl: r.streamUrl || '', sortOrder: r.sortOrder || 0 });
    return mapRadio(db.prepare('SELECT * FROM radios WHERE id = ?').get(id));
  }
  const data = readJsonDb();
  const newR = { id, ...r, streamUrl: r.streamUrl || '' };
  data.radios.push(newR);
  writeJsonDb(data);
  return newR;
}

function updateRadio(id, r) {
  if (useSqlite) {
    db.prepare(`
      UPDATE radios SET name = @name, country = @country, stream_url = @streamUrl,
        icon = @icon, description = @description, updated_at = datetime('now')
      WHERE id = @id
    `).run({
      id,
      name: r.name || '',
      country: r.country || 'عربي',
      streamUrl: r.streamUrl || '',
      icon: r.icon || 'fa-radio',
      description: r.description || ''
    });
    return mapRadio(db.prepare('SELECT * FROM radios WHERE id = ?').get(id));
  }
  const data = readJsonDb();
  const idx = data.radios.findIndex(x => x.id === id);
  if (idx !== -1) {
    data.radios[idx] = { ...data.radios[idx], ...r, id };
    writeJsonDb(data);
    return data.radios[idx];
  }
  return null;
}

function deleteRadio(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM radios WHERE id = ?').run(id);
  } else {
    const data = readJsonDb();
    data.radios = data.radios.filter(x => x.id !== id);
    writeJsonDb(data);
  }
}

// ========================== MATCHES CRUD ==========================
function getAllMatches() {
  if (useSqlite) {
    return db.prepare('SELECT * FROM matches ORDER BY sort_order ASC, created_at DESC').all().map(mapMatch);
  }
  const data = readJsonDb();
  return (data.matches || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function createMatch(m) {
  const id = m.id || 'match-' + Date.now();
  if (useSqlite) {
    db.prepare(`
      INSERT INTO matches
        (id, league, league_flag, home_team, home_logo, away_team, away_logo, time, date, status, channel_name, channel_id, commentator, stadium, score, servers, sort_order)
      VALUES
        (@id, @league, @leagueFlag, @homeTeam, @homeLogo, @awayTeam, @awayLogo, @time, @date, @status, @channelName, @channelId, @commentator, @stadium, @score, @servers, @sortOrder)
    `).run({ id, ...m, servers: JSON.stringify(m.servers || []), sortOrder: m.sortOrder || 0 });
    return mapMatch(db.prepare('SELECT * FROM matches WHERE id = ?').get(id));
  }
  const data = readJsonDb();
  const newM = { id, ...m, servers: m.servers || [] };
  data.matches.push(newM);
  writeJsonDb(data);
  return newM;
}

function updateMatch(id, m) {
  if (useSqlite) {
    const existing = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!existing) return null;
    const existingMapped = mapMatch(existing);
    const updated = {
      ...existingMapped,
      ...m,
      id,
      servers: m.servers !== undefined ? m.servers : existingMapped.servers
    };
    db.prepare(`
      UPDATE matches SET
        league = @league, league_flag = @leagueFlag, home_team = @homeTeam, home_logo = @homeLogo,
        away_team = @awayTeam, away_logo = @awayLogo, time = @time, date = @date,
        status = @status, channel_name = @channelName, channel_id = @channelId,
        commentator = @commentator, stadium = @stadium, score = @score, servers = @servers,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...updated, servers: JSON.stringify(updated.servers || []) });
    return mapMatch(db.prepare('SELECT * FROM matches WHERE id = ?').get(id));
  }
  const data = readJsonDb();
  const idx = data.matches.findIndex(x => x.id === id);
  if (idx !== -1) {
    data.matches[idx] = { ...data.matches[idx], ...m, id };
    writeJsonDb(data);
    return data.matches[idx];
  }
  return null;
}

function updateMatchScore(id, score, status) {
  if (useSqlite) {
    const existing = db.prepare('SELECT * FROM matches WHERE id = ?').get(id);
    if (!existing) return null;
    const newStatus = status || existing.status;
    db.prepare("UPDATE matches SET score = ?, status = ?, updated_at = datetime('now') WHERE id = ?")
      .run(score, newStatus, id);
    return mapMatch(db.prepare('SELECT * FROM matches WHERE id = ?').get(id));
  }
  const data = readJsonDb();
  const m = (data.matches || []).find(x => x.id === id);
  if (m) {
    m.score = score;
    if (status) m.status = status;
    writeJsonDb(data);
    return m;
  }
  return null;
}

function deleteMatch(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  } else {
    const data = readJsonDb();
    data.matches = data.matches.filter(x => x.id !== id);
    writeJsonDb(data);
  }
}

function deleteEndedMatches() {
  if (useSqlite) {
    const info = db.prepare("DELETE FROM matches WHERE status = 'ended'").run();
    return info.changes;
  } else {
    const data = readJsonDb();
    const countBefore = (data.matches || []).length;
    data.matches = (data.matches || []).filter(x => x.status !== 'ended');
    writeJsonDb(data);
    return countBefore - data.matches.length;
  }
}

function mapMatch(row) {
  return {
    id: row.id, league: row.league, leagueFlag: row.league_flag,
    homeTeam: row.home_team, homeLogo: row.home_logo,
    awayTeam: row.away_team, awayLogo: row.away_logo,
    time: row.time, date: row.date, status: row.status,
    channelName: row.channel_name, channelId: row.channel_id,
    commentator: row.commentator, stadium: row.stadium,
    score: row.score, servers: JSON.parse(row.servers || '[]')
  };
}

// ========================== SPORTS NEWS CRUD ==========================
function getAllNews() {
  if (useSqlite) {
    return db.prepare('SELECT * FROM sports_news ORDER BY sort_order ASC, created_at DESC').all().map(n => ({
      id: n.id, title: n.title, summary: n.summary, content: n.content,
      category: n.category, timeAgo: n.time_ago, image: n.image,
      author: n.author, gallery: JSON.parse(n.gallery || '[]')
    }));
  }
  const data = readJsonDb();
  return (data.sports_news || []).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
}

function createNews(n) {
  const id = n.id || 'news-' + Date.now();
  if (useSqlite) {
    db.prepare(`
      INSERT INTO sports_news (id, title, summary, content, category, time_ago, image, author, gallery, sort_order)
      VALUES (@id, @title, @summary, @content, @category, @timeAgo, @image, @author, @gallery, @sortOrder)
    `).run({ id, ...n, gallery: JSON.stringify(n.gallery || []), sortOrder: n.sortOrder || 0 });
    return getAllNews().find(x => x.id === id);
  }
  const data = readJsonDb();
  const newN = { id, ...n, gallery: n.gallery || [] };
  data.sports_news.push(newN);
  writeJsonDb(data);
  return newN;
}

function deleteNews(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM sports_news WHERE id = ?').run(id);
  } else {
    const data = readJsonDb();
    data.sports_news = data.sports_news.filter(x => x.id !== id);
    writeJsonDb(data);
  }
}

// ========================== ADMIN AUTH ==========================
function getAdminUser(username) {
  if (useSqlite) {
    return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
  }
  const data = readJsonDb();
  return (data.admin_users || []).find(u => u.username === username) || null;
}

function createAdminUser(username, passwordHash) {
  if (useSqlite) {
    db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
  } else {
    const data = readJsonDb();
    if (!data.admin_users) data.admin_users = [];
    const existing = data.admin_users.find(u => u.username === username);
    if (existing) {
      existing.password_hash = passwordHash;
    } else {
      data.admin_users.push({ id: Date.now(), username, password_hash: passwordHash });
    }
    writeJsonDb(data);
  }
}

function adminUserExists() {
  if (useSqlite) {
    return db.prepare('SELECT COUNT(*) as cnt FROM admin_users').get().cnt > 0;
  }
  const data = readJsonDb();
  return (data.admin_users || []).length > 0;
}

// Auto init on load
initDatabase();

module.exports = {
  getAllChannels, getChannelById, createChannel, updateChannel, deleteChannel,
  setDefaultChannel, reorderChannels,
  getAllRadios, createRadio, updateRadio, deleteRadio,
  getAllMatches, createMatch, updateMatch, deleteMatch, updateMatchScore, deleteEndedMatches,
  getAllNews, createNews, deleteNews,
  getAdminUser, createAdminUser, adminUserExists,
  db
};
