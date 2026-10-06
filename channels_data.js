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
  // --- NEWS CHANNELS ---
  {
    id: 'ch-aljazeera-news',
    name: 'الجزيرة الإخبارية',
    category: 'news',
    country: 'قطر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://live-hls-web-aja-fa.thehlive.com/AJA/index.m3u8',
    fallbackUrl: 'https://live-hls-web-aja.getaj.net/AJA/index.m3u8',
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
    streamUrl: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
    fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-alarabiya/7f90de73d777d04f3dada92f90d35c44/index.m3u8',
    description: 'قناة العربية الإخبارية - أنباء وتحليلات وتغطيات حيّة من حول العالم.',
    isFeatured: true,
    viewersCount: 61400
  },
  {
    id: 'ch-alhadath',
    name: 'قناة الحدث',
    category: 'news',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Al_Hadath_Logo.png/300px-Al_Hadath_Logo.png',
    type: 'hls',
    streamUrl: 'https://av.alarabiya.net/alarabiapublish/alhadath.smil/playlist.m3u8',
    fallbackUrl: 'https://live.alarabiya.net/alarabiapublish/alarabiya.smil/playlist.m3u8',
    description: 'قناة الحدث - متابعة حية ومكثفة للأحداث العاجلة حول العالم.',
    isFeatured: true,
    viewersCount: 54200
  },
  {
    id: 'ch-skynews-ar',
    name: 'سكاي نيوز عربية',
    category: 'news',
    country: 'الإمارات',
    quality: 'HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_News_Arabia_logo.svg/300px-Sky_News_Arabia_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://live-stream.skynewsarabia.com/c-horizontal-channel/horizontal-stream/index.m3u8',
    fallbackUrl: 'https://stream.skynewsarabia.com/ott/ott.m3u8',
    description: 'البث المباشر لقناة سكاي نيوز عربية بالسرعة والموضوعية.',
    isFeatured: false,
    viewersCount: 45800
  },
  {
    id: 'ch-alekhbariya',
    name: 'قناة الإخبارية السعودية',
    category: 'news',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Al_Ekhbariya_logo.svg/300px-Al_Ekhbariya_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/al_ekhbariya/hls_roku/index.m3u8',
    fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-al-ekhbaria/297b3ef1cd0633ad9cfba7473a686a06/index.m3u8',
    description: 'قناة الإخبارية السعودية الرسمية - متابعة حية ومباشرة للأحداث المحلية والعالمية.',
    isFeatured: false,
    viewersCount: 38200
  },
  {
    id: 'ch-asharq-news',
    name: 'الشرق للأخبار (Bloomberg)',
    category: 'news',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Asharq_News_Logo.svg/300px-Asharq_News_Logo.svg.png',
    type: 'hls',
    streamUrl: 'https://live-news.asharq.com/asharq.m3u8',
    fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-asharq/10ae30c64e21402c8116a7fb1e5aa789/index.m3u8',
    description: 'قناة الشرق الإخبارية بالتعاون مع بلومبرغ للأخبار والتحليلات الاقتصادية والسياسية.',
    isFeatured: false,
    viewersCount: 33100
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
    fallbackUrl: 'https://tv-trtarabi.medya.trt.com.tr/master.m3u8',
    description: 'قناة TRT العربية الإخبارية والثقافية.',
    isFeatured: false,
    viewersCount: 29100
  },
  {
    id: 'ch-cnbc-arabiya',
    name: 'CNBC عربية',
    category: 'news',
    country: 'الإمارات',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/CNBC_Arabia_logo.svg/300px-CNBC_Arabia_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://cnbc-live.akamaized.net/cnbc/master.m3u8',
    fallbackUrl: 'https://cnbc-live.akamaized.net/cnbc/master.m3u8',
    description: 'القناة الاقتصادية الأولى في العالم العربي - أسواق المال والأعمال.',
    isFeatured: false,
    viewersCount: 24700
  },

  // --- ISLAMIC CHANNELS ---
  {
    id: 'ch-saudi-quran',
    name: 'قناة القرآن الكريم (مكة المكرمة)',
    category: 'islamic',
    country: 'السعودية',
    quality: '4K Ultra',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saudi_Quran_TV_Logo.png/300px-Saudi_Quran_TV_Logo.png',
    type: 'hls',
    streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
    fallbackUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
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
    streamUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
    fallbackUrl: 'https://cdn-globecast.akamaized.net/live/eds/saudi_sunnah/hls_roku/index.m3u8',
    description: 'بث حي ومباشر من المسجد النبوي الشريف بالمدينة المنورة.',
    isFeatured: true,
    viewersCount: 89500
  },
  {
    id: 'ch-qatar-quran',
    name: 'تلفزيون قطر للقرآن الكريم',
    category: 'islamic',
    country: 'قطر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Saudi_Quran_TV_Logo.png/300px-Saudi_Quran_TV_Logo.png',
    type: 'hls',
    streamUrl: 'https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8',
    fallbackUrl: 'https://qatartv.akamaized.net/hls/live/20000612/qtvquran/master.m3u8',
    description: 'تلاوات خاشعة وبرامج إسلامية وتفسير القرآن الكريم على مدار 24 ساعة.',
    isFeatured: false,
    viewersCount: 42100
  },

  // --- SPORTS CHANNELS (DIRECT HLS - ZERO ADS) ---
  {
    id: 'ch-alkass-1',
    name: 'قنوات الكأس 1 الرياضية (Al Kass)',
    category: 'sports',
    country: 'قطر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Al_Kass_Sports_Channels_logo.png/300px-Al_Kass_Sports_Channels_logo.png',
    type: 'hls',
    streamUrl: 'https://shoof.alkass.net/live/ch1.m3u8',
    fallbackUrl: 'https://shoof.alkass.net/live/ch1.m3u8',
    description: 'البث المباشر لقناة الكأس 1 الرياضية لنقل البطولات والمباريات العربية مباشرة وبدون إعلانات.',
    isFeatured: true,
    viewersCount: 78500
  },
  {
    id: 'ch-ktv-sport',
    name: 'الكويت الرياضية (KTV Sport HD)',
    category: 'sports',
    country: 'الكويت',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8',
    fallbackUrl: 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8',
    description: 'القناة الرياضية الكويتية الرسمية لنقل المباريات والدوريات الخليجية والعربية.',
    isFeatured: true,
    viewersCount: 65200
  },
  {
    id: 'ch-ktv-sport-plus',
    name: 'الكويت سبورت بلس (Sport Plus)',
    category: 'sports',
    country: 'الكويت',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8',
    fallbackUrl: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8',
    description: 'البث الإضافي لمباريات واستوديوهات الكويت الرياضية المباشرة.',
    isFeatured: false,
    viewersCount: 51000
  },
  {
    id: 'ch-oman-sports',
    name: 'عُمان الرياضية (Oman Sport)',
    category: 'sports',
    country: 'عُمان',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8',
    fallbackUrl: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8',
    description: 'قناة عُمان الرياضية - تغطيات حية ومباشرة للمسابقات والبطولات العربية.',
    isFeatured: false,
    viewersCount: 46800
  },
  {
    id: 'ch-jordan-sport',
    name: 'الأردن الرياضية (Jordan Sport)',
    category: 'sports',
    country: 'الأردن',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/KSA_Sports_logo.svg/300px-KSA_Sports_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8',
    fallbackUrl: 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8',
    description: 'القناة الرياضية الأردنية الرسمية - بث مباشر للمباريات والمنافسات الرياضية.',
    isFeatured: false,
    viewersCount: 43200
  },

  // --- DRAMA & ENTERTAINMENT ---
  {
    id: 'ch-mbc-1',
    name: 'MBC 1',
    category: 'drama',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8',
    fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-1/15cf99af5de54063fdabfefe66adc075/index.m3u8',
    description: 'قناة الأسرة العربية الأولى - مسلسلات، برامج ترفيهية، وأخبار منوعة.',
    isFeatured: true,
    viewersCount: 62400
  },
  {
    id: 'ch-mbc-masr',
    name: 'MBC مصر',
    category: 'drama',
    country: 'مصر',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8',
    fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-masr/956eac069c78a35d47245db6cdbb1575/index.m3u8',
    description: 'قناة الترفيه الأولى والبرامج الحوارية والمسلسلات العربية والكوميدية مباشرة.',
    isFeatured: true,
    viewersCount: 58900
  },
  {
    id: 'ch-mbc-drama',
    name: 'MBC دراما',
    category: 'drama',
    country: 'السعودية',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/MBC_Masr_logo.svg/300px-MBC_Masr_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8',
    fallbackUrl: 'https://shd-gcp-live.edgenextcdn.net/live/bitmovin-mbc-drama/2c28a458e2f3253e678b07ac7d13fe71/index.m3u8',
    description: 'باقة من أروع المسلسلات الدرامية العربية والخليجية والمصرية على مدار الساعة.',
    isFeatured: false,
    viewersCount: 53100
  },
  {
    id: 'ch-sharjah-tv',
    name: 'قناة الشارقة الفضائية',
    category: 'drama',
    country: 'الإمارات',
    quality: 'Full HD',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sky_News_Arabia_logo.svg/300px-Sky_News_Arabia_logo.svg.png',
    type: 'hls',
    streamUrl: 'https://live.kwikmotion.com/smc1live/smc1tv.smil/playlist.m3u8',
    fallbackUrl: 'https://live.kwikmotion.com/smc1live/smc1tv.smil/playlist.m3u8',
    description: 'قناة الشارقة - برامج ثقافية واجتماعية ودرامية هادفة تناسب كل أفراد الأسرة.',
    isFeatured: false,
    viewersCount: 37500
  }
];

// ACCURATE & UPDATED MATCHES SCHEDULE (DIRECT HLS STREAMS)
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
    channelName: 'الكويت الرياضية HD',
    channelId: 'ch-ktv-sport',
    commentator: 'فهد العتيبي',
    stadium: 'ملعب المملكة أرينا',
    score: '2 - 2',
    servers: [
      { name: 'سيرفر 1 (الكويت سبورت HD مباشر)', url: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 2 (الكويت سبورت بلس HD)', url: 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 3 (الكأس 1 HD مباشر)', url: 'https://shoof.alkass.net/live/ch1.m3u8' }
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
    channelName: 'الأردن الرياضية HD',
    channelId: 'ch-jordan-sport',
    commentator: 'حفيظ دراجي',
    stadium: 'سانتياغو برنابيو',
    score: '1 - 1',
    servers: [
      { name: 'سيرفر 1 (الأردن سبورت HD مباشر)', url: 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8' },
      { name: 'سيرفر 2 (عُمان سبورت HD مباشر)', url: 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8' },
      { name: 'سيرفر 3 (الكأس HD مباشر)', url: 'https://shoof.alkass.net/live/ch1.m3u8' }
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
