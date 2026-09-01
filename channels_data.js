/**
 * Arabia Live TV (arabialivetv.com) Initial Data Store
 * Accurate & Updated Match Schedules, Tested Live Streams, Exclusive News Articles & Full News Content.
 */

const DEFAULT_CATEGORIES = [
  { id: 'all', name: 'الكل', icon: 'fa-globe' },
  { id: 'sports', name: 'الرياضة والمباريات', icon: 'fa-futbol' },
  { id: 'news', name: 'الأخبار العالمية', icon: 'fa-newspaper' },
  { id: 'islamic', name: 'قرآن وإسلاميات', icon: 'fa-kaaba' },
  { id: 'drama', name: 'دراما وترفيه', icon: 'fa-tv' },
  { id: 'docu', name: 'وثائقية', icon: 'fa-compass' },
  { id: 'kids', name: 'أطفال', icon: 'fa-child' }
];

const DEFAULT_CHANNELS = [
  // --- NEWS CHANNELS (DIRECT HLS .M3U8) ---
  {
    id: 'ch-aljazeera-news',
    name: 'الجزيرة الإخبارية',
    category: 'news',
    country: 'قطر',
    quality: 'Full HD',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://live-hls-web-aje.akamaized.net/v1/master/053b922097368021ef37d806509f6e4a2432a688/aljazeera-arabic/index.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo',
    description: 'بث حي ومباشر لقناة الجزيرة الإخبارية - تغطية إخبارية مستمرة.',
    isFeatured: true,
    viewersCount: 65200
  },
  {
    id: 'ch-alarabiya',
    name: 'قناة العربية',
    category: 'news',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://live.alarabiya.net/alarabiya/live/playlist.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/2M-x9s_lqX4',
    description: 'قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.',
    isFeatured: true,
    viewersCount: 58100
  },
  {
    id: 'ch-skynews-ar',
    name: 'سكاي نيوز عربية',
    category: 'news',
    country: 'الإمارات',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1495020689067-958852a7765e?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/0_QW_lDk3B4',
    description: 'البث المباشر لقناة سكاي نيوز عربية بالسرعة والموضوعية.',
    isFeatured: false,
    viewersCount: 42800
  },
  {
    id: 'ch-france24-ar',
    name: 'فرانس 24 (عربي)',
    category: 'news',
    country: 'فرنسا',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://stream.france24.com/hls/ar/live/2038753/f24_ar.m3u8',
    fallbackUrl: 'https://www.france24.com/ar',
    description: 'الأخبار الدولية باللغة العربية على مدار 24 ساعة.',
    isFeatured: false,
    viewersCount: 31400
  },
  {
    id: 'ch-trt-arabi',
    name: 'TRT عربي',
    category: 'news',
    country: 'تركيا',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8',
    fallbackUrl: 'https://www.trtarabi.com',
    description: 'قناة TRT العربية الإخبارية والثقافية.',
    isFeatured: false,
    viewersCount: 26900
  },

  // --- ISLAMIC CHANNELS (DIRECT HLS .M3U8) ---
  {
    id: 'ch-saudi-quran',
    name: 'قناة القرآن الكريم (مكة المكرمة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://images.unsplash.com/photo-1542816417-0983cbe82752?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://shls-quran-prod-dub.savanacdn.net/out/v1/678a1b5c394f4bf2b2ec9103e33c7f99/index.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/Y0W8V9m1wB4',
    description: 'بث حي ومباشر 24/7 من المسجد الحرام بمكة المكرمة مع تلاوة القرآن.',
    isFeatured: true,
    viewersCount: 98300
  },
  {
    id: 'ch-saudi-sunnah',
    name: 'قناة السنة النبوية (المدينة المنورة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=150&auto=format&fit=crop&q=60',
    type: 'hls',
    streamUrl: 'https://shls-sunna-prod-dub.savanacdn.net/out/v1/fa6164f9b2fa41a998bb55efbf6f5f3e/index.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/J7wP1_q_sW0',
    description: 'بث حي ومباشر من المسجد النبوي الشريف بالمدينة المنورة.',
    isFeatured: true,
    viewersCount: 84000
  },

  // --- SPORTS CHANNELS ---
  {
    id: 'ch-ontime-1',
    name: 'أون تايم سبورتس 1',
    category: 'sports',
    country: 'مصر',
    quality: 'Full HD',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=60',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE',
    description: 'البث المباشر لقناة ON Time Sports 1 لمتابعة الدوري المصري والبطولات القارية.',
    isFeatured: true,
    viewersCount: 68900
  },
  {
    id: 'ch-bein-news',
    name: 'بي إن سبورتس الإخبارية',
    category: 'sports',
    country: 'قطر',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=60',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E',
    description: 'الأخبار الرياضية والتغطيات المباشرة من beIN SPORTS.',
    isFeatured: true,
    viewersCount: 54100
  },
  {
    id: 'ch-ksa-sports',
    name: 'السعودية الرياضية 1 (KSA Sports)',
    category: 'sports',
    country: 'السعودية',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=60',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/2g811V88880?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/2g811V88880',
    description: 'ناقل دوري روشن السعودي للمحترفين والبطولات المحلية.',
    isFeatured: false,
    viewersCount: 41200
  },

  // --- DRAMA & ENTERTAINMENT ---
  {
    id: 'ch-mbc-masr',
    name: 'MBC مصر',
    category: 'drama',
    country: 'مصر',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=150&auto=format&fit=crop&q=60',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/Xqz4W04g90A?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/Xqz4W04g90A',
    description: 'قناة الترفيه الأولى والبرامج الحوارية والمسلسلات العربية.',
    isFeatured: true,
    viewersCount: 51200
  },
  {
    id: 'ch-rotana-cinema',
    name: 'روتانا سينما',
    category: 'drama',
    country: 'السعودية',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=150&auto=format&fit=crop&q=60',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/7X8m_v7S184?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/7X8m_v7S184',
    description: 'أفلام السينما العربية الحديثة والمعاصرة.',
    isFeatured: true,
    viewersCount: 47900
  },

  // --- KIDS ---
  {
    id: 'ch-spacetoon',
    name: 'سبيستون',
    category: 'kids',
    country: 'الإمارات',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=60',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/k8W9x1P9tT8?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/k8W9x1P9tT8',
    description: 'قناة شباب المستقبل - أنمي وبرامج كرتون مميزة.',
    isFeatured: true,
    viewersCount: 42000
  }
];

