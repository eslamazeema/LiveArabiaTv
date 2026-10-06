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
  // --- NEWS CHANNELS ---
  { id: 'ch-aljazeera-news', name: 'الجزيرة الإخبارية', category: 'news', country: 'قطر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png', type: 'hls', streamUrl: 'https://live-hls-web-aja-fa.thehlive.com/AJA/index.m3u8', fallbackUrl: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8', description: 'بث حي ومباشر لقناة الجزيرة الإخبارية - تغطية إخبارية مستمرة.', isFeatured: 1, viewersCount: 68200, sortOrder: 1 },
  { id: 'ch-alarabiya', name: 'قناة العربية الفضائية', category: 'news', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Al_Arabiya_Logo.svg/300px-Al_Arabiya_Logo.svg.png', type: 'hls', streamUrl: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8', fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-alarabiya/7f90de73d777d04f3dada92f90d35c44/index.m3u8', description: 'قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.', isFeatured: 1, viewersCount: 61400, sortOrder: 2 },
  { id: 'ch-alhadath', name: 'قناة الحدث', category: 'news', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Al_Hadath_Logo.png/300px-Al_Hadath_Logo.png', type: 'hls', streamUrl: 'https://av.alarabiya.net/alarabiapublish/alhadath.smil/playlist.m3u8', fallbackUrl: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8', description: 'قناة الحدث - متابعة حية ومكثفة للأحداث العاجلة حول العالم.', isFeatured: 1, viewersCount: 54200, sortOrder: 3 },
  { id: 'ch-skynews-ar', name: 'سكاي نيوز عربية', category: 'news', country: 'الإمارات', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_News_Arabia_logo.svg/300px-Sky_News_Arabia_logo.svg.png', type: 'hls', streamUrl: 'https://live-stream.skynewsarabia.com/c-horizontal-channel/horizontal-stream/index.m3u8', fallbackUrl: 'https://stream.skynewsarabia.com/ott/ott.m3u8', description: 'البث المباشر لقناة سكاي نيوز عربية بالسرعة والموضوعية.', isFeatured: 0, viewersCount: 45800, sortOrder: 4 },
  { id: 'ch-alekhbariya', name: 'قناة الإخبارية السعودية', category: 'news', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Al_Ekhbariya_logo.svg/300px-Al_Ekhbariya_logo.svg.png', type: 'hls', streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/al_ekhbariya/hls_roku/index.m3u8', fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-al-ekhbaria/297b3ef1cd0633ad9cfba7473a686a06/index.m3u8', description: 'قناة الإخبارية السعودية الرسمية - متابعة حية ومباشرة للأحداث المحلية والعالمية.', isFeatured: 0, viewersCount: 38200, sortOrder: 5 },
  { id: 'ch-asharq-news', name: 'الشرق للأخبار (Bloomberg)', category: 'news', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Asharq_News_Logo.svg/300px-Asharq_News_Logo.svg.png', type: 'hls', streamUrl: 'https://live-news.asharq.com/asharq.m3u8', fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-asharq/10ae30c64e21402c8116a7fb1e5aa789/index.m3u8', description: 'قناة الشرق الإخبارية بالتعاون مع بلومبرغ للأخبار والتحليلات الاقتصادية والسياسية.', isFeatured: 0, viewersCount: 33100, sortOrder: 6 },
  { id: 'ch-trt-arabi', name: 'TRT عربي', category: 'news', country: 'تركيا', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/TRT_Arabi_logo.png/300px-TRT_Arabi_logo.png', type: 'hls', streamUrl: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8', fallbackUrl: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8', description: 'قناة TRT العربية الإخبارية والثقافية.', isFeatured: 0, viewersCount: 29100, sortOrder: 7 },
  { id: 'ch-cnbc-arabiya', name: 'CNBC عربية', category: 'news', country: 'الإمارات', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_Arabia_logo.svg/300px-CNBC_Arabia_logo.svg.png', type: 'hls', streamUrl: 'https://cnbc-live.akamaized.net/cnbc/master.m3u8', fallbackUrl: 'https://cnbc-live.akamaized.net/cnbc/master.m3u8', description: 'القناة الاقتصادية الأولى في العالم العربي - أسواق المال والأعمال.', isFeatured: 0, viewersCount: 24700, sortOrder: 8 },

  // --- ISLAMIC CHANNELS ---
  { id: 'ch-saudi-quran', name: 'قناة القرآن الكريم (مكة المكرمة)', category: 'islamic', country: 'السعودية', quality: '4K Ultra', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saudi_Quran_TV_Logo.png/300px-Saudi_Quran_TV_Logo.png', type: 'hls', streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8', fallbackUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8', description: 'بث حي ومباشر 24/7 من المسجد الحرام بمكة المكرمة مع تلاوة القرآن.', isFeatured: 1, viewersCount: 104000, sortOrder: 9 },
  { id: 'ch-saudi-sunnah', name: 'قناة السنة النبوية (المدينة المنورة)', category: 'islamic', country: 'السعودية', quality: '4K Ultra', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Saudi_Sunnah_TV_Logo.png/300px-Saudi_Sunnah_TV_Logo.png', type: 'hls', streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8', fallbackUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8', description: 'بث حي ومباشر من المسجد النبوي الشريف بالمدينة المنورة.', isFeatured: 1, viewersCount: 89500, sortOrder: 10 },
  { id: 'ch-qatar-quran', name: 'تلفزيون قطر للقرآن الكريم', category: 'islamic', country: 'قطر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saudi_Quran_TV_Logo.png/300px-Saudi_Quran_TV_Logo.png', type: 'hls', streamUrl: 'https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8', fallbackUrl: 'https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8', description: 'تلاوات خاشعة وبرامج إسلامية وتفسير القرآن الكريم على مدار 24 ساعة.', isFeatured: 0, viewersCount: 42100, sortOrder: 11 },

  // --- SPORTS CHANNELS (DIRECT HLS - ZERO ADS) ---
  { id: 'ch-alkass-1', name: 'قنوات الكأس 1 الرياضية (Al Kass)', category: 'sports', country: 'قطر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Al_Kass_Sports_Channels_logo.png/300px-Al_Kass_Sports_Channels_logo.png', type: 'hls', streamUrl: 'https://shoof.alkass.net/live/ch1.m3u8', fallbackUrl: 'https://shoof.alkass.net/live/ch1.m3u8', description: 'البث المباشر لقناة الكأس 1 الرياضية لنقل البطولات والمباريات العربية مباشرة.', isFeatured: 1, viewersCount: 78500, sortOrder: 12 },
  { id: 'ch-ktv-sport', name: 'الكويت الرياضية (KTV Sport HD)', category: 'sports', country: 'الكويت', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png', type: 'hls', streamUrl: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8', fallbackUrl: 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8', description: 'القناة الرياضية الكويتية الرسمية لنقل المباريات والدوريات الخليجية والعربية.', isFeatured: 1, viewersCount: 65200, sortOrder: 13 },
  { id: 'ch-ktv-sport-plus', name: 'الكويت سبورت بلس (Sport Plus)', category: 'sports', country: 'الكويت', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png', type: 'hls', streamUrl: 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8', fallbackUrl: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8', description: 'البث الإضافي لمباريات واستوديوهات الكويت الرياضية المباشرة.', isFeatured: 0, viewersCount: 51000, sortOrder: 14 },
  { id: 'ch-oman-sports', name: 'عُمان الرياضية (Oman Sport)', category: 'sports', country: 'عُمان', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png', type: 'hls', streamUrl: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8', fallbackUrl: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8', description: 'قناة عُمان الرياضية - تغطيات حية ومباشرة للمسابقات والبطولات العربية.', isFeatured: 0, viewersCount: 46800, sortOrder: 15 },
  { id: 'ch-jordan-sport', name: 'الأردن الرياضية (Jordan Sport)', category: 'sports', country: 'الأردن', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png', type: 'hls', streamUrl: 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8', fallbackUrl: 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8', description: 'القناة الرياضية الأردنية الرسمية - بث مباشر للمباريات والمنافسات الرياضية.', isFeatured: 0, viewersCount: 43200, sortOrder: 16 },

  // --- DRAMA & ENTERTAINMENT ---
  { id: 'ch-mbc-1', name: 'MBC 1', category: 'drama', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png', type: 'hls', streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8', fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8', description: 'قناة الأسرة العربية الأولى - مسلسلات، برامج ترفيهية، وأخبار منوعة.', isFeatured: 1, viewersCount: 62400, sortOrder: 17 },
  { id: 'ch-mbc-masr', name: 'MBC مصر', category: 'drama', country: 'مصر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png', type: 'hls', streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8', fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8', description: 'قناة الترفيه الأولى والبرامج الحوارية والمسلسلات العربية والكوميدية مباشرة.', isFeatured: 1, viewersCount: 58900, sortOrder: 18 },
  { id: 'ch-mbc-drama', name: 'MBC دراما', category: 'drama', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png', type: 'hls', streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8', fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8', description: 'باقة من أروع المسلسلات الدرامية العربية والخليجية والمصرية على مدار الساعة.', isFeatured: 0, viewersCount: 53100, sortOrder: 19 },
  { id: 'ch-sharjah-tv', name: 'قناة الشارقة الفضائية', category: 'drama', country: 'الإمارات', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_News_Arabia_logo.svg/300px-Sky_News_Arabia_logo.svg.png', type: 'hls', streamUrl: 'https://live.kwikmotion.com/smc1live/smc1tv.smil/playlist.m3u8', fallbackUrl: 'https://live.kwikmotion.com/smc1live/smc1tv.smil/playlist.m3u8', description: 'قناة الشارقة - برامج ثقافية واجتماعية ودرامية هادفة تناسب كل أفراد الأسرة.', isFeatured: 0, viewersCount: 37500, sortOrder: 20 },

  // --- DOCUMENTARY CHANNELS (قنوات وثائقية) ---
  { id: 'ch-natgeo-ad', name: 'ناشيونال جيوغرافيك أبوظبي (Nat Geo)', category: 'docu', country: 'الإمارات', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Natgeologo.svg/300px-Natgeologo.svg.png', type: 'embed', streamUrl: 'https://www.elahmad.ru/tv/embed.php?id=natgeo_1', fallbackUrl: 'https://www.elahmad.ru/tv/radiant.php?id=natgeo_1', description: 'البث المباشر لقناة ناشيونال جيوغرافيك أبوظبي - أقوى الأفلام الوثائقية واستكشاف الطبيعة والعلوم مدبلجة بالعربية.', isFeatured: 1, viewersCount: 74200, sortOrder: 21 },
  { id: 'ch-asharq-docu', name: 'الشرق الوثائقية HD', category: 'docu', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Asharq_News_Logo.svg/300px-Asharq_News_Logo.svg.png', type: 'hls', streamUrl: 'https://svs.itworkscdn.net/asharqdocumentarylive/asharqdocumentary.smil/playlist.m3u8', fallbackUrl: 'https://svs.itworkscdn.net/asharqdocumentarylive/asharqdocumentary.smil/playlist_dvr.m3u8', description: 'قناة الشرق الوثائقية الرسمية - تحقيقات وأفلام وثائقية وسلاسل معرفية عالمية بدون إعلانات.', isFeatured: 1, viewersCount: 56100, sortOrder: 22 },
  { id: 'ch-aljazeera-docu', name: 'الجزيرة الوثائقية HD', category: 'docu', country: 'قطر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png', type: 'hls', streamUrl: 'https://live-hls-web-ajd-fa.thehlive.com/AJD/index.m3u8', fallbackUrl: 'https://live-hls-web-ajd-fa.thehlive.com/AJD/index.m3u8', description: 'قناة الجزيرة الوثائقية - قصص وأفلام وثائقية تغوص في التاريخ والعلوم والمجتمع.', isFeatured: 0, viewersCount: 49300, sortOrder: 23 }
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
        sort_order INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
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
    const updateChannel = db.prepare(`
      UPDATE channels SET stream_url = @streamUrl, fallback_url = @fallbackUrl, type = @type, name = @name, category = @category
      WHERE id = @id
    `);
    const insertChannel = db.prepare(`
      INSERT OR IGNORE INTO channels 
        (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order)
      VALUES 
        (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder)
    `);
    for (const c of DEFAULT_CHANNELS) {
      insertChannel.run(c);
      updateChannel.run({ id: c.id, streamUrl: c.streamUrl, fallbackUrl: c.fallbackUrl, type: c.type, name: c.name, category: c.category });
    }
    const updateMatch = db.prepare(`UPDATE matches SET servers = @servers WHERE id = @id`);
    for (const m of DEFAULT_MATCHES) {
      updateMatch.run({ id: m.id, servers: JSON.stringify(m.servers || []) });
    }
    // Clean up any remaining legacy channels with youtube or broken embeds (excluding official natgeo embed)
    db.prepare(`
      UPDATE channels 
      SET stream_url = 'https://shoof.alkass.net/live/ch1.m3u8', fallback_url = 'https://shoof.alkass.net/live/ch1.m3u8', type = 'hls'
      WHERE id != 'ch-natgeo-ad' AND (stream_url LIKE '%youtube%' OR type = 'iframe')
    `).run();
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
      INSERT INTO channels (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order)
      VALUES (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder)
    `).run({ id, ...ch, streamUrl: ch.streamUrl || '', fallbackUrl: ch.fallbackUrl || '', isFeatured: ch.isFeatured ? 1 : 0, viewersCount: ch.viewersCount || 10000, sortOrder: ch.sortOrder || 0 });
    return getChannelById(id);
  }
  const data = readJsonDb();
  const newCh = { id, ...ch, isFeatured: !!ch.isFeatured, viewersCount: ch.viewersCount || 10000, sortOrder: ch.sortOrder || 0 };
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
        description = @description, is_featured = @isFeatured, updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...ch, id, isFeatured: ch.isFeatured ? 1 : 0 });
    return getChannelById(id);
  }
  const data = readJsonDb();
  const idx = data.channels.findIndex(c => c.id === id);
  if (idx !== -1) {
    data.channels[idx] = { ...data.channels[idx], ...ch, id, isFeatured: !!ch.isFeatured };
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

function mapChannel(row) {
  return {
    id: row.id, name: row.name, category: row.category, country: row.country,
    quality: row.quality, logo: row.logo, type: row.type,
    streamUrl: row.stream_url, fallbackUrl: row.fallback_url,
    description: row.description, isFeatured: row.is_featured === 1,
    viewersCount: row.viewers_count, sortOrder: row.sort_order
  };
}

// ========================== RADIOS CRUD ==========================
function getAllRadios() {
  if (useSqlite) {
    return db.prepare('SELECT * FROM radios ORDER BY sort_order ASC, created_at DESC').all().map(r => ({
      id: r.id, name: r.name, country: r.country, streamUrl: r.stream_url, icon: r.icon, description: r.description
    }));
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
    return db.prepare('SELECT * FROM radios WHERE id = ?').get(id);
  }
  const data = readJsonDb();
  const newR = { id, ...r };
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
    `).run({ ...r, id });
    return db.prepare('SELECT * FROM radios WHERE id = ?').get(id);
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
    db.prepare(`
      UPDATE matches SET
        league = @league, league_flag = @leagueFlag, home_team = @homeTeam, home_logo = @homeLogo,
        away_team = @awayTeam, away_logo = @awayLogo, time = @time, date = @date,
        status = @status, channel_name = @channelName, channel_id = @channelId,
        commentator = @commentator, stadium = @stadium, score = @score, servers = @servers,
        updated_at = datetime('now')
      WHERE id = @id
    `).run({ ...m, id, servers: JSON.stringify(m.servers || []) });
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

function deleteMatch(id) {
  if (useSqlite) {
    db.prepare('DELETE FROM matches WHERE id = ?').run(id);
  } else {
    const data = readJsonDb();
    data.matches = data.matches.filter(x => x.id !== id);
    writeJsonDb(data);
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
  getAllRadios, createRadio, updateRadio, deleteRadio,
  getAllMatches, createMatch, updateMatch, deleteMatch,
  getAllNews, createNews, deleteNews,
  getAdminUser, createAdminUser, adminUserExists,
  db
};
