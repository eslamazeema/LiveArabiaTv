/**
 * بث مباشر للقنوات الفضائية (arabialivetv.com) - Universal Stream Player Engine
 * Supports Per-Channel & Per-Radio Deep-Linking and Social Sharing
 */

document.addEventListener('DOMContentLoaded', () => {
  // PRESERVE USER-EDITED DATA IN LOCALSTORAGE; INITIALIZE DEFAULTS IF EMPTY
  if (!localStorage.getItem('altv_channels')) {
    localStorage.setItem('altv_channels', JSON.stringify(DEFAULT_CHANNELS));
  }
  if (!localStorage.getItem('altv_matches')) {
    localStorage.setItem('altv_matches', JSON.stringify(DEFAULT_MATCHES));
  }
  if (!localStorage.getItem('altv_sports_news')) {
    localStorage.setItem('altv_sports_news', JSON.stringify(DEFAULT_SPORTS_NEWS));
  }
  if (!localStorage.getItem('altv_radios')) {
    localStorage.setItem('altv_radios', JSON.stringify(DEFAULT_RADIOS));
  }

  // Initialize state from LocalStorage or channels_data.js defaults
  let categories = JSON.parse(localStorage.getItem('altv_categories')) || DEFAULT_CATEGORIES;
  let channels = JSON.parse(localStorage.getItem('altv_channels')) || DEFAULT_CHANNELS;
  let matches = JSON.parse(localStorage.getItem('altv_matches')) || DEFAULT_MATCHES;
  let sportsNews = JSON.parse(localStorage.getItem('altv_sports_news')) || DEFAULT_SPORTS_NEWS;
  let radios = JSON.parse(localStorage.getItem('altv_radios')) || DEFAULT_RADIOS;
  let highlights = JSON.parse(localStorage.getItem('altv_highlights')) || DEFAULT_HIGHLIGHTS;
  let favorites = JSON.parse(localStorage.getItem('altv_favorites')) || [];

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
  const serverSelector = document.getElementById('serverSelector');

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

    // Update URL hash for per-channel deep-linking
    window.location.hash = channel.id;

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
      mainIframe.src = streamUrl;
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

    const shareUrl = `${window.location.origin}${window.location.pathname}#${channel.id}`;
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

    const shareUrl = `${window.location.origin}${window.location.pathname}#${radio.id}`;
    const shareText = `استمع الآن إلى بث حي ومباشر لإذاعة "${radio.name}" بصوت نقي عبر منصة arabialivetv.com 🎙️📻:`;

    if (shareWhatsapp) shareWhatsapp.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    if (shareFacebook) shareFacebook.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (shareTelegram) shareTelegram.href = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    if (shareTwitter) shareTwitter.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    if (shareLinkInput) shareLinkInput.value = shareUrl;

    window.location.hash = radio.id;
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
    let activeChannelsList = JSON.parse(localStorage.getItem('altv_channels')) || channels;
    let result = activeChannelsList;

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
        const activeChannelsList = JSON.parse(localStorage.getItem('altv_channels')) || channels;
        const targetCh = activeChannelsList.find(c => c.id === chId);
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
    localStorage.setItem('altv_favorites', JSON.stringify(favorites));
    filterAndRenderChannels();
    if (activeChannel && activeChannel.id === chId) {
      playChannel(activeChannel, false);
    }
  }

  // --- 8. RENDER DAILY MATCH CENTER & LIVE STREAM MODAL ---
  function renderMatches() {
    if (!matchesList) return;
    const activeMatches = JSON.parse(localStorage.getItem('altv_matches')) || matches;
    matchesList.innerHTML = activeMatches.map(m => `
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
        const activeMatchesList = JSON.parse(localStorage.getItem('altv_matches')) || matches;
        const targetMatch = activeMatchesList.find(m => m.id === mId);
        if (targetMatch) openMatchModal(targetMatch);
      });
    });
  }

  function openMatchModal(match) {
    if (!matchModalBackdrop) return;

    modalMatchTitle.innerHTML = `⚽ مشاهدة مباراة: ${match.homeTeam} vs ${match.awayTeam} بث مباشر`;
    modalMatchMeta.textContent = `🏆 ${match.league} • 🎤 المعلق: ${match.commentator || 'غير محدد'} • 📍 ${match.stadium || 'الملعب الرئيسي'}`;

    const servers = match.servers && match.servers.length > 0 ? match.servers : [
      { name: 'سيرفر 1 (HLS HD Direct)', url: 'https://live-hls-web-aje.akamaized.net/v1/master/053b922097368021ef37d806509f6e4a2432a688/aljazeera-arabic/index.m3u8' },
      { name: 'سيرفر 2 (YouTube Stream)', url: 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1' }
    ];

    serverSelector.innerHTML = servers.map((srv, idx) => `
      <button class="server-btn ${idx === 0 ? 'active' : ''}" data-url="${srv.url}">
        <i class="fa-solid fa-server"></i> ${srv.name}
      </button>
    `).join('');

    modalPlayerFrame.src = servers[0].url;

    serverSelector.querySelectorAll('.server-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        serverSelector.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        modalPlayerFrame.src = btn.dataset.url;
      });
    });

    matchModalBackdrop.classList.add('active');
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      matchModalBackdrop.classList.remove('active');
      modalPlayerFrame.src = '';
    });
  }

  if (matchModalBackdrop) {
    matchModalBackdrop.addEventListener('click', (e) => {
      if (e.target === matchModalBackdrop) {
        matchModalBackdrop.classList.remove('active');
        modalPlayerFrame.src = '';
      }
    });
  }

  // --- 9. RENDER REALTIME SPORTS NEWS GRID & FULL ARTICLE MODAL ---
  function renderSportsNews() {
    if (!sportsNewsGrid) return;
    const activeNews = JSON.parse(localStorage.getItem('altv_sports_news')) || sportsNews;
    sportsNewsGrid.innerHTML = activeNews.map(news => `
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
        const activeNewsList = JSON.parse(localStorage.getItem('altv_sports_news')) || sportsNews;
        const targetNews = activeNewsList.find(n => n.id === nId);
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
    const activeRadios = JSON.parse(localStorage.getItem('altv_radios')) || radios;
    radioGrid.innerHTML = activeRadios.map(r => `
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
        const activeRadiosList = JSON.parse(localStorage.getItem('altv_radios')) || radios;
        const selectedRadio = activeRadiosList.find(r => r.id === rId);
        if (selectedRadio) playRadio(selectedRadio);
      });
    });

    radioGrid.querySelectorAll('.share-radio-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rId = btn.dataset.radioId;
        const activeRadiosList = JSON.parse(localStorage.getItem('altv_radios')) || radios;
        const targetRad = activeRadiosList.find(r => r.id === rId);
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

  const activeChannelsList = JSON.parse(localStorage.getItem('altv_channels')) || channels;
  const activeRadiosList = JSON.parse(localStorage.getItem('altv_radios')) || radios;

  // Auto-play from URL Hash (Radio or TV Channel)
  if (window.location.hash) {
    const hashId = window.location.hash.replace('#', '');
    const targetChannel = activeChannelsList.find(c => c.id === hashId);
    const targetRadio = activeRadiosList.find(r => r.id === hashId);

    if (targetChannel) {
      playChannel(targetChannel, false);
    } else if (targetRadio) {
      playRadio(targetRadio);
      const radioSec = document.getElementById('radioSection');
      if (radioSec) radioSec.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      activeChannel = activeChannelsList.find(c => c.isFeatured) || activeChannelsList[0];
      playChannel(activeChannel, false);
    }
  } else {
    activeChannel = activeChannelsList.find(c => c.isFeatured) || activeChannelsList[0];
    playChannel(activeChannel, false);
  }

  renderMatches();
  renderSportsNews();
  renderRadios();
  renderHighlights();
});