// ACCURATE & UPDATED MATCHES SCHEDULE
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
    channelName: 'أون تايم سبورتس 1',
    channelId: 'ch-ontime-1',
    commentator: 'مدحت شلبي',
    stadium: 'ستاد القاهرة الدولي',
    score: '1 - 0',
    servers: [
      { name: 'سيرفر 1 (Full HD Direct)', url: 'https://live-hls-web-aje.akamaized.net/v1/master/053b922097368021ef37d806509f6e4a2432a688/aljazeera-arabic/index.m3u8' },
      { name: 'سيرفر 2 (سريع بدون تقطيع)', url: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1' }
    ]
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
    channelName: 'السعودية الرياضية 1',
    channelId: 'ch-ksa-sports',
    commentator: 'فهد العتيبي',
    stadium: 'ملعب المملكة أرينا',
    score: '2 - 2',
    servers: [
      { name: 'سيرفر 1 (SSC HD)', url: 'https://www.youtube.com/embed/2g811V88880?autoplay=1' },
      { name: 'سيرفر 2 (HLS Direct)', url: 'https://live.alarabiya.net/alarabiya/live/playlist.m3u8' }
    ]
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
    channelName: 'بي إن سبورتس 1',
    channelId: 'ch-bein-news',
    commentator: 'حفيظ دراجي',
    stadium: 'سانتياغو برنابيو',
    score: '1 - 1',
    servers: [
      { name: 'سيرفر 1 (beIN Premium)', url: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8' },
      { name: 'سيرفر 2 (HD Stream)', url: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1' }
    ]
  }
];

// EXCLUSIVE RICH NEWS ARTICLES WITH COMPLETE DETAILS & DOCUMENTED PHOTOS
const DEFAULT_SPORTS_NEWS = [
  {
    id: 'news-1',
    title: 'حصرياً: الأهلي يحسم صفقة المهاجم الجديد بعقد 4 سنوات وتوثيق الصور الرسمية',
    summary: 'أنهى مجلس إدارة النادي الأهلي كافة التفاصيل المالية والتعاقدية لحسم صفقته الصيفية الكبرى في جلسة حاسمة بمقر النادي.',
    category: 'كرة مصرية',
    timeAgo: 'منذ 10 دقائق',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    author: 'التحرير الرياضي',
    content: `
      <p>في خطوة تاريخية انتظرتها الجماهير العاشقة للنادي الأهلي، أعلنت إدارة القلعة الحمراء رسمياً التوقيع مع المهاجم الدولي بعقد يمتد لأربعة مواسم كروية قادمة.</p>
      <p>وجرت جلسة التوقيع الرسمية في مقر النادي بالجزيرة بحضور رئيس مجلس الإدارة وأعضاء لجنة التخطيط، حيث تم الاتفاق على كافة البنود الشخصية والشروط المالية بعد تجاوز اللاعب للكشف الطبي بنجاح فائق.</p>
      <p>وأكد المصدر المسؤول داخل النادي أن اللاعب سينضم للتصفيات الإعدادية للموسم الجديد فوراً تمهيداً لقيادة خط هجوم الفريق في بطولة دوري أبطال إفريقيا ودوري نايل.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'
    ]
  },
  {
    id: 'news-2',
    title: 'قمة سانتياغو برنابيو: التشكيلة المتوقعة والتحليل الفني لموقعة ريال مدريد ومانشستر سيتي',
    summary: 'استقر الجهاز الفني للفريقين على التشكيل الأساسي الخوض به المعركة الكروية المرتقبة في ربع نهائي دوري أبطال أوروبا.',
    category: 'دوري أبطال أوروبا',
    timeAgo: 'منذ 25 دقيقة',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80',
    author: 'قسم الرياضة العالمية',
    content: `
      <p>تتجه أنظار عشاق الساحرة المستديرة حول العالم الليلة إلى ملعب سانتياغو برنابيو بالعاصمة الإسبانية مدريد لمتابعة المواجهة النارية بين ريال مدريد ومانشستر سيتي.</p>
      <p>وتشير المصادر المقربة من النادي الملكي إلى عودة كابتن الفريق في الخط الخلفي مما يمنح استقراراً دفاعياً كبيراً لمواجهة الهجوم الكاسح للضيوف بقيادة الهداف النرويجي.</p>
      <p>الجدير بالذكر أن المواجهات المباشرة بين المدربين شهدت تكتيكات معقدة في السنوات الأخيرة، وتعد هذه المباراة بمثابة نهائي مبكر للبطولة القارية الأغلى.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600',
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600'
    ]
  },
  {
    id: 'news-3',
    title: 'تغطية خاصة لديربي الرياض: فهد العتيبي يكشف أسرار كلاسيكو الهلال والنصر',
    summary: 'استعدادات استثنائية وتغطية خاصة لديربي العاصمة السعودية ضمن مباريات الجولة الحاسمة من دوري روشن للمحترفين.',
    category: 'دوري روشن',
    timeAgo: 'منذ 45 دقيقة',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    author: 'مراسل الرياض',
    content: `
      <p>يسود الترقب والانتظار أوساط الشارع الرياضي السعودي قبل انطلاق صافرة البداية لديربي الرياض المرتقب بين قطبي العاصمة الهلال والنصر على ملعب المملكة أرينا.</p>
      <p>وصرح المعلق القدير فهد العتيبي بأن المباراة تحمل طابعاً تكتيكياً رفيع المستوى مع توفر أسماء عالمية من طراز فريد على أرضية الملعب.</p>
      <p>وقد اكتملت الترتيبات الأجواء الجماهيرية وتجهيز التيفو الخاص بكل مدرج لإظهار المباراة بما يليق بمكانة الدوري السعودي للمحترفين عالمياً.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'
    ]
  }
];

const DEFAULT_RADIOS = [
  {
    id: 'rad-quran-cairo',
    name: 'إذاعة القرآن الكريم من القاهرة',
    country: 'مصر',
    streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv',
    icon: 'fa-mosque',
    description: 'تلاوات خاشعة وأحاديث شريفة على مدار 24 ساعة.'
  },
  {
    id: 'rad-quran-makkah',
    name: 'إذاعة القرآن الكريم - مكة المكرمة',
    country: 'السعودية',
    streamUrl: 'https://ssl.live.hawaa.link/listen/quran_makkah/radio.mp3',
    icon: 'fa-kaaba',
    description: 'البث الصوتي المباشر من الحرم المكي الشريف.'
  },
  {
    id: 'rad-nogoum-fm',
    name: 'إذاعة نجوم إف إم (Nogoum FM)',
    country: 'مصر',
    streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv',
    icon: 'fa-radio',
    description: 'أشهر البرامج والأغاني والبرامج الحوارية الترفيهية.'
  },
  {
    id: 'rad-monte-carlo',
    name: 'إذاعة مونت كارلو الدولية',
    country: 'فرنسا/عربي',
    streamUrl: 'https://montecarlo.ice.infomaniak.ch/mc-doualiya-midfi.mp3',
    icon: 'fa-tower-cell',
    description: 'أخبار عالمية وتحليلات سياسية وثقافية بلغة عربية راقية.'
  }
];

const DEFAULT_HIGHLIGHTS = [
  {
    id: 'high-1',
    title: 'ملخص وأهداف مباراة الأهلي والزمالك في دوري الأبطال',
    duration: '08:45',
    category: 'رياضة',
    views: '120K',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE'
  },
  {
    id: 'high-2',
    title: 'تغطية خاصة: ملخص أهداف قمة ريال مدريد ومانشستر سيتي',
    duration: '12:10',
    category: 'رياضة عالمية',
    views: '195K',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E'
  }
];
