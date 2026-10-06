/**
 * Arabia Live TV — SQLite Database Layer
 * Replaces browser localStorage with a reliable, server-side persistent database.
 * All data is shared across all browsers, devices, and tabs automatically.
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// On Render.com, the persistent disk is mounted at the project directory.
// DB_PATH auto-adapts to local development or production hosting.
const DB_PATH = process.env.NODE_ENV === 'production'
  ? path.join('/opt/render/project/src', 'altv_database.db')
  : path.join(__dirname, 'altv_database.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initialize all tables
 */
function initDatabase() {
  db.exec(`
    -- TV Channels Table
    CREATE TABLE IF NOT EXISTS channels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'news',
      country TEXT DEFAULT 'عربي',
      quality TEXT DEFAULT 'HD',
      logo TEXT DEFAULT '',
      type TEXT DEFAULT 'hls',
      stream_url TEXT NOT NULL DEFAULT '',
      fallback_url TEXT DEFAULT '',
      description TEXT DEFAULT '',
      is_featured INTEGER DEFAULT 0,
      viewers_count INTEGER DEFAULT 10000,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Radio Stations Table
    CREATE TABLE IF NOT EXISTS radios (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      country TEXT DEFAULT 'عربي',
      stream_url TEXT NOT NULL DEFAULT '',
      icon TEXT DEFAULT 'fa-radio',
      description TEXT DEFAULT 'بث صوتي مباشر',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Matches Table
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      league TEXT NOT NULL,
      league_flag TEXT DEFAULT '🏆',
      home_team TEXT NOT NULL,
      home_logo TEXT DEFAULT '⚽',
      away_team TEXT NOT NULL,
      away_logo TEXT DEFAULT '⚽',
      time TEXT DEFAULT '',
      date TEXT DEFAULT 'اليوم',
      status TEXT DEFAULT 'upcoming',
      channel_name TEXT DEFAULT '',
      channel_id TEXT DEFAULT '',
      commentator TEXT DEFAULT 'غير محدد',
      stadium TEXT DEFAULT 'الملعب الرئيسي',
      score TEXT DEFAULT 'vs',
      servers TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Sports News Table
    CREATE TABLE IF NOT EXISTS sports_news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT DEFAULT '',
      content TEXT DEFAULT '',
      category TEXT DEFAULT 'كرة قدم',
      time_ago TEXT DEFAULT 'الآن',
      image TEXT DEFAULT '',
      author TEXT DEFAULT 'التحرير الرياضي',
      gallery TEXT DEFAULT '[]',
      sort_order INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Admin Users Table (for secure auth)
    CREATE TABLE IF NOT EXISTS admin_users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Settings / Config Table
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now'))
    );
  `);

  console.log('✅ Database tables initialized.');
}

/**
 * Seed default data if tables are empty
 */
