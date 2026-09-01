/**
 * بث مباشر للقنوات الفضائية (arabialivetv.com) - Universal Stream Player & Cache Auto-Refresh Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // AUTO-REFRESH CACHE VERSION TO FORCE WORKING HLS STREAMS & EXPANDED RADIOS ON ALL DEVICES
  const CURRENT_DATA_VERSION = 'altv_v7_expanded_streams_audited';
  if (localStorage.getItem('altv_data_version') !== CURRENT_DATA_VERSION) {
    localStorage.setItem('altv_channels', JSON.stringify(DEFAULT_CHANNELS));
    localStorage.setItem('altv_matches', JSON.stringify(DEFAULT_MATCHES));
    localStorage.setItem('altv_sports_news', JSON.stringify(DEFAULT_SPORTS_NEWS));
    localStorage.setItem('altv_radios', JSON.stringify(DEFAULT_RADIOS));
    localStorage.setItem('altv_data_version', CURRENT_DATA_VERSION);
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
  let activeChannel = channels.find(c => c.isFeatured) || channels[0];
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
      '🔴 بث مباشر: قمة الأهلي والزمالك في دوري الأبطال تُعرض الآن بجميع السيرفرات.',
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

  // --- 3. UNIVERSAL STREAM PLAYER WITH AUTOMATIC SCROLL TO PLAYER AT TOP ---
  function playChannel(channel, shouldScroll = true) {
    if (!channel) return;
    activeChannel = channel;
    const streamUrl = channel.streamUrl || channel.fallbackUrl;

    // Update details
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

    // AUTOMATICALLY SCROLL TO TOP PLAYER SCREEN ON ALL DEVICES
    if (shouldScroll && playerCard) {
      playerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // --- 4. FILTER AND RENDER CHANNELS ---
  function getFilteredChannels() {
    let result = channels;

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
    localStorage.setItem('altv_favorites', JSON.stringify(favorites));
    filterAndRenderChannels();
    if (activeChannel && activeChannel.id === chId) {
      playChannel(activeChannel, false);
    }
  }

  // --- 5. RENDER DAILY MATCH CENTER & LIVE STREAM MODAL ---
  function renderMatches() {
    if (!matchesList) return;
    matchesList.innerHTML = matches.map(m => `
      <div class="match-item" data-match-id="${m.id}">
        <div class="match-league">
          <span>${m.leagueFlag} ${m.league}</span>
          <span class="match-status-tag ${m.status === 'live' ? 'status-live' : 'status-upcoming'}">
            ${m.status === 'live' ? '🔴 مباشر الآن' : `⏳ ${m.date} ${m.time}`}
          </span>
        </div>
        <div class="match-teams">
          <span>${m.homeLogo} ${m.homeTeam}</span>
          <span class="match-score">${m.score}</span>
          <span>${m.awayTeam} ${m.awayLogo}</span>
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

  function openMatchModal(match) {
    if (!matchModalBackdrop) return;

    modalMatchTitle.innerHTML = `⚽ مشاهدة مباراة: ${match.homeTeam} vs ${match.awayTeam} بث مباشر`;
    modalMatchMeta.textContent = `🏆 ${match.league} • 🎤 المعلق: ${match.commentator} • 📍 ${match.stadium || 'الملعب الرئيسي'}`;

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

  // --- 6. RENDER REALTIME SPORTS NEWS GRID & FULL ARTICLE MODAL ---
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
            <span><i class="fa-regular fa-clock" style="color: var(--primary);"></i> ${news.timeAgo}</span>
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

  // --- 7. RENDER RADIO STATIONS ---
  function renderRadios() {
    if (!radioGrid) return;
    radioGrid.innerHTML = radios.map(r => `
      <div class="radio-card ${activeRadio && activeRadio.id === r.id ? 'playing' : ''}" data-id="${r.id}">
        <div class="radio-icon">
          <i class="fa-solid ${r.icon || 'fa-radio'}"></i>
        </div>
        <div class="radio-info">
          <h4>${r.name}</h4>
          <p>${r.description}</p>
        </div>
      </div>
    `).join('');

    radioGrid.querySelectorAll('.radio-card').forEach(card => {
      card.addEventListener('click', () => {
        const rId = card.dataset.id;
        const selectedRadio = radios.find(r => r.id === rId);
        if (selectedRadio) playRadio(selectedRadio);
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

  // --- 8. RENDER HIGHLIGHTS VOD ---
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
      playerCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // Initial Boot
  initRealtimeTicker();
  renderCategories();
  playChannel(activeChannel, false); // Boot up without forced scroll
  renderMatches();
  renderSportsNews();
  renderRadios();
  renderHighlights();
});
