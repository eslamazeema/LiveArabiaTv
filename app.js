// Immediately strip any #hashtag or /index.html upon script execution to keep address bar clean
(function cleanUrlImmediately() {
  try {
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      let cleanPath = window.location.pathname;
      if (cleanPath.endsWith('/index.html')) {
        cleanPath = cleanPath.slice(0, -10) || '/';
      }
      if (window.location.hash || window.location.pathname.endsWith('/index.html')) {
        window.history.replaceState(null, '', cleanPath + window.location.search);
      }
    }
  } catch (e) {}
})();

document.addEventListener('DOMContentLoaded', async () => {
  /**
   * Arabia Live TV v2.5 — Unified API Data Layer
   * All data loaded from server-side SQLite database via REST API.
   * Works identically across ALL browsers, devices, and tabs.
   */

  // API base URL (auto-detected from current host)
  const API_BASE = window.location.origin;

  // In-memory data cache (refreshed on load)
  let channels = [];
  let matches = [];
  let sportsNews = [];
  let radios = [];

  // Certificates & highlights remain static (not DB-managed)
  let highlights = (typeof DEFAULT_HIGHLIGHTS !== 'undefined') ? DEFAULT_HIGHLIGHTS : [];

  // Favorites stored in localStorage (per-browser preference, not shared data)
  let favorites = JSON.parse(localStorage.getItem('altv_favorites')) || [];
  let radioFavorites = JSON.parse(localStorage.getItem('altv_radio_favorites')) || [];

  // Categories remain static
  let categories = (typeof DEFAULT_CATEGORIES !== 'undefined') ? DEFAULT_CATEGORIES : [
    { id: 'all', name: 'الكل', icon: 'fa-globe' },
    { id: 'sports', name: 'الرياضة والمباريات', icon: 'fa-futbol' },
    { id: 'news', name: 'الأخبار العالمية', icon: 'fa-newspaper' },
    { id: 'islamic', name: 'قرآن وإسلاميات', icon: 'fa-kaaba' },
    { id: 'drama', name: 'دراما وترفيه', icon: 'fa-tv' },
    { id: 'docu', name: 'وثائقية', icon: 'fa-compass' },
    { id: 'kids', name: 'أطفال', icon: 'fa-child' }
  ];

  /**
   * Fetch all data from the server API
   */
  async function fetchAllData() {
    try {
      const [chRes, matchRes, newsRes, radRes] = await Promise.all([
        fetch(`${API_BASE}/api/channels`),
        fetch(`${API_BASE}/api/matches`),
        fetch(`${API_BASE}/api/news`),
        fetch(`${API_BASE}/api/radios`)
      ]);

      const [chData, matchData, newsData, radData] = await Promise.all([
        chRes.json(), matchRes.json(), newsRes.json(), radRes.json()
      ]);

      if (chData.success) channels = chData.data;
      if (matchData.success) matches = matchData.data;
      if (newsData.success) sportsNews = newsData.data;
      if (radData.success) {
        radios = radData.data;
        radios.sort((a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0));
      }

    } catch (err) {
      console.warn('⚠️ API unavailable, falling back to default data:', err.message);
      // Graceful fallback to built-in defaults if server is unreachable
      if (typeof DEFAULT_CHANNELS !== 'undefined') channels = [...DEFAULT_CHANNELS];
      if (typeof DEFAULT_MATCHES !== 'undefined') matches = [...DEFAULT_MATCHES];
      if (typeof DEFAULT_SPORTS_NEWS !== 'undefined') sportsNews = [...DEFAULT_SPORTS_NEWS];
      if (typeof DEFAULT_RADIOS !== 'undefined') radios = [...DEFAULT_RADIOS];
    }
  }

  // Load all data from server before rendering
  await fetchAllData();

  let currentCategory = 'all';
  let activeChannel = null;
  let activeRadio = null;
  let hlsInstance = null;
  const audioEl = new Audio();

  // DOM Elements
  const categoriesContainer = document.getElementById('categoriesContainer');
  const channelsGrid = document.getElementById('channelsGrid');
  const matchesList = document.getElementById('matchesList');
  const radioGrid = document.getElementById('radioGrid');
  const favRadiosWrapper = document.getElementById('favRadiosWrapper');
  const favRadioGrid = document.getElementById('favRadioGrid');
  const favRadiosCountSubtitle = document.getElementById('favRadiosCountSubtitle');
  const channelsSectionHeaderTitle = document.getElementById('channelsSectionHeaderTitle');
  const favFilterTabsContainer = document.getElementById('favFilterTabsContainer');
  const favFilterAllBtn = document.getElementById('favFilterAllBtn');
  const favFilterChannelsBtn = document.getElementById('favFilterChannelsBtn');
  const favFilterRadiosBtn = document.getElementById('favFilterRadiosBtn');
  const favTotalCountBadge = document.getElementById('favTotalCountBadge');
  const favChannelsCountBadge = document.getElementById('favChannelsCountBadge');
  const favRadiosCountBadge = document.getElementById('favRadiosCountBadge');
  const favRadiosSubBadge = document.getElementById('favRadiosSubBadge');
  let currentFavSubFilter = 'all';

  const radioFilterAllBtn = document.getElementById('radioFilterAllBtn');
  const radioFilterFavsBtn = document.getElementById('radioFilterFavsBtn');
  const radioFavCountBadge = document.getElementById('radioFavCountBadge');
  let currentRadioFilter = 'all';

  const highlightsGrid = document.getElementById('highlightsGrid');
  const searchInput = document.getElementById('searchInput');
  const showFavsBtn = document.getElementById('showFavsBtn');
  const mobilePlayOverlay = document.getElementById('mobilePlayOverlay');
  const tickerRealtimeContent = document.getElementById('tickerRealtimeContent');

  // Slider Arrows
  const channelsScrollRight = document.getElementById('channelsScrollRight');
  const channelsScrollLeft = document.getElementById('channelsScrollLeft');
  const prevChannelBtn = document.getElementById('prevChannelBtn');
  const nextChannelBtn = document.getElementById('nextChannelBtn');

  // Social Share Modal Elements
  const shareModalBackdrop = document.getElementById('shareModalBackdrop');
  const closeShareModalBtn = document.getElementById('closeShareModalBtn');
  const shareChannelBtn = document.getElementById('shareChannelBtn');
  const shareWhatsapp = document.getElementById('shareWhatsapp');
  const shareFacebook = document.getElementById('shareFacebook');
  const shareTelegram = document.getElementById('shareTelegram');
  const shareTwitter = document.getElementById('shareTwitter');
  const shareLinkInput = document.getElementById('shareLinkInput');
  const copyShareLinkBtn = document.getElementById('copyShareLinkBtn');

  // Article Modal Elements
  const articleModalBackdrop = document.getElementById('articleModalBackdrop');
  const closeArticleModalBtn = document.getElementById('closeArticleModalBtn');
  const articleCategoryTag = document.getElementById('articleCategoryTag');
  const articleTitle = document.getElementById('articleTitle');
  const articleTimeAgo = document.getElementById('articleTimeAgo');
  const articleAuthor = document.getElementById('articleAuthor');
  const articleImage = document.getElementById('articleImage');
  const articleContent = document.getElementById('articleContent');
  const articleGallery = document.getElementById('articleGallery');
  const articleGallerySection = document.getElementById('articleGallerySection');

  // Match Modal Elements
  const matchModalBackdrop = document.getElementById('matchModalBackdrop');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalMatchTitle = document.getElementById('modalMatchTitle');
  const modalMatchMeta = document.getElementById('modalMatchMeta');
  const modalPlayerFrame = document.getElementById('modalPlayerFrame');
  const modalVideo = document.getElementById('modalVideo');
  const serverSelector = document.getElementById('serverSelector');
  let matchHls = null;

  // Player Elements
  const mainIframe = document.getElementById('mainIframe');
  const mainVideo = document.getElementById('mainVideo');
  const playerCard = document.getElementById('playerCard');
  const playerChannelLogo = document.getElementById('playerChannelLogo');
  const playerChannelName = document.getElementById('playerChannelName');
  const playerChannelDesc = document.getElementById('playerChannelDesc');
  const playerQualityBadge = document.getElementById('playerQualityBadge');
  const playerViewers = document.getElementById('playerViewers');
  const playerFavBtn = document.getElementById('playerFavBtn');

  // Audio Bar Elements
  const audioPlayerBar = document.getElementById('audioPlayerBar');
  const audioRadioName = document.getElementById('audioRadioName');
  const audioRadioDesc = document.getElementById('audioRadioDesc');
  const audioPlayPauseBtn = document.getElementById('audioPlayPauseBtn');

  // --- 1. REALTIME NEWS TICKER ENGINE ---
  function initRealtimeTicker() {
    if (!tickerRealtimeContent) return;
    const tickerItems = [
      '🔴 بث مباشر: مشاهدة قمة الأهلي والزمالك في دوري الأبطال تُعرض الآن بجميع السيرفرات.',
      '⚽ ديربي الرياض: متابعة مباراة الهلال والنصر مباشرة بجودة Full HD.',
      '🇪🇺 دوري أبطال أوروبا: ريال مدريد يستضيف مانشستر سيتي في البيرنابيو الليلة.',
      '🌙 المولد النبوي الشريف: تهنئة خاصة للأمة الإسلامية بمناسبة المولد النبوي الشريف.',
      '🎙️ راديو مباشر: استمع الآن لإذاعة القرآن الكريم من القاهرة ومكة بصوت نقي.'
    ];

    tickerRealtimeContent.innerHTML = tickerItems.map(item => `<span>${item}</span>`).join('');
  }

  // --- 2. RENDER CATEGORIES ---
  function renderCategories() {
    if (!categoriesContainer) return;
    const totalFavs = (favorites ? favorites.length : 0) + (radioFavorites ? radioFavorites.length : 0);
    const favCatItem = {
      id: 'favs',
      name: `المفضلة (${totalFavs})`,
      icon: 'fa-heart',
      isFav: true
    };
    const displayCategories = [
      categories[0], // 'الكل'
      favCatItem,
      ...categories.slice(1)
    ];

    categoriesContainer.innerHTML = displayCategories.map(cat => `
      <button class="category-btn ${cat.id === currentCategory ? 'active' : ''} ${cat.isFav ? 'fav-category-pill' : ''}" data-id="${cat.id}">
        <i class="fa-${cat.id === currentCategory && cat.isFav ? 'solid' : (cat.isFav ? 'solid' : 'solid')} ${cat.icon}" ${cat.isFav ? 'style="color: #ff1744;"' : ''}></i>
        <span>${cat.name}</span>
      </button>
    `).join('');

    categoriesContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.id;
        renderCategories();
        filterAndRenderChannels();
        if (currentCategory === 'favs') {
          const channelsSection = document.getElementById('channelsSection');
          if (channelsSection) {
            channelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      });
    });
  }

  // --- 3. UNIVERSAL STREAM PLAYER & SEO SYSTEM ---
  function generateSeoSlug(name) {
    if (!name) return '';
    return name.trim()
      .toLowerCase()
      .replace(/[^\w\u0621-\u064A\u0660-\u0669\- ]+/gu, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function updateSeoMetaTags(channel, pageUrl) {
    if (!channel) return;
    const title = `${channel.name} - بث مباشر | arabialivetv.com`;
    const description = `شاهد الآن البث المباشر لقناة ${channel.name} بجودة عالية Full HD وبدون تقطيع على مدار 24 ساعة عبر منصة عربية لايف تي في.`;
    const imageUrl = channel.logo || 'https://arabialivetv.com/favicon.ico';
    const keywords = `${channel.name}, بث مباشر ${channel.name}, قناة ${channel.name}, ${channel.country || 'قنوات عربية'}, بث مباشر للقنوات, مباريات اليوم, arabialivetv`;

    document.title = title;

    function setMeta(attr, val, content) {
      let el = document.querySelector(`meta[${attr}="${val}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, val);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    }

    setMeta('name', 'description', description);
    setMeta('name', 'keywords', keywords);

    // OpenGraph Meta Tags
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:url', pageUrl);
    setMeta('property', 'og:type', 'video.other');
    setMeta('property', 'og:site_name', 'بث مباشر للقنوات الفضائية');

    // Twitter Card Meta Tags
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);

    // Canonical link tag
    let canon = document.querySelector('link[rel="canonical"]');
    if (!canon) {
      canon = document.createElement('link');
      canon.setAttribute('rel', 'canonical');
      document.head.appendChild(canon);
    }
    canon.setAttribute('href', pageUrl);

    // Real-time Schema.org JSON-LD Structured Data
    let schemaEl = document.getElementById('schemaStructuredData');
    if (schemaEl) {
      try {
        schemaEl.textContent = JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BroadcastEvent",
          "name": `بث مباشر ${channel.name}`,
          "description": channel.description || description,
          "isLiveBroadcast": true,
          "startDate": new Date().toISOString(),
          "broadcastOfEvent": {
            "@type": "Event",
            "name": `البث الفضائي لقناة ${channel.name}`,
            "location": {
              "@type": "Place",
              "name": channel.country || "الوطن العربي"
            }
          },
          "video": {
            "@type": "VideoObject",
            "name": `${channel.name} بث مباشر`,
            "description": description,
            "thumbnailUrl": imageUrl,
            "uploadDate": "2024-01-01T00:00:00Z"
          }
        });
      } catch (_) {}
    }
  }

  function playChannel(channel, shouldScroll = true) {
    if (!channel) return;
    activeChannel = channel;
    const streamUrl = channel.streamUrl || channel.fallbackUrl;

    // Update browser URL query to this channel's unique ID & SEO-friendly Arabic title
    const slug = generateSeoSlug(channel.name);
    let channelUrl = `${window.location.origin}/?ch=${encodeURIComponent(channel.id)}&title=${encodeURIComponent(slug)}`;
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      let cleanPath = window.location.pathname;
      if (cleanPath.endsWith('/index.html')) {
        cleanPath = cleanPath.slice(0, -10) || '/';
      }
      const relativeUrl = `${cleanPath}?ch=${encodeURIComponent(channel.id)}&title=${encodeURIComponent(slug)}`;
      window.history.replaceState({ chId: channel.id }, '', relativeUrl);
    }

    // Dynamic document title & comprehensive SEO meta tags (description, OpenGraph, Twitter, Schema)
    updateSeoMetaTags(channel, channelUrl);

    // Update player details
    playerChannelLogo.src = channel.logo;
    playerChannelName.textContent = channel.name;
    playerChannelDesc.textContent = channel.description || `${channel.country} • بث حي ومباشر`;
    playerQualityBadge.textContent = channel.quality || 'HD';
    playerViewers.textContent = `${(channel.viewersCount || 15400).toLocaleString('ar-EG')} مشاهد`;

    if (mobilePlayOverlay) mobilePlayOverlay.style.display = 'none';

    // Clean up previous HLS instance
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }

    const isHls = streamUrl.includes('.m3u8');

    if (isHls && mainVideo) {
      mainIframe.style.display = 'none';
      mainIframe.src = '';
      mainVideo.style.display = 'block';

      if (mainVideo.canPlayType('application/vnd.apple.mpegurl')) {
        mainVideo.src = streamUrl;
        mainVideo.play().catch(() => {
          if (mobilePlayOverlay) mobilePlayOverlay.style.display = 'flex';
        });
      } else if (window.Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(mainVideo);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          mainVideo.play().catch(() => {
            if (mobilePlayOverlay) mobilePlayOverlay.style.display = 'flex';
          });
        });
      }
    } else {
      if (mainVideo) {
        mainVideo.pause();
        mainVideo.style.display = 'none';
      }
      mainIframe.style.display = 'block';

      // Parse full <iframe src="..."> code if pasted as URL
      let cleanUrl = streamUrl;
      if (typeof streamUrl === 'string' && streamUrl.includes('<iframe')) {
        const match = streamUrl.match(/src=["']([^"']+)["']/i);
        if (match && match[1]) {
          cleanUrl = match[1];
        }
      }
      mainIframe.referrerPolicy = 'origin';
      mainIframe.setAttribute('referrerpolicy', 'origin');
      mainIframe.src = cleanUrl;
    }

    // Favorite status
    const isFav = favorites.includes(channel.id);
    playerFavBtn.innerHTML = `<i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>`;
    playerFavBtn.style.color = isFav ? 'var(--gold)' : 'var(--text-muted)';

    // AUTOMATICALLY SCROLL TO TOP PLAYER SCREEN ON ALL DEVICES (CENTERED IN VIEWPORT)
    if (shouldScroll && playerCard) {
      playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    renderChannelsGrid(getFilteredChannels());
    if (typeof syncMatchCenterHeight === 'function') setTimeout(syncMatchCenterHeight, 80);
  }

  // Mobile Tap Overlay
  if (mobilePlayOverlay) {
    mobilePlayOverlay.addEventListener('click', () => {
      mobilePlayOverlay.style.display = 'none';
      if (mainVideo && mainVideo.style.display !== 'none') {
        mainVideo.muted = false;
        mainVideo.play();
      }
    });
  }

  // --- 4. CHANNEL SWITCHER BUTTONS (NEXT / PREVIOUS) ---
  if (prevChannelBtn) {
    prevChannelBtn.addEventListener('click', () => {
      const activeChannelsList = getFilteredChannels();
      if (!activeChannel || activeChannelsList.length === 0) return;
      const currIdx = activeChannelsList.findIndex(c => c.id === activeChannel.id);
      const prevIdx = (currIdx - 1 + activeChannelsList.length) % activeChannelsList.length;
      playChannel(activeChannelsList[prevIdx], true);
    });
  }

  if (nextChannelBtn) {
    nextChannelBtn.addEventListener('click', () => {
      const activeChannelsList = getFilteredChannels();
      if (!activeChannel || activeChannelsList.length === 0) return;
      const currIdx = activeChannelsList.findIndex(c => c.id === activeChannel.id);
      const nextIdx = (currIdx + 1) % activeChannelsList.length;
      playChannel(activeChannelsList[nextIdx], true);
    });
  }

  // --- 5. SLIDER ARROWS FOR CHANNELS GRID ---
  if (channelsScrollRight && channelsGrid) {
    channelsScrollRight.addEventListener('click', () => {
      channelsGrid.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  if (channelsScrollLeft && channelsGrid) {
    channelsScrollLeft.addEventListener('click', () => {
      channelsGrid.scrollBy({ left: -300, behavior: 'smooth' });
    });
  }

  // --- 6. SOCIAL SHARE MODAL SYSTEM (TV CHANNELS & RADIOS) ---
  function openChannelShareModal(channel) {
    if (!shareModalBackdrop) return;
    const shareTitle = document.querySelector('#shareModalBackdrop h3');
    if (shareTitle) {
      shareTitle.innerHTML = `<i class="fa-solid fa-share-nodes"></i> مشاركة البث المباشر: ${channel.name}`;
    }
    const shareModalText = document.getElementById('shareModalText');
    if (shareModalText) {
      shareModalText.textContent = `انشر رابط بث قناة "${channel.name}" مباشرة لأصدقائك في شبكات التواصل الاجتماعي:`;
    }

    const slug = generateSeoSlug(channel.name);
    const shareUrl = `${window.location.origin}/?ch=${encodeURIComponent(channel.id)}&title=${encodeURIComponent(slug)}`;
    const shareText = `شاهد الآن بث حي ومباشر لقناة "${channel.name}" بجودة عالية عبر منصة arabialivetv.com 📺:`;

    if (shareWhatsapp) shareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (shareTelegram) shareTelegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    if (shareTwitter) shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    if (shareLinkInput) shareLinkInput.value = shareUrl;

    shareModalBackdrop.classList.add('active');
  }

  function openRadioShareModal(radio) {
    if (!shareModalBackdrop) return;
    const shareTitle = document.querySelector('#shareModalBackdrop h3');
    if (shareTitle) {
      shareTitle.innerHTML = `<i class="fa-solid fa-radio" style="color: var(--secondary);"></i> مشاركة بث إذاعة: ${radio.name}`;
    }
    const shareModalText = document.getElementById('shareModalText');
    if (shareModalText) {
      shareModalText.textContent = `انشر رابط بث إذاعة "${radio.name}" مباشرة لأصدقائك في شبكات التواصل الاجتماعي:`;
    }

    const slug = generateSeoSlug(radio.name);
    const shareUrl = `${window.location.origin}/?radio=${encodeURIComponent(radio.id)}&title=${encodeURIComponent(slug)}`;
    const shareText = `استمع الآن إلى بث حي ومباشر لإذاعة "${radio.name}" بصوت نقي عبر منصة arabialivetv.com 🎙️📻:`;

    if (shareWhatsapp) shareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (shareTelegram) shareTelegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    if (shareTwitter) shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    if (shareLinkInput) shareLinkInput.value = shareUrl;
    shareModalBackdrop.classList.add('active');
  }

  if (shareChannelBtn) {
    shareChannelBtn.addEventListener('click', () => {
      if (activeChannel) openChannelShareModal(activeChannel);
    });
  }

  if (closeShareModalBtn) {
    closeShareModalBtn.addEventListener('click', () => {
      shareModalBackdrop.classList.remove('active');
    });
  }

  if (shareModalBackdrop) {
    shareModalBackdrop.addEventListener('click', (e) => {
      if (e.target === shareModalBackdrop) shareModalBackdrop.classList.remove('active');
    });
  }

  if (copyShareLinkBtn && shareLinkInput) {
    copyShareLinkBtn.addEventListener('click', () => {
      shareLinkInput.select();
      document.execCommand('copy');
      copyShareLinkBtn.innerHTML = '<i class="fa-solid fa-check"></i> تم النسخ!';
      setTimeout(() => {
        copyShareLinkBtn.innerHTML = '<i class="fa-regular fa-copy"></i> نسخ الرابط';
      }, 2500);
    });
  }

  // --- 7. FILTER AND RENDER CHANNELS ---
  function getFilteredChannels() {
    let result = [...channels];

    if (currentCategory === 'favs') {
      result = result.filter(c => favorites.includes(c.id));
    } else if (currentCategory !== 'all') {
      result = result.filter(c => c.category === currentCategory);
    }

    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    if (query) {
      result = result.filter(c => 
        c.name.toLowerCase().includes(query) || 
        c.country.toLowerCase().includes(query) ||
        (c.description && c.description.toLowerCase().includes(query))
      );
    }

    return result;
  }

  function filterAndRenderChannels() {
    if (channelsSectionHeaderTitle) {
      if (currentCategory === 'favs') {
        channelsSectionHeaderTitle.innerHTML = `<i class="fa-solid fa-heart" style="color: #ff1744;"></i> قائمتي المفضلة`;
      } else {
        channelsSectionHeaderTitle.innerHTML = `<i class="fa-solid fa-satellite-dish" style="color: var(--primary);"></i> القنوات الفضائية المباشرة`;
      }
    }

    if (favFilterTabsContainer) {
      favFilterTabsContainer.style.display = (currentCategory === 'favs') ? 'flex' : 'none';
      if (currentCategory === 'favs') {
        const totalFavCount = (favorites ? favorites.length : 0) + (radioFavorites ? radioFavorites.length : 0);
        if (favTotalCountBadge) favTotalCountBadge.textContent = totalFavCount;
        if (favChannelsCountBadge) favChannelsCountBadge.textContent = favorites ? favorites.length : 0;
        if (favRadiosCountBadge) favRadiosCountBadge.textContent = radioFavorites ? radioFavorites.length : 0;
        if (favRadiosSubBadge) favRadiosSubBadge.textContent = radioFavorites ? radioFavorites.length : 0;
      }
    }

    renderChannelsGrid(getFilteredChannels());
    renderFavRadiosSubsection();
  }

  function renderChannelsGrid(channelList) {
    if (!channelsGrid) return;
    const channelsCountSubtitle = document.getElementById('channelsCountSubtitle');
    if (channelsCountSubtitle) {
      if (currentCategory === 'favs') {
        channelsCountSubtitle.textContent = `لديك (${favorites.length}) قناة فضائية و (${radioFavorites.length}) إذاعة راديو في المفضلة`;
      } else {
        channelsCountSubtitle.textContent = `معروض (${channelList.length}) قناة من إجمالي (${channels.length}) قناة فضائية عربية ومباشرة`;
      }
    }

    if (currentCategory === 'favs') {
      if (currentFavSubFilter === 'radios') {
        channelsGrid.style.display = 'none';
        return;
      }

      if (channelList.length === 0) {
        if (currentFavSubFilter === 'channels') {
          channelsGrid.style.display = 'grid';
          channelsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <i class="fa-solid fa-heart-crack" style="font-size: 2.8rem; margin-bottom: 12px; color: #ff1744; opacity: 0.6;"></i>
              <h3 style="color: #fff; margin-bottom: 6px;">لا توجد قنوات فضائية في المفضلة حالياً</h3>
              <p>اضغط على أيقونة القلب (❤️) بجوار أي قناة لإضافتها إلى قائمتك المفضلة.</p>
            </div>
          `;
          return;
        }

        // 'all' subfilter:
        if (radioFavorites.length > 0) {
          channelsGrid.style.display = 'none';
          return;
        } else {
          channelsGrid.style.display = 'grid';
          channelsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 45px 20px; color: var(--text-muted);">
              <i class="fa-solid fa-heart-crack" style="font-size: 3rem; margin-bottom: 12px; color: #ff1744; opacity: 0.7;"></i>
              <h3 style="color: #fff; margin-bottom: 8px;">قائمة المفضلة فارغة حالياً</h3>
              <p>لم تقم بإضافة أي قنوات فضائية أو إذاعات راديو إلى المفضلة بعد.<br>اضغط على رمز القلب (❤️) في أي قناة أو إذاعة لحفظها والوصول السريع إليها هنا في أي وقت.</p>
            </div>
          `;
          return;
        }
      }
    }

    // Normal or Has Favorite Channels
    channelsGrid.style.display = 'grid';

    if (channelList.length === 0) {
      channelsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid fa-satellite-dish" style="font-size: 3rem; margin-bottom: 12px; opacity: 0.5;"></i>
          <p>لا توجد قنوات مطابقة للبحث أو التصفية الحالية.</p>
        </div>
      `;
      return;
    }

    channelsGrid.innerHTML = channelList.map(ch => {
      const isFav = favorites.includes(ch.id);
      const isPlaying = activeChannel && activeChannel.id === ch.id;

      return `
        <div class="channel-card ${isPlaying ? 'active-playing' : ''}" data-id="${ch.id}">
          <button class="fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${ch.id}" title="${isFav ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="card-share-btn" data-share-id="${ch.id}" title="مشاركة رابط هذه القناة">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
          <div class="channel-logo-wrapper">
            <img src="${ch.logo}" alt="${ch.name}" class="channel-logo-img">
            <div class="play-overlay">
              <i class="fa-solid fa-play"></i>
            </div>
          </div>
          <div class="channel-name">${ch.name}</div>
          <div class="channel-meta">
            <span>🔴 مباشر</span>
            <span>•</span>
            <span>${ch.country}</span>
          </div>
        </div>
      `;
    }).join('');

    channelsGrid.querySelectorAll('.channel-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.fav-btn') || e.target.closest('.card-share-btn')) return;
        const chId = card.dataset.id;
        const targetCh = channels.find(c => c.id === chId);
        if (targetCh) playChannel(targetCh, true);
      });
    });

    channelsGrid.querySelectorAll('.card-share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chId = btn.dataset.shareId;
        const targetCh = channels.find(c => c.id === chId);
        if (targetCh) openChannelShareModal(targetCh);
      });
    });

    channelsGrid.querySelectorAll('.fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const chId = btn.dataset.favId;
        toggleFavorite(chId);
      });
    });
  }

  function toggleFavorite(chId) {
    if (favorites.includes(chId)) {
      favorites = favorites.filter(id => id !== chId);
    } else {
      favorites.push(chId);
    }
    localStorage.setItem('altv_favorites', JSON.stringify(favorites));
    renderCategories();
    filterAndRenderChannels();
    if (activeChannel && activeChannel.id === chId) {
      playChannel(activeChannel, false);
    }
  }

  function toggleRadioFavorite(radioId) {
    if (radioFavorites.includes(radioId)) {
      radioFavorites = radioFavorites.filter(id => id !== radioId);
    } else {
      radioFavorites.push(radioId);
    }
    localStorage.setItem('altv_radio_favorites', JSON.stringify(radioFavorites));
    updateRadioFavBadge();
    renderCategories();
    renderRadios();
    renderFavRadiosSubsection();
    if (currentCategory === 'favs') {
      filterAndRenderChannels();
    }
  }

  function updateRadioFavBadge() {
    if (radioFavCountBadge) {
      radioFavCountBadge.textContent = radioFavorites.length;
    }
    if (favRadiosCountBadge) {
      favRadiosCountBadge.textContent = radioFavorites.length;
    }
    if (favRadiosSubBadge) {
      favRadiosSubBadge.textContent = radioFavorites.length;
    }
    if (favTotalCountBadge) {
      favTotalCountBadge.textContent = (favorites ? favorites.length : 0) + (radioFavorites ? radioFavorites.length : 0);
    }
  }

  function renderFavRadiosSubsection() {
    if (!favRadiosWrapper || !favRadioGrid) return;
    if (currentCategory !== 'favs') {
      favRadiosWrapper.style.display = 'none';
      return;
    }
    if (currentFavSubFilter === 'channels') {
      favRadiosWrapper.style.display = 'none';
      return;
    }

    const favList = radios.filter(r => radioFavorites.includes(r.id));
    if (favList.length === 0) {
      if (currentFavSubFilter === 'radios') {
        favRadiosWrapper.style.display = 'block';
        if (favRadiosCountSubtitle) {
          favRadiosCountSubtitle.textContent = `المحطات الإذاعية التي قمت بحفظها في المفضلة`;
        }
        favRadioGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 40px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-heart-crack" style="font-size: 2.8rem; margin-bottom: 12px; color: #ff1744; opacity: 0.6;"></i>
            <h3 style="color: #fff; margin-bottom: 6px;">لا توجد إذاعات في المفضلة حالياً</h3>
            <p>اضغط على أيقونة القلب (❤️) بجوار أي إذاعة لإضافتها إلى قائمتك المفضلة.</p>
          </div>
        `;
      } else {
        favRadiosWrapper.style.display = 'none';
      }
      return;
    }

    favRadiosWrapper.style.display = 'block';
    if (favRadiosCountSubtitle) {
      favRadiosCountSubtitle.textContent = `لديك (${favList.length}) إذاعة راديو مضافة إلى قائمة المفضلة`;
    }
    if (favRadiosSubBadge) {
      favRadiosSubBadge.textContent = favList.length;
    }

    favRadioGrid.innerHTML = favList.map(r => `
      <div class="radio-card ${activeRadio && activeRadio.id === r.id ? 'playing' : ''}" data-id="${r.id}">
        <div class="radio-icon">
          ${r.logo ? `
            <img src="${r.logo}" alt="${r.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
            <i class="fa-solid ${r.icon || 'fa-radio'}" style="display: none;"></i>
          ` : `
            <i class="fa-solid ${r.icon || 'fa-radio'}"></i>
          `}
        </div>
        <div class="radio-info" style="flex: 1;">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff;">${r.name}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${r.description || 'بث صوّتي حي ومباشر'}</p>
        </div>
        <div class="radio-actions">
          <button class="fav-btn fav-radio-btn is-fav" data-fav-radio-id="${r.id}" title="إزالة من المفضلة">
            <i class="fa-solid fa-heart"></i>
          </button>
          <button class="btn-icon share-radio-btn" data-radio-id="${r.id}" title="مشاركة بث إذاعة الراديو">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    `).join('');

    favRadioGrid.querySelectorAll('.radio-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.radio-actions')) return;
        const rId = card.dataset.id;
        const selectedRadio = radios.find(r => r.id === rId);
        if (selectedRadio) playRadio(selectedRadio);
      });
    });

    favRadioGrid.querySelectorAll('.fav-radio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = btn.dataset.favRadioId;
        toggleRadioFavorite(rId);
      });
    });

    favRadioGrid.querySelectorAll('.share-radio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = btn.dataset.radioId;
        const targetRad = radios.find(r => r.id === rId);
        if (targetRad) openRadioShareModal(targetRad);
      });
    });
  }

  // Favorite Subfilter Tab Listeners
  if (favFilterAllBtn) {
    favFilterAllBtn.addEventListener('click', () => {
      currentFavSubFilter = 'all';
      favFilterAllBtn.classList.add('active');
      if (favFilterChannelsBtn) favFilterChannelsBtn.classList.remove('active');
      if (favFilterRadiosBtn) favFilterRadiosBtn.classList.remove('active');
      filterAndRenderChannels();
    });
  }

  if (favFilterChannelsBtn) {
    favFilterChannelsBtn.addEventListener('click', () => {
      currentFavSubFilter = 'channels';
      favFilterChannelsBtn.classList.add('active');
      if (favFilterAllBtn) favFilterAllBtn.classList.remove('active');
      if (favFilterRadiosBtn) favFilterRadiosBtn.classList.remove('active');
      filterAndRenderChannels();
    });
  }

  if (favFilterRadiosBtn) {
    favFilterRadiosBtn.addEventListener('click', () => {
      currentFavSubFilter = 'radios';
      favFilterRadiosBtn.classList.add('active');
      if (favFilterAllBtn) favFilterAllBtn.classList.remove('active');
      if (favFilterChannelsBtn) favFilterChannelsBtn.classList.remove('active');
      filterAndRenderChannels();
    });
  }

  // --- 8. RENDER DAILY MATCH CENTER & LIVE STREAM MODAL ---
  let activeMatchFilter = 'today'; // Default: show today's matches first upon opening

  const ARABIC_MONTHS = {
    'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'ابريل': 4,
    'مايو': 5, 'يونيو': 6, 'يوليو': 7, 'أغسطس': 8, 'اغسطس': 8,
    'سبتمبر': 9, 'أكتوبر': 10, 'اكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12
  };

  // Helper: return today's ISO date (YYYY-MM-DD) according to client's local calendar
  function getTodayIsoString() {
    const d = new Date();
    try {
      return new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(d);
    } catch (_) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }

  function normalizeArabicDigits(str) {
    if (!str) return '';
    return String(str)
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  // Helper: compute ISO date for any match with full Arabic numeral support
  function getMatchIso(m) {
    if (m.dateIso && /^\d{4}-\d{2}-\d{2}$/.test(m.dateIso)) return m.dateIso;
    const str = normalizeArabicDigits(m.date || '').trim();
    const todayIso = getTodayIsoString();

    if (!str || str === 'اليوم') {
      if (m.created_at || m.createdAt) {
        const c = String(m.created_at || m.createdAt);
        if (/^\d{4}-\d{2}-\d{2}/.test(c)) return c.slice(0, 10);
      }
      return todayIso;
    }

    const isoM = str.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (isoM) return `${isoM[1]}-${isoM[2].padStart(2, '0')}-${isoM[3].padStart(2, '0')}`;

    const dmyMatch = str.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;

    if (str.includes('غداً') || str.includes('غدا')) {
      const tom = new Date();
      tom.setDate(tom.getDate() + 1);
      return getTodayIsoString(tom);
    }

    if (str.includes('بعد غد')) {
      const aft = new Date();
      aft.setDate(aft.getDate() + 2);
      return getTodayIsoString(aft);
    }

    for (const [mName, mNum] of Object.entries(ARABIC_MONTHS)) {
      if (str.includes(mName)) {
        const dM = str.match(/\b(\d{1,2})\b/);
        if (dM) {
          const day = parseInt(dM[1], 10);
          const yM = str.match(/\b(20\d{2})\b/);
          const year = yM ? parseInt(yM[1], 10) : new Date().getFullYear();
          return `${year}-${String(mNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
    return todayIso;
  }

  // Helper: generate all Arabic date strings that represent "today"
  function getTodayArabicStrings() {
    const now = new Date();
    const strs = new Set();
    // Variant 1: ar-EG full format e.g. "الثلاثاء 14 أكتوبر"
    try {
      strs.add(now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }));
    } catch (_) {}
    // Variant 2: ar full format e.g. "الثلاثاء، 14 أكتوبر 2026"
    try {
      strs.add(now.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' }));
    } catch (_) {}
    // Also accept literal keyword
    strs.add('اليوم');
    return strs;
  }

  // Helper: Format and update today's calendar date badge
  function updateTodayCalendarDate() {
    const now = new Date();
    let arabicFormatted = '';
    try {
      arabicFormatted = now.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
    } catch (_) {
      arabicFormatted = now.toLocaleDateString('ar', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    const badge = document.getElementById('matchTodayDateBadge');
    if (badge) {
      badge.textContent = arabicFormatted;
    }
    return arabicFormatted;
  }

  // Automatic midnight rollover watcher & 60s live score refresher:
  let lastObservedDay = getTodayIsoString();
  setInterval(() => {
    const currentDay = getTodayIsoString();
    if (currentDay !== lastObservedDay) {
      lastObservedDay = currentDay;
      console.log('📅 Calendar day changed to:', currentDay, '— auto-refreshing matches & date badge.');
      updateTodayCalendarDate();
    }
    fetch(`${API_BASE}/api/matches`)
      .then(r => r.json())
      .then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          matches = res.data;
          renderMatches();
        }
      })
      .catch(() => {});
  }, 60000);

  // Tab switcher for match tabs
  const matchTabsContainer = document.getElementById('matchTabsContainer');
  if (matchTabsContainer) {
    matchTabsContainer.querySelectorAll('.match-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        matchTabsContainer.querySelectorAll('.match-tab-btn').forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        activeMatchFilter = btn.dataset.filter || 'today';
        renderMatches();
      });
    });
  }

  // Global helper to switch match tabs programmatically
  window.switchMatchTab = function(filterName) {
    if (!matchTabsContainer) return;
    const targetBtn = matchTabsContainer.querySelector(`.match-tab-btn[data-filter="${filterName}"]`);
    if (targetBtn) {
      targetBtn.click();
    } else {
      activeMatchFilter = filterName;
      renderMatches();
    }
  };

  let activeMatchSort = 'custom';
  const userMatchSortSelect = document.getElementById('userMatchSortSelect');
  if (userMatchSortSelect) {
    userMatchSortSelect.addEventListener('change', (e) => {
      activeMatchSort = e.target.value;
      renderMatches();
    });
  }

  function renderMatches(filterQuery = '') {
    if (!matchesList) return;

    // Update dynamic calendar date
    updateTodayCalendarDate();

    let sorted = [...matches];
    if (activeMatchSort === 'liveFirst') {
      const statusWeight = { 'live': 1, 'upcoming': 2, 'ended': 3 };
      sorted.sort((a, b) => (statusWeight[a.status] || 2) - (statusWeight[b.status] || 2));
    } else if (activeMatchSort === 'time') {
      sorted.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
    }

    const todayIso = getTodayIsoString();
    const todayStrings = getTodayArabicStrings();

    // Filter strictly by the active 3-tab selection
    let filtered = sorted.filter(m => {
      const mIso = getMatchIso(m);
      const isEnded = m.status === 'ended';
      const isLive = m.status === 'live';

      // ================= TAB 1: مباريات سابقة (Past / Ended matches) =================
      if (activeMatchFilter === 'past') {
        // Any match that has ended, or any match from yesterday/earlier that is not live
        if (isEnded) return true;
        if (mIso < todayIso && !isLive) return true;
        return false;
      }

      // ================= TAB 2: مباريات اليوم (Today's matches) =================
      if (activeMatchFilter === 'today') {
        // Always include currently live matches
        if (isLive) return true;

        // Never show strictly future/advanced dates today
        if (mIso > todayIso) return false;

        // If played today and ended today, keep visible in today's fixtures
        // Strictly matches today's ISO date:
        if (mIso === todayIso) return true;

        // Matches raw string "اليوم" or empty date
        const rawDate = normalizeArabicDigits(m.date || '').trim();
        if (!rawDate || rawDate === 'اليوم') return true;

        // Matches localized Arabic today strings
        if (todayStrings.has(rawDate)) return true;

        return false;
      }

      // ================= TAB 3: مباريات قادمة (Upcoming / Future matches) =================
      if (activeMatchFilter === 'upcoming') {
        // Exclude ended matches
        if (isEnded) return false;

        // Future calendar date
        if (mIso > todayIso) return true;

        // Explicit upcoming words like "غداً" or "بعد غد"
        const rawDate = normalizeArabicDigits(m.date || '').trim();
        if (rawDate.includes('غد') || rawDate.includes('غدا')) return true;

        return false;
      }

      return true;
    });

    // Sort logic: In "today" tab, always place LIVE matches FIRST at the top!
    if (activeMatchFilter === 'today') {
      filtered.sort((a, b) => {
        const aLive = a.status === 'live' ? 1 : 0;
        const bLive = b.status === 'live' ? 1 : 0;
        if (aLive !== bLive) {
          return bLive - aLive; // Live matches first at the top
        }
        return (a.time || '').localeCompare(b.time || '');
      });
    }

    // If viewing past matches, sort by date/time descending so latest results are at the top
    if (activeMatchFilter === 'past' && activeMatchSort === 'custom') {
      filtered.sort((a, b) => (b.time || '').localeCompare(a.time || ''));
    }

    const q = (filterQuery || '').trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(m => 
        (m.homeTeam && m.homeTeam.toLowerCase().includes(q)) ||
        (m.awayTeam && m.awayTeam.toLowerCase().includes(q)) ||
        (m.league && m.league.toLowerCase().includes(q)) ||
        (m.commentator && m.commentator.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      let emptyMsg = 'لا توجد مباريات مدرجة في هذا القسم حالياً.';
      let emptyIcon = 'fa-calendar-xmark';
      if (activeMatchFilter === 'past') {
        emptyMsg = 'لا توجد مباريات سابقة مسجلة حالياً.';
        emptyIcon = 'fa-flag-checkered';
      } else if (activeMatchFilter === 'today') {
        const todayDateText = document.getElementById('matchTodayDateBadge')?.textContent || 'اليوم';
        emptyMsg = `لا توجد مباريات مسجلة لليوم (${todayDateText}).`;
        emptyIcon = 'fa-calendar-day';
      } else if (activeMatchFilter === 'upcoming') {
        emptyMsg = 'لا توجد مباريات قادمة مجدولة حالياً.';
        emptyIcon = 'fa-calendar-plus';
      }

      matchesList.innerHTML = `
        <div style="text-align: center; padding: 42px 20px; color: var(--text-muted);">
          <i class="fa-solid ${emptyIcon}" style="font-size: 2.4rem; margin-bottom: 14px; display: block; opacity: 0.35;"></i>
          <span style="font-size: 0.92rem; font-weight: 700; color: #cbd5e1;">${emptyMsg}</span>
        </div>
      `;
      return;
    }

    matchesList.innerHTML = filtered.map(m => {
      let statusHtml = '';
      if (m.status === 'live') {
        statusHtml = '<span class="pulse-dot-red"></span> مباشر';
      } else if (m.status === 'ended') {
        statusHtml = '<i class="fa-solid fa-flag-checkered"></i> انتهت';
      } else {
        statusHtml = `${m.date || 'اليوم'} • ${m.time}`;
      }

      let scoreDisplayHtml = '';
      const hasScore = m.score && m.score !== 'vs';
      const isLive = m.status === 'live';
      const isEnded = m.status === 'ended';

      if (hasScore || isLive || isEnded) {
        const parts = String(m.score || '0-0').split(/[-–:]/).map(x => x.trim()).filter(Boolean);
        const homeScore = (!isNaN(parts[0]) && parts[0] !== '') ? parts[0] : '0';
        const awayScore = (!isNaN(parts[1]) && parts[1] !== '') ? parts[1] : '0';

        scoreDisplayHtml = `
          <div class="match-dual-score ${isLive ? 'is-live' : (isEnded ? 'is-ended' : '')}">
            <div class="team-score-box score-home" title="أهداف: ${m.homeTeam} (صاحب الأرض - اليمين)">
              <span class="score-digit">${homeScore}</span>
            </div>
            <span class="score-divider">:</span>
            <div class="team-score-box score-away" title="أهداف: ${m.awayTeam} (الضيف - اليسار)">
              <span class="score-digit">${awayScore}</span>
            </div>
          </div>
        `;
      } else {
        scoreDisplayHtml = `<div class="match-time-pill">${m.time || 'VS'}</div>`;
      }

      return `
        <div class="match-item" data-match-id="${m.id}">
          <div class="match-league-row">
            <span class="match-league-badge"><i class="fa-solid fa-trophy"></i> ${m.league}</span>
            <span class="match-status-tag ${m.status === 'live' ? 'status-live' : (m.status === 'ended' ? 'status-ended' : 'status-upcoming')}">
              ${statusHtml}
            </span>
          </div>
          <div class="match-teams-row">
            <div class="match-team team-home">
              <span class="team-name">${m.homeTeam}</span>
            </div>
            ${scoreDisplayHtml}
            <div class="match-team team-away">
              <span class="team-name">${m.awayTeam}</span>
            </div>
          </div>
          <div class="match-footer-row">
            <div class="match-channel-meta">
              <span><i class="fa-solid fa-tv"></i> ${m.channelName || 'قناة رياضية'}</span>
              ${m.commentator ? `<span><i class="fa-solid fa-microphone-lines"></i> ${m.commentator}</span>` : ''}
            </div>
            <div class="match-action-btns-group">
              <button class="match-wa-bell-btn" data-match-id="${m.id}" title="تفعيل تنبيهات الأهداف عبر واتساب (اضغط للاشتراك)">
                <i class="fa-brands fa-whatsapp"></i> <span>تنبيه الأهداف</span>
              </button>
              <button class="match-watch-btn">
                <i class="fa-solid fa-circle-play"></i> مشاهدة
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    matchesList.querySelectorAll('.match-wa-bell-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const mId = btn.dataset.matchId;
        const targetMatch = matches.find(m => m.id === mId);
        if (targetMatch) openWhatsAppModal(targetMatch);
      });
    });

    matchesList.querySelectorAll('.match-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.match-wa-bell-btn')) return;
        const mId = item.dataset.matchId;
        const targetMatch = matches.find(m => m.id === mId);
        if (targetMatch) openMatchModal(targetMatch);
      });
    });
  }

  function playMatchServerUrl(url) {
    if (matchHls) {
      matchHls.destroy();
      matchHls = null;
    }
    const isHls = url && url.includes('.m3u8');
    if (isHls && modalVideo) {
      if (modalPlayerFrame) {
        modalPlayerFrame.style.display = 'none';
        modalPlayerFrame.src = '';
      }
      modalVideo.style.display = 'block';
      if (modalVideo.canPlayType('application/vnd.apple.mpegurl')) {
        modalVideo.src = url;
        modalVideo.play().catch(() => {});
      } else if (window.Hls && Hls.isSupported()) {
        matchHls = new Hls({ enableWorker: true, lowLatencyMode: true });
        matchHls.loadSource(url);
        matchHls.attachMedia(modalVideo);
        matchHls.on(Hls.Events.MANIFEST_PARSED, () => {
          modalVideo.play().catch(() => {});
        });
      }
    } else {
      if (modalVideo) {
        modalVideo.pause();
        modalVideo.style.display = 'none';
        modalVideo.src = '';
      }
      if (modalPlayerFrame) {
        modalPlayerFrame.style.display = 'block';
        modalPlayerFrame.referrerPolicy = 'no-referrer';
        if (url && (url.trim().startsWith('<iframe') || url.trim().startsWith('<script') || url.includes('<div'))) {
          modalPlayerFrame.src = 'about:blank';
          modalPlayerFrame.srcdoc = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;overflow:hidden;}iframe{width:100%!important;height:100%!important;border:none!important;}</style></head><body>${url}</body></html>`;
        } else {
          modalPlayerFrame.removeAttribute('srcdoc');
          modalPlayerFrame.src = url;
        }
      }
    }
  }

  function closeMatchModal() {
    if (matchModalBackdrop) matchModalBackdrop.classList.remove('active');
    if (matchHls) {
      matchHls.destroy();
      matchHls = null;
    }
    if (modalVideo) {
      modalVideo.pause();
      modalVideo.src = '';
      modalVideo.style.display = 'none';
    }
    if (modalPlayerFrame) {
      modalPlayerFrame.src = '';
    }
  }

  function openMatchModal(match) {
    if (!matchModalBackdrop) return;

    modalMatchTitle.innerHTML = `⚽ مشاهدة مباراة: ${match.homeTeam} vs ${match.awayTeam} بث مباشر`;
    modalMatchMeta.textContent = `🏆 ${match.league} • 🎤 المعلق: ${match.commentator || 'غير محدد'} • 📍 ${match.stadium || 'الملعب الرئيسي'}`;

    const servers = match.servers && match.servers.length > 0 ? match.servers : [
      { name: 'سيرفر 1 (الكأس HD مباشر)', url: 'https://shoof.alkass.net/live/ch1.m3u8' },
      { name: 'سيرفر 2 (الكويت سبورت HD مباشر)', url: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' }
    ];

    serverSelector.innerHTML = servers.map((srv, idx) => `
      <button class="server-btn ${idx === 0 ? 'active' : ''}" data-url="${srv.url}">
        <i class="fa-solid fa-server"></i> ${srv.name}
      </button>
    `).join('');

    // Play default server
    playMatchServerUrl(servers[0].url);

    serverSelector.querySelectorAll('.server-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        serverSelector.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        playMatchServerUrl(btn.dataset.url);
      });
    });

    const modalWhatsAppAlertBtn = document.getElementById('modalWhatsAppAlertBtn');
    if (modalWhatsAppAlertBtn) {
      modalWhatsAppAlertBtn.onclick = () => {
        openWhatsAppModal(match);
      };
    }

    matchModalBackdrop.classList.add('active');
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeMatchModal);
  }

  if (matchModalBackdrop) {
    matchModalBackdrop.addEventListener('click', (e) => {
      if (e.target === matchModalBackdrop) {
        closeMatchModal();
      }
    });
  }

  // ==================== WHATSAPP GOAL ALERT LOGIC ====================
  const whatsappModalBackdrop = document.getElementById('whatsappModalBackdrop');
  const closeWhatsAppModalBtn = document.getElementById('closeWhatsAppModalBtn');
  const whatsappSubscribeForm = document.getElementById('whatsappSubscribeForm');
  const waMatchIdInput = document.getElementById('waMatchId');
  const waModalMatchTitle = document.getElementById('waModalMatchTitle');
  const waModalMatchMeta = document.getElementById('waModalMatchMeta');
  const waCountryCodeSelect = document.getElementById('waCountryCode');
  const waPhoneInput = document.getElementById('waPhoneInput');
  const waTeamHomeLabel = document.getElementById('waTeamHomeLabel');
  const waTeamAwayLabel = document.getElementById('waTeamAwayLabel');
  const waSubscribeStatus = document.getElementById('waSubscribeStatus');
  const waSubmitBtn = document.getElementById('waSubmitBtn');
  const waUnsubBtn = document.getElementById('waUnsubBtn');

  function openWhatsAppModal(match) {
    if (!whatsappModalBackdrop || !match) return;

    if (waMatchIdInput) waMatchIdInput.value = match.id;
    if (waModalMatchTitle) waModalMatchTitle.textContent = `${match.homeTeam} 🆚 ${match.awayTeam}`;
    if (waModalMatchMeta) waModalMatchMeta.textContent = `🏆 ${match.league} • 📅 ${match.date || 'اليوم'} • ⏱️ ${match.time || 'مباشر'}`;
    if (waTeamHomeLabel) waTeamHomeLabel.textContent = match.homeTeam;
    if (waTeamAwayLabel) waTeamAwayLabel.textContent = match.awayTeam;

    const waHomeName = document.getElementById('waModalHomeTeamName');
    const waAwayName = document.getElementById('waModalAwayTeamName');
    const waLeague = document.getElementById('waModalMatchLeague');
    const waTime = document.getElementById('waModalMatchTime');
    if (waHomeName) waHomeName.textContent = match.homeTeam;
    if (waAwayName) waAwayName.textContent = match.awayTeam;
    if (waLeague) waLeague.innerHTML = `<i class="fa-solid fa-trophy"></i> ${match.league}`;
    if (waTime) waTime.textContent = match.status === 'live' ? '🔴 مباشر الآن' : (match.time ? `⏱️ ${match.time}` : 'اليوم');

    // Reset status
    if (waSubscribeStatus) {
      waSubscribeStatus.style.display = 'none';
      waSubscribeStatus.textContent = '';
      waSubscribeStatus.style.background = 'transparent';
    }

    if (waSubmitBtn) {
      waSubmitBtn.disabled = false;
      waSubmitBtn.innerHTML = '<i class="fa-brands fa-whatsapp" style="font-size: 1.25rem;"></i> تفعيل تنبيهات الأهداف عبر الواتساب';
    }

    // Pre-fill phone if previously saved
    const savedPhone = localStorage.getItem('altv_user_whatsapp');
    if (savedPhone && waPhoneInput) {
      waPhoneInput.value = savedPhone;
    }

    whatsappModalBackdrop.classList.add('active');
  }

  function closeWhatsAppModal() {
    if (whatsappModalBackdrop) whatsappModalBackdrop.classList.remove('active');
  }

  if (closeWhatsAppModalBtn) {
    closeWhatsAppModalBtn.addEventListener('click', closeWhatsAppModal);
  }

  if (whatsappModalBackdrop) {
    whatsappModalBackdrop.addEventListener('click', (e) => {
      if (e.target === whatsappModalBackdrop) closeWhatsAppModal();
    });
  }

  if (whatsappSubscribeForm) {
    whatsappSubscribeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const matchId = waMatchIdInput ? waMatchIdInput.value : '';
      let rawPhone = waPhoneInput ? waPhoneInput.value.trim() : '';
      const countryCode = waCountryCodeSelect ? waCountryCodeSelect.value : '20';
      const teamRadio = document.querySelector('input[name="waTeamInterest"]:checked');
      const teamInterest = teamRadio ? teamRadio.value : 'both';

      if (!matchId || !rawPhone) {
        showWaStatus('يرجى إدخال رقم الهاتف بشكل صحيح', 'error');
        return;
      }

      // Prepend country code if not 'other' and phone doesn't already have it
      let fullPhone = rawPhone.replace(/[^\d]/g, '');
      if (countryCode !== 'other') {
        if (fullPhone.startsWith('0')) fullPhone = fullPhone.slice(1);
        if (!fullPhone.startsWith(countryCode)) {
          fullPhone = countryCode + fullPhone;
        }
      }

      if (waSubmitBtn) {
        waSubmitBtn.disabled = true;
        waSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري ربط وتفعيل التنبيهات...';
      }

      try {
        const res = await fetch(`${API_BASE}/api/matches/${encodeURIComponent(matchId)}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone, teamInterest })
        });
        const data = await res.json();

        if (data.success) {
          // Save for convenience
          localStorage.setItem('altv_user_whatsapp', rawPhone);
          showWaStatus(`✅ ${data.message}`, 'success');
          if (waSubmitBtn) {
            waSubmitBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> تم التفعيل بنجاح!';
            waSubmitBtn.style.background = '#00e676';
          }
          setTimeout(() => {
            closeWhatsAppModal();
          }, 2400);
        } else {
          showWaStatus(data.message || 'تعذر الاشتراك، يرجى المحاولة لاحقاً', 'error');
          if (waSubmitBtn) {
            waSubmitBtn.disabled = false;
            waSubmitBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> إعادة المحاولة';
          }
        }
      } catch (err) {
        showWaStatus('حدث خطأ أثناء الاتصال بالخادم. يرجى التحقق من اتصالك بالإنترنت.', 'error');
        if (waSubmitBtn) {
          waSubmitBtn.disabled = false;
          waSubmitBtn.innerHTML = '<i class="fa-brands fa-whatsapp"></i> إعادة المحاولة';
        }
      }
    });
  }

  if (waUnsubBtn) {
    waUnsubBtn.addEventListener('click', async () => {
      const matchId = waMatchIdInput ? waMatchIdInput.value : '';
      let rawPhone = waPhoneInput ? waPhoneInput.value.trim() : '';
      if (!matchId || !rawPhone) {
        showWaStatus('يرجى كتابة رقم هاتفك أولاً لإلغاء الاشتراك', 'error');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/api/matches/${encodeURIComponent(matchId)}/unsubscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: rawPhone })
        });
        const data = await res.json();
        showWaStatus(data.message || 'تم إلغاء الاشتراك بنجاح', 'success');
      } catch (e) {
        showWaStatus('تعذر إلغاء الاشتراك حالياً', 'error');
      }
    });
  }

  function showWaStatus(msg, type = 'info') {
    if (!waSubscribeStatus) return;
    waSubscribeStatus.style.display = 'block';
    waSubscribeStatus.textContent = msg;
    if (type === 'success') {
      waSubscribeStatus.style.background = 'rgba(0, 230, 118, 0.18)';
      waSubscribeStatus.style.color = '#00e676';
      waSubscribeStatus.style.border = '1px solid #00e676';
    } else {
      waSubscribeStatus.style.background = 'rgba(255, 23, 68, 0.18)';
      waSubscribeStatus.style.color = '#ff5252';
      waSubscribeStatus.style.border = '1px solid #ff1744';
    }
  }

  // --- 9. RENDER REALTIME SPORTS NEWS GRID & FULL ARTICLE MODAL ---
  function renderSportsNews(filterQuery = '') {
    if (!sportsNewsGrid) return;
    const q = (filterQuery || '').trim().toLowerCase();
    let list = sportsNews;
    if (q) {
      list = sportsNews.filter(n => 
        (n.title && n.title.toLowerCase().includes(q)) || 
        (n.summary && n.summary.toLowerCase().includes(q)) ||
        (n.category && n.category.toLowerCase().includes(q))
      );
    }
    if (list.length === 0) {
      sportsNewsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-regular fa-newspaper" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4;"></i>
          <p>لا توجد أخبار مطابقة لبحثك حالياً.</p>
        </div>
      `;
      return;
    }
    sportsNewsGrid.innerHTML = list.map(news => `
      <div class="sports-news-card" data-news-id="${news.id}" style="cursor: pointer;">
        <div class="news-img-wrapper">
          <img src="${news.image}" alt="${news.title}">
          <span class="news-tag">${news.category}</span>
        </div>
        <div class="news-content">
          <h3 class="news-title">${news.title}</h3>
          <p class="news-summary">${news.summary}</p>
          <div class="news-meta">
            <span><i class="fa-regular fa-clock" style="color: var(--primary);"></i> ${news.timeAgo || 'الآن'}</span>
            <span style="color: var(--gold); font-weight:700;">اقرأ الخبر كاملاً ←</span>
          </div>
        </div>
      </div>
    `).join('');

    sportsNewsGrid.querySelectorAll('.sports-news-card').forEach(card => {
      card.addEventListener('click', () => {
        const nId = card.dataset.newsId;
        const targetNews = sportsNews.find(n => n.id === nId);
        if (targetNews) openArticleModal(targetNews);
      });
    });
  }

  function openArticleModal(news) {
    if (!articleModalBackdrop) return;

    articleCategoryTag.textContent = news.category || 'خبر رياضي';
    articleTitle.textContent = news.title;
    articleTimeAgo.textContent = news.timeAgo || 'الآن';
    articleAuthor.textContent = news.author || 'التحرير الرياضي';
    articleImage.src = news.image;
    articleContent.innerHTML = news.content || `<p>${news.summary}</p><p>تغطية حصرية مستمرة للأحداث والتطورات الميدانية الكبرى عبر منصة بث مباشر للقنوات الفضائية.</p>`;

    // Render Gallery Photos
    if (news.gallery && news.gallery.length > 0) {
      articleGallerySection.style.display = 'block';
      articleGallery.innerHTML = news.gallery.map(imgUrl => `
        <div style="height: 140px; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border-glass);">
          <img src="${imgUrl}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
      `).join('');
    } else {
      articleGallerySection.style.display = 'none';
    }

    articleModalBackdrop.classList.add('active');
  }

  if (closeArticleModalBtn) {
    closeArticleModalBtn.addEventListener('click', () => {
      articleModalBackdrop.classList.remove('active');
    });
  }

  if (articleModalBackdrop) {
    articleModalBackdrop.addEventListener('click', (e) => {
      if (e.target === articleModalBackdrop) {
        articleModalBackdrop.classList.remove('active');
      }
    });
  }

  // --- 10. RENDER RADIO STATIONS WITH SOCIAL SHARE BUTTON & FAVORITES ---
  function renderRadios(filterQuery = '') {
    if (!radioGrid) return;
    const q = (filterQuery || '').trim().toLowerCase();
    let list = radios;
    if (currentRadioFilter === 'favs') {
      list = list.filter(r => radioFavorites.includes(r.id));
    }
    if (q) {
      list = list.filter(r => 
        (r.name && r.name.toLowerCase().includes(q)) || 
        (r.description && r.description.toLowerCase().includes(q))
      );
    }

    updateRadioFavBadge();

    if (list.length === 0) {
      radioGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          <i class="fa-solid ${currentRadioFilter === 'favs' ? 'fa-heart-crack' : 'fa-radio'}" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4; color: ${currentRadioFilter === 'favs' ? 'var(--gold)' : 'inherit'};"></i>
          <p>${currentRadioFilter === 'favs' ? 'لم تقم بإضافة أي إذاعات إلى المفضلة بعد.<br>اضغط على أيقونة القلب (❤️) بجوار أي إذاعة لحفظها هنا.' : 'لا توجد إذاعات مطابقة للبحث الحالي.'}</p>
        </div>
      `;
      return;
    }
    radioGrid.innerHTML = list.map(r => {
      const isFav = radioFavorites.includes(r.id);
      return `
      <div class="radio-card ${activeRadio && activeRadio.id === r.id ? 'playing' : ''}" data-id="${r.id}">
        <div class="radio-icon">
          ${r.logo ? `
            <img src="${r.logo}" alt="${r.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';">
            <i class="fa-solid ${r.icon || 'fa-radio'}" style="display: none;"></i>
          ` : `
            <i class="fa-solid ${r.icon || 'fa-radio'}"></i>
          `}
        </div>
        <div class="radio-info" style="flex: 1;">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff;">${r.name}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${r.description || 'بث صوّتي حي ومباشر'}</p>
        </div>
        <div class="radio-actions">
          <button class="fav-btn fav-radio-btn ${isFav ? 'is-fav' : ''}" data-fav-radio-id="${r.id}" title="${isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
          </button>
          <button class="btn-icon share-radio-btn" data-radio-id="${r.id}" title="مشاركة بث إذاعة الراديو">
            <i class="fa-solid fa-share-nodes"></i>
          </button>
        </div>
      </div>
    `;
    }).join('');

    radioGrid.querySelectorAll('.radio-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.radio-actions')) return;
        const rId = card.dataset.id;
        const selectedRadio = radios.find(r => r.id === rId);
        if (selectedRadio) playRadio(selectedRadio);
      });
    });

    radioGrid.querySelectorAll('.fav-radio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = btn.dataset.favRadioId;
        toggleRadioFavorite(rId);
      });
    });

    radioGrid.querySelectorAll('.share-radio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = btn.dataset.radioId;
        const targetRad = radios.find(r => r.id === rId);
        if (targetRad) openRadioShareModal(targetRad);
      });
    });
  }

  if (radioFilterAllBtn) {
    radioFilterAllBtn.addEventListener('click', () => {
      currentRadioFilter = 'all';
      radioFilterAllBtn.classList.add('active');
      if (radioFilterFavsBtn) radioFilterFavsBtn.classList.remove('active');
      renderRadios();
    });
  }

  if (radioFilterFavsBtn) {
    radioFilterFavsBtn.addEventListener('click', () => {
      currentRadioFilter = 'favs';
      radioFilterFavsBtn.classList.add('active');
      if (radioFilterAllBtn) radioFilterAllBtn.classList.remove('active');
      renderRadios();
    });
  }

  let radioHlsInstance = null;

  function playRadio(radio) {
    activeRadio = radio;
    const stream = (radio.streamUrl || '').trim();

    if (radioHlsInstance) {
      radioHlsInstance.destroy();
      radioHlsInstance = null;
    }

    if (stream.includes('.m3u8') && typeof Hls !== 'undefined' && Hls.isSupported()) {
      radioHlsInstance = new Hls({ enableWorker: true });
      radioHlsInstance.loadSource(stream);
      radioHlsInstance.attachMedia(audioEl);
      radioHlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        audioEl.play().catch(e => console.log('Radio autoplay prevented:', e));
      });
      radioHlsInstance.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.warn('Radio HLS error, fallback to direct src:', data);
          audioEl.src = stream;
          audioEl.play().catch(e => console.log('Direct audio play error:', e));
        }
      });
    } else {
      audioEl.src = stream;
      audioEl.play().catch(e => {
        console.log('Audio autoplay prevented:', e);
      });
    }
    
    audioRadioName.textContent = radio.name;
    audioRadioDesc.textContent = radio.description || 'بث صوّتي حي ومباشر';
    audioPlayerBar.classList.add('active');
    audioPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

    renderRadios();
  }

  if (audioPlayPauseBtn) {
    audioPlayPauseBtn.addEventListener('click', () => {
      if (audioEl.paused) {
        audioEl.play();
        audioPlayPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      } else {
        audioEl.pause();
        audioPlayPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    });
  }

  // --- 11. RENDER HIGHLIGHTS VOD ---
  function renderHighlights() {
    if (!highlightsGrid) return;
    highlightsGrid.innerHTML = highlights.map(h => `
      <div class="channel-card" style="align-items: stretch; text-align: right;" onclick="playHighlight('${h.videoUrl}')">
        <div style="position: relative; width: 100%; height: 140px; margin-bottom: 10px; border-radius: var(--radius-sm); overflow: hidden;">
          <img src="${h.thumbnail}" style="width: 100%; height: 100%; object-fit: cover;">
          <span style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.8); color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem;">${h.duration}</span>
        </div>
        <div class="channel-name" style="font-size: 0.9rem; line-height: 1.4;">${h.title}</div>
        <div class="channel-meta" style="margin-top: 6px;">
          <span>👁️ ${h.views}</span> • <span>${h.category}</span>
        </div>
      </div>
    `).join('');
  }

  window.playHighlight = (videoUrl) => {
    const isHls = videoUrl && videoUrl.includes('.m3u8');
    if (isHls && mainVideo) {
      mainIframe.style.display = 'none';
      mainIframe.src = '';
      mainVideo.style.display = 'block';
      if (mainVideo.canPlayType('application/vnd.apple.mpegurl')) {
        mainVideo.src = videoUrl;
        mainVideo.play().catch(() => {});
      } else if (window.Hls && Hls.isSupported()) {
        if (hlsInstance) hlsInstance.destroy();
        hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(videoUrl);
        hlsInstance.attachMedia(mainVideo);
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
          mainVideo.play().catch(() => {});
        });
      }
    } else {
      if (mainVideo) {
        mainVideo.pause();
        mainVideo.style.display = 'none';
      }
      mainIframe.style.display = 'block';
      mainIframe.src = videoUrl;
    }
    playerChannelName.textContent = 'ملخص فيديو مميز';
    if (playerCard) {
      playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Favorites Filter Button
  if (showFavsBtn) {
    showFavsBtn.addEventListener('click', () => {
      currentCategory = 'favs';
      currentFavSubFilter = 'all';
      if (favFilterAllBtn) favFilterAllBtn.classList.add('active');
      if (favFilterChannelsBtn) favFilterChannelsBtn.classList.remove('active');
      if (favFilterRadiosBtn) favFilterRadiosBtn.classList.remove('active');
      renderCategories();
      filterAndRenderChannels();
      const channelsSection = document.getElementById('channelsSection');
      if (channelsSection) {
        channelsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // --- ANDROID SMARTPHONE 4-SECTION VIEW SWITCHER LOGIC ---
  const androidBottomNav = document.getElementById('androidBottomNav');
  const androidTabChannels = document.getElementById('androidTabChannels');
  const androidTabMatches = document.getElementById('androidTabMatches');
  const androidTabRadio = document.getElementById('androidTabRadio');
  const androidTabNews = document.getElementById('androidTabNews');
  const androidTabFavs = document.getElementById('androidTabFavs');

  const siteHeaderTitle = document.getElementById('siteHeaderTitle');
  const siteHeaderSubtitle = document.getElementById('siteHeaderSubtitle');

  function switchAndroidTab(tabKey) {
    document.body.dataset.androidTab = tabKey;

    if (androidBottomNav) {
      androidBottomNav.querySelectorAll('.android-nav-item').forEach(el => el.classList.remove('active'));
      let activeEl = null;
      if (tabKey === 'channels') activeEl = androidTabChannels;
      else if (tabKey === 'matches') activeEl = androidTabMatches;
      else if (tabKey === 'radio') activeEl = androidTabRadio;
      else if (tabKey === 'news') activeEl = androidTabNews;
      else if (tabKey === 'favs') activeEl = androidTabFavs;
      if (activeEl) activeEl.classList.add('active');
    }

    // Android tactile haptic vibration
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(12); } catch (_) {}
    }

    // Dynamic Top App Bar Title & Subtitle + Search Placeholder for each section
    if (tabKey === 'channels') {
      if (siteHeaderTitle) siteHeaderTitle.textContent = 'بث مباشر للقنوات الفضائية';
      if (siteHeaderSubtitle) siteHeaderSubtitle.textContent = `arabialivetv.com • ${channels.length} قناة`;
      if (searchInput) {
        searchInput.placeholder = 'ابحث عن قناة فضائية، فريق، أو تصنيف...';
        searchInput.value = '';
      }
      if (currentCategory === 'favs') {
        currentCategory = 'all';
        renderCategories();
      }
      filterAndRenderChannels();
    } else if (tabKey === 'matches') {
      if (siteHeaderTitle) siteHeaderTitle.textContent = 'جدول ومواعيد المباريات';
      if (siteHeaderSubtitle) siteHeaderSubtitle.textContent = 'بث حي وسيرفرات مباشرة للمباريات';
      if (searchInput) {
        searchInput.placeholder = 'ابحث عن مباراة، فريق، أو دوري...';
        searchInput.value = '';
      }
      renderMatches();
    } else if (tabKey === 'radio') {
      if (siteHeaderTitle) siteHeaderTitle.textContent = 'إذاعات الراديو المباشرة';
      if (siteHeaderSubtitle) siteHeaderSubtitle.textContent = `استمع لأشهر المحطات العربية (${radios.length} إذاعة)`;
      if (searchInput) {
        searchInput.placeholder = 'ابحث عن محطة راديو...';
        searchInput.value = '';
      }
      renderRadios();
    } else if (tabKey === 'news') {
      if (siteHeaderTitle) siteHeaderTitle.textContent = 'الأخبار الرياضية العاجلة';
      if (siteHeaderSubtitle) siteHeaderSubtitle.textContent = 'تغطيات حصرية وتقارير موثقة';
      if (searchInput) {
        searchInput.placeholder = 'ابحث في الأخبار والتقارير الرياضية...';
        searchInput.value = '';
      }
      renderSportsNews();
    } else if (tabKey === 'favs') {
      if (siteHeaderTitle) siteHeaderTitle.textContent = 'قائمتي المفضلة';
      if (siteHeaderSubtitle) siteHeaderSubtitle.textContent = `لديك (${favorites.length}) قناة و (${radioFavorites.length}) إذاعة مضافة للمفضلة`;
      if (searchInput) {
        searchInput.placeholder = 'ابحث في قنواتك وإذاعاتك المفضلة...';
        searchInput.value = '';
      }
      currentCategory = 'favs';
      currentFavSubFilter = 'all';
      if (favFilterAllBtn) favFilterAllBtn.classList.add('active');
      if (favFilterChannelsBtn) favFilterChannelsBtn.classList.remove('active');
      if (favFilterRadiosBtn) favFilterRadiosBtn.classList.remove('active');
      renderCategories();
      filterAndRenderChannels();
    }

    // Instant top scroll when switching views on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Set default tab on load
  document.body.dataset.androidTab = 'channels';

  if (androidTabChannels) {
    androidTabChannels.addEventListener('click', (e) => {
      e.preventDefault();
      switchAndroidTab('channels');
    });
  }

  if (androidTabMatches) {
    androidTabMatches.addEventListener('click', (e) => {
      e.preventDefault();
      switchAndroidTab('matches');
    });
  }

  if (androidTabRadio) {
    androidTabRadio.addEventListener('click', (e) => {
      e.preventDefault();
      switchAndroidTab('radio');
    });
  }

  if (androidTabNews) {
    androidTabNews.addEventListener('click', (e) => {
      e.preventDefault();
      switchAndroidTab('news');
    });
  }

  if (androidTabFavs) {
    androidTabFavs.addEventListener('click', (e) => {
      e.preventDefault();
      switchAndroidTab('favs');
    });
  }

  // Intelligent Search Listener: searches within whichever section the user is currently viewing!
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const activeTab = document.body.dataset.androidTab || 'channels';
      const q = searchInput.value.trim().toLowerCase();
      if (activeTab === 'matches') {
        renderMatches(q);
      } else if (activeTab === 'radio') {
        renderRadios(q);
      } else if (activeTab === 'news') {
        renderSportsNews(q);
      } else {
        filterAndRenderChannels();
      }
    });
  }

  // Player Favorite toggle listener
  if (playerFavBtn) {
    playerFavBtn.addEventListener('click', () => {
      if (activeChannel) toggleFavorite(activeChannel.id);
    });
  }

  // Fullscreen button logic
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      const activeEl = (mainVideo && mainVideo.style.display !== 'none') ? mainVideo : mainIframe;
      if (activeEl.requestFullscreen) {
        activeEl.requestFullscreen();
      } else if (activeEl.webkitRequestFullscreen) {
        activeEl.webkitRequestFullscreen();
      }
    });
  }

  // --- DEEP LINKING & SEO ROUTE SUPPORT (?ch= / ?channel= / /channel/:slug) ---
  const urlParams = new URLSearchParams(window.location.search);
  let requestedChId = urlParams.get('ch') || urlParams.get('channel');

  // Also support clean path routing: /channel/:slugOrId or /ch/:id
  const pathParts = window.location.pathname.split('/').filter(Boolean);
  if (!requestedChId && pathParts.length >= 2 && (pathParts[0] === 'channel' || pathParts[0] === 'ch')) {
    const rawParam = decodeURIComponent(pathParts[1]);
    const m = rawParam.match(/(ch-\d+)/i);
    requestedChId = m ? m[1] : rawParam;
  }

  let targetChannel = null;
  if (requestedChId) {
    targetChannel = channels.find(c => c.id === requestedChId) ||
                    channels.find(c => generateSeoSlug(c.name) === generateSeoSlug(requestedChId)) ||
                    channels.find(c => c.name && c.name.toLowerCase().includes(requestedChId.toLowerCase()));
  }

  if (targetChannel) {
    activeChannel = targetChannel;
    playChannel(activeChannel, true); // Scroll smoothly to player screen
  } else {
    // Play default channel selected by admin (or first channel)
    activeChannel = channels.find(c => c.isDefault) || channels.find(c => c.isFeatured) || channels[0];
    playChannel(activeChannel, false);
  }

  // Handle Radio Deep Linking
  const requestedRadioId = urlParams.get('radio') || urlParams.get('rad');
  if (requestedRadioId) {
    const targetRadio = radios.find(r => r.id === requestedRadioId);
    if (targetRadio) {
      setTimeout(() => {
        playRadio(targetRadio);
        const radioSec = document.getElementById('radioSection');
        if (radioSec) radioSec.scrollIntoView({ behavior: 'smooth' });
      }, 600);
    }
  }

  // Handle Match Deep Linking
  const requestedMatchId = urlParams.get('match');
  if (requestedMatchId) {
    const targetMatch = matches.find(m => m.id === requestedMatchId);
    if (targetMatch && typeof openMatchModal === 'function') {
      setTimeout(() => {
        openMatchModal(targetMatch);
      }, 600);
    }
  }

  // Handle browser back/forward buttons (SPA navigation)
  window.addEventListener('popstate', (e) => {
    const params = new URLSearchParams(window.location.search);
    const chId = params.get('ch') || params.get('channel');
    if (chId && (!activeChannel || activeChannel.id !== chId)) {
      const ch = channels.find(c => c.id === chId);
      if (ch) playChannel(ch, true);
    }
  });

  // ==================== CERTIFICATES GALLERY ENGINE ====================
  function initCertificatesGallery() {
    const certsCategoriesContainer = document.getElementById('certsCategoriesContainer');
    const certsGrid = document.getElementById('certsGrid');
    const certSearchInput = document.getElementById('certSearchInput');
    const certSortSelect = document.getElementById('certSortSelect');
    const certsCountNum = document.getElementById('certsCountNum');
    
    // Modal Elements
    const certModalOverlay = document.getElementById('certModalOverlay');
    const certModalCloseBtn = document.getElementById('certModalCloseBtn');
    const certModalImg = document.getElementById('certModalImg');
    const certModalIframe = document.getElementById('certModalIframe');
    const certModalCategoryBadge = document.getElementById('certModalCategoryBadge');
    const certModalDateText = document.getElementById('certModalDateText');
    const certModalTitleAr = document.getElementById('certModalTitleAr');
    const certModalTitleEn = document.getElementById('certModalTitleEn');
    const certModalIssuer = document.getElementById('certModalIssuer');
    const certModalDesc = document.getElementById('certModalDesc');
    const certModalPdfBtn = document.getElementById('certModalPdfBtn');
    const certModalImgBtn = document.getElementById('certModalImgBtn');

    if (!certsGrid || typeof CERTIFICATES_DATA === 'undefined') return;

    let selectedCertCategory = 'all';
    let currentCertSortOrder = 'desc'; // 'desc' = Newest to Oldest (by Date)
    let certSearchQuery = '';

    // Render Category Pills
    function renderCertCategories() {
      if (!certsCategoriesContainer) return;
      certsCategoriesContainer.innerHTML = CERTIFICATES_CATEGORIES.map(cat => `
        <button class="certs-cat-btn ${selectedCertCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
          <i class="fa-solid ${cat.icon}"></i> ${cat.name}
        </button>
      `).join('');

      certsCategoriesContainer.querySelectorAll('.certs-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          selectedCertCategory = btn.dataset.catId;
          renderCertCategories();
          renderCertificates();
        });
      });
    }

    // Filter, Sort by Date, and Render Certificates
    function renderCertificates() {
      let filtered = [...CERTIFICATES_DATA];

      // 1. Category Filter
      if (selectedCertCategory !== 'all') {
        filtered = filtered.filter(c => c.category === selectedCertCategory);
      }

      // 2. Search Query Filter
      if (certSearchQuery) {
        const q = certSearchQuery.toLowerCase();
        filtered = filtered.filter(c => 
          c.titleAr.toLowerCase().includes(q) || 
          c.titleEn.toLowerCase().includes(q) || 
          c.issuer.toLowerCase().includes(q) ||
          c.date.includes(q)
        );
      }

      // 3. Chronological Date Sorting (desc = newest first, asc = oldest first)
      filtered.sort((a, b) => {
        const dA = new Date(a.date);
        const dB = new Date(b.date);
        return currentCertSortOrder === 'desc' ? dB - dA : dA - dB;
      });

      if (certsCountNum) certsCountNum.textContent = filtered.length;

      if (filtered.length === 0) {
        certsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <i class="fa-solid fa-award" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.4;"></i>
            <h3>لا توجد شهادات مطابقة للبحث أو التصفية الحالية</h3>
            <p>يرجى اختيار تخصص آخر أو مسح كلمة البحث.</p>
          </div>
        `;
        return;
      }

      certsGrid.innerHTML = filtered.map(cert => `
        <div class="cert-card" data-cert-id="${cert.id}">
          <div class="cert-thumb-wrapper" onclick="openCertModal('${cert.id}')">
            <img src="${cert.imageUrl || cert.pdfUrl}" alt="${cert.titleAr}" class="cert-thumb-img" onerror="this.src='./certs/images/G.png'">
            <span class="cert-badge-overlay ${cert.badgeClass || ''}">${cert.categoryAr}</span>
            <span class="cert-date-overlay"><i class="fa-solid fa-calendar-day"></i> ${cert.date}</span>
          </div>

          <div class="cert-body">
            <h3 class="cert-title-ar">${cert.titleAr}</h3>
            <h4 class="cert-title-en">${cert.titleEn}</h4>

            <div class="cert-issuer-line">
              <i class="fa-solid fa-building-columns" style="color: var(--secondary);"></i>
              <span>${cert.issuer}</span>
            </div>

            <div class="cert-card-actions">
              <button class="btn-icon btn-primary" onclick="openCertModal('${cert.id}')" style="flex:1; justify-content:center;">
                <i class="fa-solid fa-eye"></i> معاينة الشهادة
              </button>
              ${cert.pdfUrl ? `
                <a href="${cert.pdfUrl}" target="_blank" class="btn-icon" style="color: var(--accent); border-color: rgba(0,230,118,0.4);" title="تحميل/فتح ملف PDF الأصلي">
                  <i class="fa-solid fa-file-pdf"></i>
                </a>
              ` : ''}
            </div>
          </div>
        </div>
      `).join('');
    }

    // Window global modal opener
    window.openCertModal = function(certId) {
      const cert = CERTIFICATES_DATA.find(c => c.id === certId);
      if (!cert || !certModalOverlay) return;

      certModalCategoryBadge.textContent = cert.categoryAr;
      certModalDateText.textContent = cert.date;
      certModalTitleAr.textContent = cert.titleAr;
      certModalTitleEn.textContent = cert.titleEn;
      certModalIssuer.textContent = cert.issuer;
      certModalDesc.textContent = cert.description;

      if (cert.imageUrl) {
        certModalImg.src = cert.imageUrl;
        certModalImg.style.display = 'block';
        certModalIframe.style.display = 'none';
        certModalImgBtn.href = cert.imageUrl;
        certModalImgBtn.style.display = 'inline-flex';
      } else {
        certModalImg.style.display = 'none';
        certModalImgBtn.style.display = 'none';
      }

      if (cert.pdfUrl) {
        certModalPdfBtn.href = cert.pdfUrl;
        certModalPdfBtn.style.display = 'inline-flex';
        if (!cert.imageUrl) {
          certModalIframe.src = cert.pdfUrl;
          certModalIframe.style.display = 'block';
        }
      } else {
        certModalPdfBtn.style.display = 'none';
      }

      certModalOverlay.style.display = 'flex';
    };

    if (certModalCloseBtn) {
      certModalCloseBtn.addEventListener('click', () => {
        certModalOverlay.style.display = 'none';
      });
    }

    if (certModalOverlay) {
      certModalOverlay.addEventListener('click', (e) => {
        if (e.target === certModalOverlay) certModalOverlay.style.display = 'none';
      });
    }

    if (certSearchInput) {
      certSearchInput.addEventListener('input', (e) => {
        certSearchQuery = e.target.value.trim();
        renderCertificates();
      });
    }

    if (certSortSelect) {
      certSortSelect.addEventListener('change', (e) => {
        currentCertSortOrder = e.target.value;
        renderCertificates();
      });
    }

    renderCertCategories();
    renderCertificates();
  }

  // --- PERFECT HEIGHT SYNCHRONIZATION WITH ADJACENT PLAYER CARD ---
  function syncMatchCenterHeight() {
    const matchesCard = document.getElementById('matchesCard');
    if (!matchesCard || !playerCard) return;

    if (window.innerWidth > 1024) {
      const playerH = playerCard.offsetHeight;
      if (playerH > 250) {
        matchesCard.style.height = playerH + 'px';
        matchesCard.style.maxHeight = playerH + 'px';
      }
    } else {
      matchesCard.style.height = 'auto';
      matchesCard.style.maxHeight = 'none';
    }
  }

  window.addEventListener('resize', syncMatchCenterHeight);
  if (typeof ResizeObserver !== 'undefined' && playerCard) {
    const ro = new ResizeObserver(() => syncMatchCenterHeight());
    ro.observe(playerCard);
  }

  renderMatches();
  renderSportsNews();
  renderRadios();
  renderHighlights();
  initCertificatesGallery();

  setTimeout(syncMatchCenterHeight, 100);
  setTimeout(syncMatchCenterHeight, 600);
});