function seedDefaultData() {
  const channelCount = db.prepare('SELECT COUNT(*) as cnt FROM channels').get();
  
  if (channelCount.cnt === 0) {
    console.log('🌱 Seeding default channels...');
    const insertChannel = db.prepare(`
      INSERT OR IGNORE INTO channels 
        (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order)
      VALUES 
        (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder)
    `);

    const DEFAULT_CHANNELS = [
      { id: 'ch-aljazeera-news', name: 'الجزيرة الإخبارية', category: 'news', country: 'قطر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png', type: 'hls', streamUrl: 'https://live-hls-web-aje.akamaized.net/v1/master/053b922097368021ef37d806509f6e4a2432a688/aljazeera-arabic/index.m3u8', fallbackUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo', description: 'بث حي ومباشر لقناة الجزيرة الإخبارية - تغطية إخبارية مستمرة.', isFeatured: 1, viewersCount: 68200, sortOrder: 1 },
      { id: 'ch-alarabiya', name: 'قناة العربية الفضائية', category: 'news', country: 'السعودية', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Al_Arabiya_Logo.svg/300px-Al_Arabiya_Logo.svg.png', type: 'hls', streamUrl: 'https://live.alarabiya.net/alarabiya/live/playlist.m3u8', fallbackUrl: 'https://www.youtube.com/embed/2M-x9s_lqX4', description: 'قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.', isFeatured: 1, viewersCount: 61400, sortOrder: 2 },
      { id: 'ch-skynews-ar', name: 'سكاي نيوز عربية', category: 'news', country: 'الإمارات', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_News_Arabia_logo.svg/300px-Sky_News_Arabia_logo.svg.png', type: 'hls', streamUrl: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8', fallbackUrl: 'https://www.youtube.com/embed/0_QW_lDk3B4', description: 'البث المباشر لقناة سكاي نيوز عربية بالسرعة والموضوعية.', isFeatured: 0, viewersCount: 45800, sortOrder: 3 },
      { id: 'ch-france24-ar', name: 'فرانس 24 (باللغة العربية)', category: 'news', country: 'فرنسا', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/France_24_logo.svg/300px-France_24_logo.svg.png', type: 'hls', streamUrl: 'https://stream.france24.com/hls/ar/live/2038753/f24_ar.m3u8', fallbackUrl: 'https://www.france24.com/ar', description: 'الأخبار الدولية باللغة العربية على مدار 24 ساعة.', isFeatured: 0, viewersCount: 34200, sortOrder: 4 },
      { id: 'ch-trt-arabi', name: 'TRT عربي', category: 'news', country: 'تركيا', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/TRT_Arabi_logo.png/300px-TRT_Arabi_logo.png', type: 'hls', streamUrl: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8', fallbackUrl: 'https://www.trtarabi.com', description: 'قناة TRT العربية الإخبارية والثقافية.', isFeatured: 0, viewersCount: 29100, sortOrder: 5 },
      { id: 'ch-alghad', name: 'قناة الغد الإخبارية', category: 'news', country: 'مصر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Al_Ghad_TV_Logo.png/300px-Al_Ghad_TV_Logo.png', type: 'hls', streamUrl: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8', fallbackUrl: 'https://www.alghad.tv', description: 'قناة الغد - أول قناة إخبارية عربية تبث من القاهرة.', isFeatured: 0, viewersCount: 23500, sortOrder: 6 },
      { id: 'ch-saudi-quran', name: 'قناة القرآن الكريم (مكة المكرمة)', category: 'islamic', country: 'السعودية', quality: '4K Ultra', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saudi_Quran_TV_Logo.png/300px-Saudi_Quran_TV_Logo.png', type: 'hls', streamUrl: 'https://shls-quran-prod-dub.savanacdn.net/out/v1/678a1b5c394f4bf2b2ec9103e33c7f99/index.m3u8', fallbackUrl: 'https://www.youtube.com/embed/Y0W8V9m1wB4', description: 'بث حي ومباشر 24/7 من المسجد الحرام بمكة المكرمة مع تلاوة القرآن.', isFeatured: 1, viewersCount: 104000, sortOrder: 7 },
      { id: 'ch-saudi-sunnah', name: 'قناة السنة النبوية (المدينة المنورة)', category: 'islamic', country: 'السعودية', quality: '4K Ultra', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Saudi_Sunnah_TV_Logo.png/300px-Saudi_Sunnah_TV_Logo.png', type: 'hls', streamUrl: 'https://shls-sunna-prod-dub.savanacdn.net/out/v1/fa6164f9b2fa41a998bb55efbf6f5f3e/index.m3u8', fallbackUrl: 'https://www.youtube.com/embed/J7wP1_q_sW0', description: 'بث حي ومباشر من المسجد النبوي الشريف بالمدينة المنورة.', isFeatured: 1, viewersCount: 89500, sortOrder: 8 },
      { id: 'ch-ontime-1', name: 'أون تايم سبورتس 1 (ON Time Sports)', category: 'sports', country: 'مصر', quality: 'Full HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/ON_Time_Sports_logo.svg/300px-ON_Time_Sports_logo.svg.png', type: 'iframe', streamUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1', fallbackUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE', description: 'البث المباشر لقناة ON Time Sports 1 لمتابعة الدوري المصري والبطولات القارية.', isFeatured: 1, viewersCount: 72400, sortOrder: 9 },
      { id: 'ch-bein-news', name: 'بي إن سبورتس الإخبارية (beIN SPORTS)', category: 'sports', country: 'قطر', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_Sports_Logo.svg/300px-BeIN_Sports_Logo.svg.png', type: 'iframe', streamUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1', fallbackUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E', description: 'الأخبار الرياضية والتغطيات المباشرة من beIN SPORTS.', isFeatured: 1, viewersCount: 58900, sortOrder: 10 },
      { id: 'ch-ksa-sports', name: 'السعودية الرياضية 1 (KSA Sports)', category: 'sports', country: 'السعودية', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png', type: 'iframe', streamUrl: 'https://www.youtube.com/embed/2g811V88880?autoplay=1', fallbackUrl: 'https://www.youtube.com/embed/2g811V88880', description: 'ناقل دوري روشن السعودي للمحترفين والبطولات المحلية.', isFeatured: 0, viewersCount: 46200, sortOrder: 11 },
      { id: 'ch-mbc-masr', name: 'MBC مصر', category: 'drama', country: 'مصر', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png', type: 'iframe', streamUrl: 'https://www.youtube.com/embed/Xqz4W04g90A?autoplay=1', fallbackUrl: 'https://www.youtube.com/embed/Xqz4W04g90A', description: 'قناة الترفيه الأولى والبرامج الحوارية والمسلسلات العربية.', isFeatured: 1, viewersCount: 54800, sortOrder: 12 },
      { id: 'ch-rotana-cinema', name: 'روتانا سينما', category: 'drama', country: 'السعودية', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rotana_Cinema_Logo.png/300px-Rotana_Cinema_Logo.png', type: 'iframe', streamUrl: 'https://www.youtube.com/embed/7X8m_v7S184?autoplay=1', fallbackUrl: 'https://www.youtube.com/embed/7X8m_v7S184', description: 'أفلام السينما العربية الحديثة والمعاصرة.', isFeatured: 1, viewersCount: 51200, sortOrder: 13 },
      { id: 'ch-spacetoon', name: 'سبيستون (Spacetoon)', category: 'kids', country: 'الإمارات', quality: 'HD', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Spacetoon_logo.svg/300px-Spacetoon_logo.svg.png', type: 'iframe', streamUrl: 'https://www.youtube.com/embed/k8W9x1P9tT8?autoplay=1', fallbackUrl: 'https://www.youtube.com/embed/k8W9x1P9tT8', description: 'قناة شباب المستقبل - أنمي وبرامج كرتون مميزة.', isFeatured: 1, viewersCount: 45000, sortOrder: 14 }
    ];

    const insertMany = db.transaction((channels) => {
      for (const ch of channels) insertChannel.run(ch);
    });
    insertMany(DEFAULT_CHANNELS);
  }

  const radioCount = db.prepare('SELECT COUNT(*) as cnt FROM radios').get();
  if (radioCount.cnt === 0) {
    console.log('🌱 Seeding default radios...');
    const insertRadio = db.prepare(`
      INSERT OR IGNORE INTO radios (id, name, country, stream_url, icon, description, sort_order)
      VALUES (@id, @name, @country, @streamUrl, @icon, @description, @sortOrder)
    `);
    const DEFAULT_RADIOS = [
      { id: 'rad-quran-cairo', name: 'إذاعة القرآن الكريم من القاهرة', country: 'مصر', streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv', icon: 'fa-mosque', description: 'تلاوات خاشعة وأحاديث شريفة برواية حفص عن عاصم على مدار 24 ساعة.', sortOrder: 1 },
      { id: 'rad-quran-makkah', name: 'إذاعة القرآن الكريم - مكة المكرمة', country: 'السعودية', streamUrl: 'https://ssl.live.hawaa.link/listen/quran_makkah/radio.mp3', icon: 'fa-kaaba', description: 'البث الصوتي المباشر للتلاوات والصلوات من الحرم المكي الشريف.', sortOrder: 2 },
      { id: 'rad-monte-carlo', name: 'إذاعة مونت كارلو الدولية', country: 'فرنسا/عربي', streamUrl: 'https://montecarlo.ice.infomaniak.ch/mc-doualiya-midfi.mp3', icon: 'fa-tower-cell', description: 'أخبار عالمية وتحليلات سياسية وثقافية بلغة عربية راقية ومباشرة.', sortOrder: 3 },
      { id: 'rad-radio-sawa', name: 'إذاعة راديو سوا', country: 'عربي', streamUrl: 'https://mbn-channel-01.akamaized.net/hls/live/2003501/sawa/master.m3u8', icon: 'fa-radio', description: 'أحدث الأخبار الإقليمية والبرامج الموسيقية والشبابية.', sortOrder: 4 },
      { id: 'rad-rotana-fm', name: 'إذاعة روتانا إف إم', country: 'السعودية', streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv', icon: 'fa-music', description: 'أشهر الأغاني العربية الحديثة والبرامج الترفيهية الفنية.', sortOrder: 5 }
    ];
    const insertManyRadios = db.transaction((radios) => {
      for (const r of radios) insertRadio.run(r);
    });
    insertManyRadios(DEFAULT_RADIOS);
  }

  const matchCount = db.prepare('SELECT COUNT(*) as cnt FROM matches').get();
  if (matchCount.cnt === 0) {
    console.log('🌱 Seeding default matches...');
    const insertMatch = db.prepare(`
      INSERT OR IGNORE INTO matches
        (id, league, league_flag, home_team, home_logo, away_team, away_logo, time, date, status, channel_name, channel_id, commentator, stadium, score, servers, sort_order)
      VALUES
        (@id, @league, @leagueFlag, @homeTeam, @homeLogo, @awayTeam, @awayLogo, @time, @date, @status, @channelName, @channelId, @commentator, @stadium, @score, @servers, @sortOrder)
    `);
    const DEFAULT_MATCHES = [
      { id: 'match-1', league: 'دوري أبطال إفريقيا', leagueFlag: '🏆', homeTeam: 'الأهلي المصري', homeLogo: '🔴', awayTeam: 'الزمالك', awayLogo: '⚪', time: '21:00', date: 'اليوم', status: 'live', channelName: 'أون تايم سبورتس 1', channelId: 'ch-ontime-1', commentator: 'مدحت شلبي', stadium: 'ستاد القاهرة الدولي', score: '1 - 0', servers: JSON.stringify([{ name: 'سيرفر 1 (Full HD Direct)', url: 'https://live-hls-web-aje.akamaized.net/v1/master/053b922097368021ef37d806509f6e4a2432a688/aljazeera-arabic/index.m3u8' }, { name: 'سيرفر 2', url: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1' }]), sortOrder: 1 },
      { id: 'match-2', league: 'دوري روشن السعودي', leagueFlag: '🇸🇦', homeTeam: 'الهلال', homeLogo: '🔵', awayTeam: 'النصر', awayLogo: '🟡', time: '20:30', date: 'اليوم', status: 'live', channelName: 'السعودية الرياضية 1', channelId: 'ch-ksa-sports', commentator: 'فهد العتيبي', stadium: 'ملعب المملكة أرينا', score: '2 - 2', servers: JSON.stringify([{ name: 'سيرفر 1 (SSC HD)', url: 'https://www.youtube.com/embed/2g811V88880?autoplay=1' }, { name: 'سيرفر 2', url: 'https://live.alarabiya.net/alarabiya/live/playlist.m3u8' }]), sortOrder: 2 },
      { id: 'match-3', league: 'دوري أبطال أوروبا', leagueFlag: '🇪🇺', homeTeam: 'ريال مدريد', homeLogo: '⚪', awayTeam: 'مانشستر سيتي', awayLogo: '🩵', time: '22:00', date: 'اليوم', status: 'live', channelName: 'بي إن سبورتس 1', channelId: 'ch-bein-news', commentator: 'حفيظ دراجي', stadium: 'سانتياغو برنابيو', score: '1 - 1', servers: JSON.stringify([{ name: 'سيرفر 1 (beIN Premium)', url: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8' }, { name: 'سيرفر 2', url: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1' }]), sortOrder: 3 }
    ];
    const insertManyMatches = db.transaction((matches) => {
      for (const m of matches) insertMatch.run(m);
    });
    insertManyMatches(DEFAULT_MATCHES);
  }

  const newsCount = db.prepare('SELECT COUNT(*) as cnt FROM sports_news').get();
  if (newsCount.cnt === 0) {
    console.log('🌱 Seeding default sports news...');
    const insertNews = db.prepare(`
      INSERT OR IGNORE INTO sports_news
        (id, title, summary, content, category, time_ago, image, author, gallery, sort_order)
      VALUES
        (@id, @title, @summary, @content, @category, @timeAgo, @image, @author, @gallery, @sortOrder)
    `);
    const DEFAULT_NEWS = [
      { id: 'news-salah-record', title: 'محمد صلاح يقترب من معادلة إنجاز واين روني في تاريخ الدوري الإنجليزي الممتاز', summary: 'أصبح النجم المصري محمد صلاح على بعد هدفين فقط من تحقيق رقم قياسي جديد.', content: '<p>يواصل النجم المصري محمد صلاح، قائد منتخب مصر وهداف نادي ليفربول الإنجليزي، تحطيم الأرقام القياسية في ملاعب الدوري الإنجليزي الممتاز "البريميرليج".</p><p>ووفقاً للبيانات الإحصائية الرسمية الصادرة عن رابطة الدوري الإنجليزي، تفصل صلاح مباراتين فقط عن معادلة السجل التهديفي التاريخي لأيقونة مانشستر يونايتد واين روني.</p>', category: 'الدوري الإنجليزي', timeAgo: 'منذ 15 دقيقة', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', author: 'قسم الرياضة العالمية', gallery: JSON.stringify(['https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600']), sortOrder: 1 },
      { id: 'news-ahly-africa', title: 'الأهلي يتأهل لنصف نهائي دوري أبطال إفريقيا بعد فوز مستحق على سيمبا التنزاني', summary: 'نجح المارد الأحمر في حجز بطاقة التأهل للمربع الذهبي لبطولة دوري أبطال إفريقيا.', content: '<p>تأهل الفريق الأول لكرة القدم بالنادي الأهلي المصري إلى الدور نصف النهائي لبطولة دوري أبطال إفريقيا، بعد تحقيقه فوزاً ثميناً على ضيفه سيمبا التنزاني بهدفين دون رد.</p>', category: 'كرة مصرية وإفريقية', timeAgo: 'منذ 30 دقيقة', image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80', author: 'التحرير الرياضي', gallery: JSON.stringify(['https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600']), sortOrder: 2 },
      { id: 'news-hilal-derby', title: 'الهلال يتغلب على الشباب ويتصدر جدول دوري روشن السعودي للمحترفين', summary: 'واصل نادي الهلال عروضه القوية وانفرد بصدارة جدول ترتيب الدوري السعودي.', content: '<p>انتزع نادي الهلال ثلاث نقاط ثمينة ومستحقة بعد فوزه المثير على شقيقه نادي الشباب بنتيجة 4-3 في المواجهة النارية.</p>', category: 'دوري روشن', timeAgo: 'منذ 50 دقيقة', image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80', author: 'مراسل الرياض', gallery: JSON.stringify(['https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600']), sortOrder: 3 }
    ];
    const insertManyNews = db.transaction((news) => {
      for (const n of news) insertNews.run(n);
    });
    insertManyNews(DEFAULT_NEWS);
  }
}

// ========================== DATA ACCESS FUNCTIONS ==========================

// --- CHANNELS ---
function getAllChannels() {
  return db.prepare('SELECT * FROM channels ORDER BY sort_order ASC, created_at DESC').all().map(mapChannel);
}

function getChannelById(id) {
  const row = db.prepare('SELECT * FROM channels WHERE id = ?').get(id);
  return row ? mapChannel(row) : null;
}

function createChannel(ch) {
  const id = ch.id || 'ch-' + Date.now();
  db.prepare(`
    INSERT INTO channels (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, viewers_count, sort_order)
    VALUES (@id, @name, @category, @country, @quality, @logo, @type, @streamUrl, @fallbackUrl, @description, @isFeatured, @viewersCount, @sortOrder)
  `).run({ id, ...ch, streamUrl: ch.streamUrl || '', fallbackUrl: ch.fallbackUrl || '', isFeatured: ch.isFeatured ? 1 : 0, viewersCount: ch.viewersCount || 10000, sortOrder: ch.sortOrder || 0 });
  return getChannelById(id);
}

function updateChannel(id, ch) {
  db.prepare(`
    UPDATE channels SET
      name = @name, category = @category, country = @country, quality = @quality,
      logo = @logo, type = @type, stream_url = @streamUrl, fallback_url = @fallbackUrl,
      description = @description, is_featured = @isFeatured, updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...ch, id, isFeatured: ch.isFeatured ? 1 : 0 });
  return getChannelById(id);
}

function deleteChannel(id) {
  db.prepare('DELETE FROM channels WHERE id = ?').run(id);
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

// --- RADIOS ---
function getAllRadios() {
  return db.prepare('SELECT * FROM radios ORDER BY sort_order ASC, created_at DESC').all().map(mapRadio);
}

function createRadio(r) {
  const id = r.id || 'rad-' + Date.now();
  db.prepare(`
    INSERT INTO radios (id, name, country, stream_url, icon, description, sort_order)
    VALUES (@id, @name, @country, @streamUrl, @icon, @description, @sortOrder)
  `).run({ id, ...r, streamUrl: r.streamUrl || '', sortOrder: r.sortOrder || 0 });
  return db.prepare('SELECT * FROM radios WHERE id = ?').get(id);
}

function updateRadio(id, r) {
  db.prepare(`
    UPDATE radios SET name = @name, country = @country, stream_url = @streamUrl,
      icon = @icon, description = @description, updated_at = datetime('now')
    WHERE id = @id
  `).run({ ...r, id });
  return db.prepare('SELECT * FROM radios WHERE id = ?').get(id);
}

function deleteRadio(id) {
  db.prepare('DELETE FROM radios WHERE id = ?').run(id);
}

function mapRadio(row) {
  return { id: row.id, name: row.name, country: row.country, streamUrl: row.stream_url, icon: row.icon, description: row.description };
}

// --- MATCHES ---
function getAllMatches() {
  return db.prepare('SELECT * FROM matches ORDER BY sort_order ASC, created_at DESC').all().map(mapMatch);
}

function createMatch(m) {
  const id = m.id || 'match-' + Date.now();
  db.prepare(`
    INSERT INTO matches
      (id, league, league_flag, home_team, home_logo, away_team, away_logo, time, date, status, channel_name, channel_id, commentator, stadium, score, servers, sort_order)
    VALUES
      (@id, @league, @leagueFlag, @homeTeam, @homeLogo, @awayTeam, @awayLogo, @time, @date, @status, @channelName, @channelId, @commentator, @stadium, @score, @servers, @sortOrder)
  `).run({ id, ...m, servers: JSON.stringify(m.servers || []), sortOrder: m.sortOrder || 0 });
  return mapMatch(db.prepare('SELECT * FROM matches WHERE id = ?').get(id));
}

function updateMatch(id, m) {
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

function deleteMatch(id) {
  db.prepare('DELETE FROM matches WHERE id = ?').run(id);
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

// --- SPORTS NEWS ---
function getAllNews() {
  return db.prepare('SELECT * FROM sports_news ORDER BY sort_order ASC, created_at DESC').all().map(mapNews);
}

function createNews(n) {
  const id = n.id || 'news-' + Date.now();
  db.prepare(`
    INSERT INTO sports_news (id, title, summary, content, category, time_ago, image, author, gallery, sort_order)
    VALUES (@id, @title, @summary, @content, @category, @timeAgo, @image, @author, @gallery, @sortOrder)
  `).run({ id, ...n, gallery: JSON.stringify(n.gallery || []), sortOrder: n.sortOrder || 0 });
  return mapNews(db.prepare('SELECT * FROM sports_news WHERE id = ?').get(id));
}

function deleteNews(id) {
  db.prepare('DELETE FROM sports_news WHERE id = ?').run(id);
}

function mapNews(row) {
  return {
    id: row.id, title: row.title, summary: row.summary, content: row.content,
    category: row.category, timeAgo: row.time_ago, image: row.image,
    author: row.author, gallery: JSON.parse(row.gallery || '[]')
  };
}

// --- ADMIN USERS ---
function getAdminUser(username) {
  return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
}

function createAdminUser(username, passwordHash) {
  db.prepare('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)').run(username, passwordHash);
}

function adminUserExists() {
  return db.prepare('SELECT COUNT(*) as cnt FROM admin_users').get().cnt > 0;
}

// Initialize on module load
initDatabase();
seedDefaultData();

module.exports = {
  // Channels
  getAllChannels, getChannelById, createChannel, updateChannel, deleteChannel,
  // Radios
  getAllRadios, createRadio, updateRadio, deleteRadio,
  // Matches
  getAllMatches, createMatch, updateMatch, deleteMatch,
  // News
  getAllNews, createNews, deleteNews,
  // Auth
  getAdminUser, createAdminUser, adminUserExists,
  // Raw db access for advanced queries
  db
};
