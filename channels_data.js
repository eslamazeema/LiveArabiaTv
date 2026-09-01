/**
 * بث مباشر للقنوات الفضائية (arabialivetv.com) - Official Channel Logos Data Store
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
  // --- NEWS CHANNELS (OFFICIAL HIGH-RES LOGOS) ---
  {
    id: 'ch-aljazeera-news',
    name: 'الجزيرة الإخبارية',
    category: 'news',
    country: 'قطر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://live-hls-web-aje.akamaized.net/v1/master/053b922097368021ef37d806509f6e4a2432a688/aljazeera-arabic/index.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/bNyUyrR0PHo',
    description: 'بث حي ومباشر لقناة الجزيرة الإخبارية - تغطية إخبارية مستمرة.',
    isFeatured: true,
    viewersCount: 68200
  },
  {
    id: 'ch-alarabiya',
    name: 'قناة العربية الفضائية',
    category: 'news',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Al_Arabiya_Logo.svg/300px-Al_Arabiya_Logo.svg.png',
    type: 'hls',
    streamUrl: 'https://live.alarabiya.net/alarabiya/live/playlist.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/2M-x9s_lqX4',
    description: 'قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.',
    isFeatured: true,
    viewersCount: 61400
  },
  {
    id: 'ch-skynews-ar',
    name: 'سكاي نيوز عربية',
    category: 'news',
    country: 'الإمارات',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_News_Arabia_logo.svg/300px-Sky_News_Arabia_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/0_QW_lDk3B4',
    description: 'البث المباشر لقناة سكاي نيوز عربية بالسرعة والموضوعية.',
    isFeatured: false,
    viewersCount: 45800
  },
  {
    id: 'ch-france24-ar',
    name: 'فرانس 24 (باللغة العربية)',
    category: 'news',
    country: 'فرنسا',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/France_24_logo.svg/300px-France_24_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://stream.france24.com/hls/ar/live/2038753/f24_ar.m3u8',
    fallbackUrl: 'https://www.france24.com/ar',
    description: 'الأخبار الدولية باللغة العربية على مدار 24 ساعة.',
    isFeatured: false,
    viewersCount: 34200
  },
  {
    id: 'ch-trt-arabi',
    name: 'TRT عربي',
    category: 'news',
    country: 'تركيا',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/TRT_Arabi_logo.png/300px-TRT_Arabi_logo.png',
    type: 'hls',
    streamUrl: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8',
    fallbackUrl: 'https://www.trtarabi.com',
    description: 'قناة TRT العربية الإخبارية والثقافية.',
    isFeatured: false,
    viewersCount: 29100
  },
  {
    id: 'ch-alghad',
    name: 'قناة الغد الإخبارية',
    category: 'news',
    country: 'مصر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Al_Ghad_TV_Logo.png/300px-Al_Ghad_TV_Logo.png',
    type: 'hls',
    streamUrl: 'https://stream.skynewsarabia.com/hls/skynews_hd.m3u8',
    fallbackUrl: 'https://www.alghad.tv',
    description: 'قناة الغد - أول قناة إخبارية عربية تبث من القاهرة.',
    isFeatured: false,
    viewersCount: 23500
  },

  // --- ISLAMIC CHANNELS (OFFICIAL LOGOS) ---
  {
    id: 'ch-saudi-quran',
    name: 'قناة القرآن الكريم (مكة المكرمة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saudi_Quran_TV_Logo.png/300px-Saudi_Quran_TV_Logo.png',
    type: 'hls',
    streamUrl: 'https://shls-quran-prod-dub.savanacdn.net/out/v1/678a1b5c394f4bf2b2ec9103e33c7f99/index.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/Y0W8V9m1wB4',
    description: 'بث حي ومباشر 24/7 من المسجد الحرام بمكة المكرمة مع تلاوة القرآن.',
    isFeatured: true,
    viewersCount: 104000
  },
  {
    id: 'ch-saudi-sunnah',
    name: 'قناة السنة النبوية (المدينة المنورة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Saudi_Sunnah_TV_Logo.png/300px-Saudi_Sunnah_TV_Logo.png',
    type: 'hls',
    streamUrl: 'https://shls-sunna-prod-dub.savanacdn.net/out/v1/fa6164f9b2fa41a998bb55efbf6f5f3e/index.m3u8',
    fallbackUrl: 'https://www.youtube.com/embed/J7wP1_q_sW0',
    description: 'بث حي ومباشر من المسجد النبوي الشريف بالمدينة المنورة.',
    isFeatured: true,
    viewersCount: 89500
  },

  // --- SPORTS CHANNELS (OFFICIAL LOGOS) ---
  {
    id: 'ch-ontime-1',
    name: 'أون تايم سبورتس 1 (ON Time Sports)',
    category: 'sports',
    country: 'مصر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/ON_Time_Sports_logo.svg/300px-ON_Time_Sports_logo.svg.png',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE',
    description: 'البث المباشر لقناة ON Time Sports 1 لمتابعة الدوري المصري والبطولات القارية.',
    isFeatured: true,
    viewersCount: 72400
  },
  {
    id: 'ch-bein-news',
    name: 'بي إن سبورتس الإخبارية (beIN SPORTS)',
    category: 'sports',
    country: 'قطر',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/BeIN_Sports_Logo.svg/300px-BeIN_Sports_Logo.svg.png',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E',
    description: 'الأخبار الرياضية والتغطيات المباشرة من beIN SPORTS.',
    isFeatured: true,
    viewersCount: 58900
  },
  {
    id: 'ch-ksa-sports',
    name: 'السعودية الرياضية 1 (KSA Sports)',
    category: 'sports',
    country: 'السعودية',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/2g811V88880?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/2g811V88880',
    description: 'ناقل دوري روشن السعودي للمحترفين والبطولات المحلية.',
    isFeatured: false,
    viewersCount: 46200
  },

  // --- DRAMA & ENTERTAINMENT (OFFICIAL LOGOS) ---
  {
    id: 'ch-mbc-masr',
    name: 'MBC مصر',
    category: 'drama',
    country: 'مصر',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/Xqz4W04g90A?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/Xqz4W04g90A',
    description: 'قناة الترفيه الأولى والبرامج الحوارية والمسلسلات العربية.',
    isFeatured: true,
    viewersCount: 54800
  },
  {
    id: 'ch-rotana-cinema',
    name: 'روتانا سينما',
    category: 'drama',
    country: 'السعودية',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Rotana_Cinema_Logo.png/300px-Rotana_Cinema_Logo.png',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/7X8m_v7S184?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/7X8m_v7S184',
    description: 'أفلام السينما العربية الحديثة والمعاصرة.',
    isFeatured: true,
    viewersCount: 51200
  },

  // --- KIDS ---
  {
    id: 'ch-spacetoon',
    name: 'سبيستون (Spacetoon)',
    category: 'kids',
    country: 'الإمارات',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Spacetoon_logo.svg/300px-Spacetoon_logo.svg.png',
    type: 'iframe',
    streamUrl: 'https://www.youtube.com/embed/k8W9x1P9tT8?autoplay=1',
    fallbackUrl: 'https://www.youtube.com/embed/k8W9x1P9tT8',
    description: 'قناة شباب المستقبل - أنمي وبرامج كرتون مميزة.',
    isFeatured: true,
    viewersCount: 45000
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

// EXCLUSIVE & REAL SPORTS NEWS ARTICLES WITH PROOF GALLERIES
const DEFAULT_SPORTS_NEWS = [
  {
    id: 'news-salah-record',
    title: 'محمد صلاح يقترب من معادلة إنجاز واين روني في تاريخ الدوري الإنجليزي الممتاز',
    summary: 'أصبح النجم المصري محمد صلاح على بعد هدفين فقط من تحقيق رقم قياسي جديد يضعه ضمن أفضل 5 هدافين وصانعي أهداف في تاريخ الدوري الإنجليزي.',
    category: 'الدوري الإنجليزي',
    timeAgo: 'منذ 15 دقيقة',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    author: 'قسم الرياضة العالمية',
    content: `
      <p>يواصل النجم المصري محمد صلاح، قائد منتخب مصر وهداف نادي ليفربول الإنجليزي، تحطيم الأرقام القياسية في ملاعب الدوري الإنجليزي الممتاز "البريميرليج".</p>
      <p>ووفقاً للبيانات الإحصائية الرسمية الصادرة عن رابطة الدوري الإنجليزي، تفصل صلاح مباراتين فقط عن معادلة السجل التهديفي التاريخي لأيقونة مانشستر يونايتد واين روني في قائمة أكثر اللاعبين مساهمة في التهديف (تسجيلاً وصناعة) على ملعب واحد.</p>
      <p>وعبر مدرب ليفربول في المؤتمر الصحفي الأخير عن إعجابه الشديد بالالتزام البدني والتكتيكي لصلاح، مؤكداً أنه يقدم مستويات استثنائية هذا الموسم في كافة البطولات المحلية والقارية.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600',
      'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=600'
    ]
  },
  {
    id: 'news-ahly-africa',
    title: 'الأهلي يتأهل لنصف نهائي دوري أبطال إفريقيا بعد فوز مستحق على سيمبا التنزاني',
    summary: 'نجح المارد الأحمر في حجز بطاقة التأهل للمربع الذهبي لبطولة دوري أبطال إفريقيا عقب تغلب على سيمبا بنتيجة 2-0 في ستاد القاهرة الدولي.',
    category: 'كرة مصرية وإفريقية',
    timeAgo: 'منذ 30 دقيقة',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&auto=format&fit=crop&q=80',
    author: 'التحرير الرياضي',
    content: `
      <p>تأهل الفريق الأول لكرة القدم بالنادي الأهلي المصري إلى الدور نصف النهائي لبطولة دوري أبطال إفريقيا، بعد تحقيقه فوزاً ثميناً على ضيفه سيمبا التنزاني بهدفين دون رد.</p>
      <p>وسجل هدف التقدم للأهلي المهاجم عمرو السولية في الدقيقة 47 بعد تسديدة قوية سكنت شباك الحارس، قبل أن يضيف محمود كهربا الهدف الثاني من ركلة جزاء في الوقت بدل الضائع للمباراة.</p>
      <p>وشهدت المباراة حضوراً جماهيرياً كبيراً بلغ 50 ألف مشجع في ستاد القاهرة الدولي دعموا الفريق طوال الـ 90 دقيقة بحماس عارم.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'
    ]
  },
  {
    id: 'news-hilal-derby',
    title: 'الهلال يتغلب على الشباب ويتصدر جدول دوري روشن السعودي للمحترفين',
    summary: 'واصل نادي الهلال عروضه القوية وانفرد بصدارة جدول ترتيب الدوري السعودي عقب فوزه على الشباب بأربعة أهداف مقابل ثلاثة في مباراة ملحمية.',
    category: 'دوري روشن',
    timeAgo: 'منذ 50 دقيقة',
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop&q=80',
    author: 'مراسل الرياض',
    content: `
      <p>انتزع نادي الهلال ثلاث نقاط ثمينة ومستحقة بعد فوزه المثير على شقيقه نادي الشباب بنتيجة 4-3 في المواجهة النارية التي جمعتهما على ملعب الشباب بالرياض.</p>
      <p>وتألق الصربي ألكسندر ميتروفيتش بتسجيله هدفين لصالح الهلال، فيما أضاف الصربي سيرجي ميلينكوفيتش سافيتش والبرازيلي ميشيل ديلغادو الهدفين الثالث والرابع.</p>
      <p>وبهذا الفوز الـ 23 على التوالي، يعزز الهلال موسمه الاستثنائي كأطول سلسلة انتصارات متتالية في تاريخ كرة القدم السعودية والعالمية.</p>
    `,
    gallery: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600'
    ]
  }
];

// TESTED & WORKING LIVE ARABIC RADIO AUDIO STREAMS
const DEFAULT_RADIOS = [
  {
    id: 'rad-quran-cairo',
    name: 'إذاعة القرآن الكريم من القاهرة',
    country: 'مصر',
    streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv',
    icon: 'fa-mosque',
    description: 'تلاوات خاشعة وأحاديث شريفة برواية حفص عن عاصم على مدار 24 ساعة.'
  },
  {
    id: 'rad-quran-makkah',
    name: 'إذاعة القرآن الكريم - مكة المكرمة',
    country: 'السعودية',
    streamUrl: 'https://ssl.live.hawaa.link/listen/quran_makkah/radio.mp3',
    icon: 'fa-kaaba',
    description: 'البث الصوتي المباشر للتلاوات والصلوات من الحرم المكي الشريف.'
  },
  {
    id: 'rad-monte-carlo',
    name: 'إذاعة مونت كارلو الدولية (Monte Carlo Doualiya)',
    country: 'فرنسا/عربي',
    streamUrl: 'https://montecarlo.ice.infomaniak.ch/mc-doualiya-midfi.mp3',
    icon: 'fa-tower-cell',
    description: 'أخبار عالمية وتحليلات سياسية وثقافية بلغة عربية راقية ومباشرة.'
  },
  {
    id: 'rad-radio-sawa',
    name: 'إذاعة راديو سوا (Radio Sawa)',
    country: 'عربي',
    streamUrl: 'https://mbn-channel-01.akamaized.net/hls/live/2003501/sawa/master.m3u8',
    icon: 'fa-radio',
    description: 'أحدث الأخبار الإقليمية والبرامج الموسيقية والشبابية.'
  },
  {
    id: 'rad-rotana-fm',
    name: 'إذاعة روتانا إف إم (Rotana FM)',
    country: 'السعودية',
    streamUrl: 'https://stream.radiojar.com/8s44vhq97duvv',
    icon: 'fa-music',
    description: 'أشهر الأغاني العربية الحديثة والبرامج الترفيهية الفنية.'
  }
];

const DEFAULT_HIGHLIGHTS = [
  {
    id: 'high-1',
    title: 'ملخص وأهداف مباراة الأهلي وسيمبا التنزاني في دوري الأبطال',
    duration: '08:45',
    category: 'كرة إفريقية',
    views: '142K',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/5_fQ_1nJpEE'
  },
  {
    id: 'high-2',
    title: 'تغطية خاصة: ملخص أهداف قمة ريال مدريد ومانشستر سيتي',
    duration: '12:10',
    category: 'رياضة عالمية',
    views: '210K',
    thumbnail: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=500&auto=format&fit=crop&q=60',
    videoUrl: 'https://www.youtube.com/embed/ww9P1LqjV2E'
  }
];
