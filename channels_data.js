/**
 * Arabia Live TV (arabialivetv.com) Initial Data Store
 * Contains Categories, Live Channels, Match Center Fixtures, Sports News, Live Radios, and Video Highlights.
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
  // --- SPORTS CHANNELS ---
  {
    id: 'ch-ontime-1',
    name: 'أون تايم سبورتس 1',
    category: 'sports',
    country: 'مصر',
    quality: 'Full HD',
    logo: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE',
    description: 'البث المباشر لقناة ON Time Sports لنقل الدوري المصري والبطولات الإفريقية.',
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
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E',
    description: 'الأخبار الرياضية والتغطيات الحصرية لأهم الدوريات العالمية.',
    isFeatured: true,
    viewersCount: 54100
  },
  {
    id: 'ch-ksa-sports',
    name: 'السعودية الرياضية 1',
    category: 'sports',
    country: 'السعودية',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/2g811V88880?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/2g811V88880',
    description: 'ناقل دوري روشن السعودي للمحترفين والبطولات المحلية.',
    isFeatured: false,
    viewersCount: 41200
  },
  {
    id: 'ch-alkass',
    name: 'قنوات الكأس الرياضية',
    category: 'sports',
    country: 'قطر',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/1_t9d_l8898?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/1_t9d_l8898',
    description: 'تغطية البطولات الآسيوية والخليجية والأنشطة الرياضية.',
    isFeatured: false,
    viewersCount: 28700
  },

  // --- NEWS CHANNELS ---
  {
    id: 'ch-aljazeera-news',
    name: 'الجزيرة الإخبارية',
    category: 'news',
    country: 'قطر',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo?autoplay=1&mute=0',
    fallbackUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo',
    description: 'بث مباشر لقناة الجزيرة الإخبارية - تغطية إخبارية على مدار 24 ساعة.',
    isFeatured: true,
    viewersCount: 45200
  },
  {
    id: 'ch-alarabiya',
    name: 'قناة العربية',
    category: 'news',
    country: 'السعودية',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/live_stream?channel=UCkfdqY4b-_MH7Qz9N6U3dWA&autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/2M-x9s_lqX4',
    description: 'قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.',
    isFeatured: true,
    viewersCount: 38100
  },

  // --- ISLAMIC CHANNELS ---
  {
    id: 'ch-saudi-quran',
    name: 'قناة القرآن الكريم (مكة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://images.unsplash.com/photo-1542816417-0983cbe82752?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/Y0W8V9m1wB4?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/Y0W8V9m1wB4',
    description: 'بث حي ومباشر من المسجد الحرام بمكة المكرمة 24/7 مع تلاوة القرآن.',
    isFeatured: true,
    viewersCount: 92300
  },
  {
    id: 'ch-saudi-sunnah',
    name: 'قناة السنة النبوية (المدينة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/J7wP1_q_sW0?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/J7wP1_q_sW0',
    description: 'بث مباشر من المسجد النبوي الشريف بالمدينة المنورة.',
    isFeatured: true,
    viewersCount: 71000
  },

  // --- DRAMA & ENTERTAINMENT ---
  {
    id: 'ch-mbc-masr',
    name: 'MBC مصر',
    category: 'drama',
    country: 'مصر',
    quality: 'HD',
    logo: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=150&auto=format&fit=crop&q=60',
    type: 'youtube',
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
    type: 'youtube',
    streamUrl: 'https://www.youtube.com/embed/7X8m_v7S184?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/7X8m_v7S184',
    description: 'أفلام السينما العربية الحديثة والمعاصرة.',
    isFeatured: true,
    viewersCount: 47900
  }
];

const DEFAULT_MATCHES = [
  {
    id: 'match-1',
    league: 'دوري أبطال إفريقيا',
    leagueFlag: '🏆',
    homeTeam: 'الأهلي المصري',
    homeLogo: '🔴',
    awayTeam: 'صن داونز',
    awayLogo: '🟡',
    time: '21:00',
    date: 'اليوم',
    status: 'live', // 'live', 'upcoming', 'ended'
    channelName: 'أون تايم سبورتس 1',
    channelId: 'ch-ontime-1',
    commentator: 'عصام الشوالي',
    stadium: 'ستاد القاهرة الدولي',
    score: '1 - 0',
    servers: [
      { name: 'سيرفر 1 (Full HD)', url: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1' },
      { name: 'سيرفر 2 (سريع بدون تقطيع)', url: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1' }
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
      { name: 'سيرفر 2 (متعدد الجودات)', url: 'https://www.youtube.com/embed/1_t9d_l8898?autoplay=1' }
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
    date: 'غداً',
    status: 'upcoming',
    channelName: 'بي إن سبورتس الإخبارية',
    channelId: 'ch-bein-news',
    commentator: 'حفيظ دراجي',
    stadium: 'سانتياغو برنابيو',
    score: 'vs',
    servers: [
      { name: 'سيرفر 1 (beIN Premium)', url: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1' }
    ]
  },
  {
    id: 'match-4',
    league: 'الدوري الإنجليزي الممتاز',
    leagueFlag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    homeTeam: 'ليفربول',
    homeLogo: '🔴',
    awayTeam: 'أرسنال',
    awayLogo: '🔴',
    time: '18:30',
    date: 'غداً',
    status: 'upcoming',
    channelName: 'بي إن سبورتس 1',
    channelId: 'ch-bein-news',
    commentator: 'خليل البلوشي',
    stadium: 'أنفيلد',
    score: 'vs',
    servers: [
      { name: 'سيرفر 1 (English HD)', url: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1' }
    ]
  }
];

const DEFAULT_SPORTS_NEWS = [
  {
    id: 'news-1',
    title: 'الأهلي يتوصل لاتفاق نهائي لتجديد عقد نجم الفريق حتى 2028',
    summary: 'أنهى مجلس إدارة النادي الأهلي كافة التفاصيل المالية والتعاقدية لحسم التجديد في جلسة حاسمة مع الوكيل.',
    category: 'كرة مصرية',
    timeAgo: 'منذ 15 دقيقة',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    author: 'التحرير الرياضي'
  },
  {
    id: 'news-2',
    title: 'تشكيلة الهلال والنصر المتوقعة في ديربي الرياض المرتقب الليلة',
    summary: 'استقر الجهاز الفني للفريقين على التشكيل الأساسي الذي يخوض به المواجهة الحاسمة في الدوري السعودي.',
    category: 'دوري روشن',
    timeAgo: 'منذ 40 دقيقة',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=500&auto=format&fit=crop&q=60',
    author: 'مراسل الرياض'
  },
  {
    id: 'news-3',
    title: 'ريال مدريد يعلن قائمة الفريق لمواجهة مانشستر سيتي في أبطال أوروبا',
    summary: 'شهدت القائمة عودة الكابيتانو بعد التعافي التام من الإصابة وسط حماس جماهيري في البيرنابيو.',
    category: 'دوري أبطال أوروبا',
    timeAgo: 'منذ ساعة',
    image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    author: 'قسم الرياضة العالمية'
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
    streamUrl: 'https://stream.zeno.fm/4gq8z7178hruv',
    icon: 'fa-kaaba',
    description: 'البث الصوتي المباشر من الحرم المكي.'
  },
  {
    id: 'rad-nogoum-fm',
    name: 'إذاعة نجوم إف إم (Nogoum FM)',
    country: 'مصر',
    streamUrl: 'https://stream.radiojar.com/4gq8z7178hruv',
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
    title: 'ملخص وأهداف مباراة الأهلي في دوري الأبطال',
    duration: '08:45',
    category: 'رياضة',
    views: '120K',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE'
  },
  {
    id: 'high-2',
    title: 'تغطية خاصة: آخر تطورات الأحداث الإقليمية والعالمية',
    duration: '15:20',
    category: 'أخبار',
    views: '85K',
    thumbnail: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo'
  }
];
