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
   * Arabia Live TV — Unified API Data Layer
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
      if (radData.success) radios = radData.data;

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
  const sportsNewsGrid = document.getElementById('sportsNewsGrid');
  const radioGrid = document.getElementById('radioGrid');
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
  const externalStreamBtn = document.getElementById('externalStreamBtn');

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
    categoriesContainer.innerHTML = categories.map(cat => `
      <button class="category-btn ${cat.id === currentCategory ? 'active' : ''}" data-id="${cat.id}">
        <i class="fa-solid ${cat.icon}"></i>
        <span>${cat.name}</span>
      </button>
    `).join('');

    categoriesContainer.querySelectorAll('.category-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        currentCategory = btn.dataset.id;
        renderCategories();
        filterAndRenderChannels();
      });
    });
  }

  // --- 3. UNIVERSAL STREAM PLAYER ---
  function playChannel(channel, shouldScroll = true) {
    if (!channel) return;
    activeChannel = channel;
    const streamUrl = channel.streamUrl || channel.fallbackUrl;

    // Update player details
    playerChannelLogo.src = channel.logo;
    playerChannelName.textContent = channel.name;
    playerChannelDesc.textContent = channel.description || `${channel.country} • بث حي ومباشر`;
    playerQualityBadge.textContent = channel.quality || 'HD';
    playerViewers.textContent = `${(channel.viewersCount || 15400).toLocaleString('ar-EG')} مشاهد`;

    if (externalStreamBtn) {
      externalStreamBtn.href = streamUrl;
    }

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
      mainIframe.referrerPolicy = 'no-referrer';
      mainIframe.setAttribute('referrerpolicy', 'no-referrer');
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

    const shareUrl = `${window.location.origin}/`;
    const shareText = `شاهد بث حي ومباشر لقناة "${channel.name}" بجودة عالية عبر منصة arabialivetv.com 📺:`;

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

    const shareUrl = `${window.location.origin}/`;
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
    renderChannelsGrid(getFilteredChannels());
  }

  function renderChannelsGrid(channelList) {
    if (!channelsGrid) return;
    const channelsCountSubtitle = document.getElementById('channelsCountSubtitle');
    if (channelsCountSubtitle) {
      channelsCountSubtitle.textContent = `معروض (${channelList.length}) قناة من إجمالي (${channels.length}) قناة فضائية عربية ومباشرة`;
    }
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
          <button class="fav-btn ${isFav ? 'is-fav' : ''}" data-fav-id="${ch.id}" title="إضافة للمفضلة">
            <i class="fa-${isFav ? 'solid' : 'regular'} fa-heart"></i>
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
        if (e.target.closest('.fav-btn')) return;
        const chId = card.dataset.id;
        const targetCh = channels.find(c => c.id === chId);
        if (targetCh) playChannel(targetCh, true);
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
    // Favorites are per-browser preference (intentional — each viewer has their own)
    localStorage.setItem('altv_favorites', JSON.stringify(favorites));
    filterAndRenderChannels();
    if (activeChannel && activeChannel.id === chId) {
      playChannel(activeChannel, false);
    }
  }

  // --- 8. RENDER DAILY MATCH CENTER & LIVE STREAM MODAL ---
  function renderMatches() {
    if (!matchesList) return;
    matchesList.innerHTML = matches.map(m => `
      <div class="match-item" data-match-id="${m.id}">
        <div class="match-league">
          <span>${m.leagueFlag || '🏆'} ${m.league}</span>
          <span class="match-status-tag ${m.status === 'live' ? 'status-live' : 'status-upcoming'}">
            ${m.status === 'live' ? '🔴 مباشر الآن' : `⏳ ${m.date} ${m.time}`}
          </span>
        </div>
        <div class="match-teams">
          <span>${m.homeLogo || '⚽'} ${m.homeTeam}</span>
          <span class="match-score">${m.score}</span>
          <span>${m.awayTeam} ${m.awayLogo || '⚽'}</span>
        </div>
        <div class="match-channel">
          <span><i class="fa-solid fa-tv"></i> ${m.channelName}</span>
          <button class="btn-icon btn-primary" style="padding: 4px 12px; font-size: 0.75rem;">
            <i class="fa-solid fa-circle-play"></i> مشاهدة مباشر
          </button>
        </div>
      </div>
    `).join('');

    matchesList.querySelectorAll('.match-item').forEach(item => {
      item.addEventListener('click', () => {
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
        modalPlayerFrame.src = url;
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

  // --- 9. RENDER REALTIME SPORTS NEWS GRID & FULL ARTICLE MODAL ---
  function renderSportsNews() {
    if (!sportsNewsGrid) return;
    sportsNewsGrid.innerHTML = sportsNews.map(news => `
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

  // --- 10. RENDER RADIO STATIONS WITH SOCIAL SHARE BUTTON ---
  function renderRadios() {
    if (!radioGrid) return;
    radioGrid.innerHTML = radios.map(r => `
      <div class="radio-card ${activeRadio && activeRadio.id === r.id ? 'playing' : ''}" data-id="${r.id}">
        <div class="radio-icon">
          <i class="fa-solid ${r.icon || 'fa-radio'}"></i>
        </div>
        <div class="radio-info" style="flex: 1;">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: #fff;">${r.name}</h4>
          <p style="font-size: 0.82rem; color: var(--text-muted);">${r.description || 'بث صوّتي حي ومباشر'}</p>
        </div>
        <button class="btn-icon share-radio-btn" data-radio-id="${r.id}" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 50px; color: var(--gold); border-color: rgba(255,215,0,0.4);" title="مشاركة بث إذاعة الراديو">
          <i class="fa-solid fa-share-nodes"></i> مشاركة
        </button>
      </div>
    `).join('');

    radioGrid.querySelectorAll('.radio-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.share-radio-btn')) return;
        const rId = card.dataset.id;
        const selectedRadio = radios.find(r => r.id === rId);
        if (selectedRadio) playRadio(selectedRadio);
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

  function playRadio(radio) {
    activeRadio = radio;
    audioEl.src = radio.streamUrl;
    audioEl.play().catch(e => {
      console.log('Audio autoplay prevented:', e);
    });
    
    audioRadioName.textContent = radio.name;
    audioRadioDesc.textContent = radio.description;
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
    if (mainVideo) mainVideo.style.display = 'none';
    mainIframe.style.display = 'block';
    mainIframe.src = videoUrl;
    playerChannelName.textContent = 'ملخص فيديو مميز';
    if (playerCard) {
      playerCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Search Listener
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      filterAndRenderChannels();
    });
  }

  // Favorites Filter Button
  if (showFavsBtn) {
    showFavsBtn.addEventListener('click', () => {
      currentCategory = 'favs';
      renderCategories();
      filterAndRenderChannels();
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

  // Initial Boot Logic
  initRealtimeTicker();
  renderCategories();

  // Always clean URL address bar to main domain root (removes /index.html and any #hash)
  if (window.history && window.history.replaceState) {
    let cleanPath = window.location.pathname;
    if (cleanPath.endsWith('/index.html')) {
      cleanPath = cleanPath.substring(0, cleanPath.length - 10) || '/';
    }
    window.history.replaceState(null, null, cleanPath + window.location.search);
  }

  // Play initial channel cleanly (data already loaded from API above)
  activeChannel = channels.find(c => c.isFeatured) || channels[0];
  playChannel(activeChannel, false);

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

  renderMatches();
  renderSportsNews();
  renderRadios();
  renderHighlights();
  initCertificatesGallery();
});
