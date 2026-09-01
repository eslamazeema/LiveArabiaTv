/**
 * Arabia Live TV (arabialivetv.com) - Authenticated Admin Control Panel Logic (Full TV, Match, News & Radio CRUD)
 */

document.addEventListener('DOMContentLoaded', () => {
  // Credentials (Default: admin / admin123)
  const ADMIN_USER = 'admin';
  const ADMIN_PASS = 'admin123';

  // DOM Auth Elements
  const loginBackdrop = document.getElementById('loginBackdrop');
  const adminMainContent = document.getElementById('adminMainContent');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  // Check Auth State
  function checkAuth() {
    const isAuth = sessionStorage.getItem('altv_admin_auth') === 'true';
    if (isAuth) {
      if (loginBackdrop) loginBackdrop.classList.remove('active');
      if (adminMainContent) adminMainContent.style.display = 'block';
    } else {
      if (loginBackdrop) loginBackdrop.classList.add('active');
      if (adminMainContent) adminMainContent.style.display = 'none';
    }
  }

  // Handle Login
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('loginUsername').value.trim();
      const p = document.getElementById('loginPassword').value.trim();

      if (u === ADMIN_USER && p === ADMIN_PASS) {
        sessionStorage.setItem('altv_admin_auth', 'true');
        loginErrorMsg.style.display = 'none';
        checkAuth();
        renderAllTables();
      } else {
        loginErrorMsg.style.display = 'block';
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('altv_admin_auth');
      checkAuth();
    });
  }

  // Smart iFrame Code & YouTube URL Converter Helper
  function formatStreamUrl(url) {
    if (!url) return '';
    url = url.trim();

    // If user pasted full <iframe> tag: <iframe src="https://..." ...></iframe>
    if (url.includes('<iframe') && url.includes('src=')) {
      const match = url.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) {
        url = match[1];
      }
    }

    // YouTube watch link: https://www.youtube.com/watch?v=ID
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    // YouTube short link: https://youtu.be/ID
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }

    return url;
  }

  // Load data or defaults
  let channels = JSON.parse(localStorage.getItem('altv_channels')) || DEFAULT_CHANNELS;
  let matches = JSON.parse(localStorage.getItem('altv_matches')) || DEFAULT_MATCHES;
  let sportsNews = JSON.parse(localStorage.getItem('altv_sports_news')) || DEFAULT_SPORTS_NEWS;
  let radios = JSON.parse(localStorage.getItem('altv_radios')) || DEFAULT_RADIOS;

  // DOM Data Elements
  const channelsTableBody = document.getElementById('channelsTableBody');
  const matchesTableBody = document.getElementById('matchesTableBody');
  const sportsNewsTableBody = document.getElementById('sportsNewsTableBody');
  const radiosTableBody = document.getElementById('radiosTableBody');

  const addChannelForm = document.getElementById('addChannelForm');
  const addMatchForm = document.getElementById('addMatchForm');
  const addNewsForm = document.getElementById('addNewsForm');
  const addRadioForm = document.getElementById('addRadioForm');
  const resetDataBtn = document.getElementById('resetDataBtn');

  // EDIT MODAL ELEMENTS (TV CHANNEL)
  const editChannelModalBackdrop = document.getElementById('editChannelModalBackdrop');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const editChannelForm = document.getElementById('editChannelForm');

  // EDIT MODAL ELEMENTS (RADIO)
  const editRadioModalBackdrop = document.getElementById('editRadioModalBackdrop');
  const closeEditRadioModalBtn = document.getElementById('closeEditRadioModalBtn');
  const editRadioForm = document.getElementById('editRadioForm');

  // RENDER CHANNELS TABLE WITH EDIT & DELETE
  function renderChannelsTable() {
    if (!channelsTableBody) return;
    channelsTableBody.innerHTML = channels.map((ch) => `
      <tr>
        <td>
          <img src="${ch.logo}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-left:8px; background:#fff;">
          <strong>${ch.name}</strong>
        </td>
        <td><span class="badge-quality">${ch.category}</span></td>
        <td>${ch.country}</td>
        <td>${ch.quality}</td>
        <td><code style="font-size:0.7rem; color:var(--text-muted);">${(ch.streamUrl || '').substring(0, 30)}...</code></td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn-icon" onclick="editChannel('${ch.id}')" style="color: var(--primary); border-color: rgba(0,230,118,0.4);">
              <i class="fa-solid fa-pen"></i> تعديل
            </button>
            <button class="btn-icon" onclick="deleteChannel('${ch.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3);">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // RENDER MATCHES TABLE
  function renderMatchesTable() {
    if (!matchesTableBody) return;
    matchesTableBody.innerHTML = matches.map((m) => `
      <tr>
        <td>${m.leagueFlag} ${m.league}</td>
        <td><strong>${m.homeTeam}</strong> vs <strong>${m.awayTeam}</strong></td>
        <td>${m.date} ${m.time}</td>
        <td>
          <span class="match-status-tag ${m.status === 'live' ? 'status-live' : 'status-upcoming'}">
            ${m.status === 'live' ? 'مباشر' : 'قريباً'}
          </span>
        </td>
        <td>${m.channelName}</td>
        <td>
          <button class="btn-icon" onclick="deleteMatch('${m.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3);">
            <i class="fa-solid fa-trash"></i> حذف
          </button>
        </td>
      </tr>
    `).join('');
  }

  // RENDER SPORTS NEWS TABLE
  function renderSportsNewsTable() {
    if (!sportsNewsTableBody) return;
    sportsNewsTableBody.innerHTML = sportsNews.map((news) => `
      <tr>
        <td>
          <img src="${news.image}" style="width:44px; height:30px; border-radius:4px; object-fit:cover; vertical-align:middle; margin-left:8px;">
          <strong>${news.title}</strong>
        </td>
        <td><span class="badge-quality">${news.category}</span></td>
        <td>${news.timeAgo}</td>
        <td>
          <button class="btn-icon" onclick="deleteNews('${news.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3);">
            <i class="fa-solid fa-trash"></i> حذف
          </button>
        </td>
      </tr>
    `).join('');
  }

  // RENDER RADIOS TABLE WITH EDIT & DELETE
  function renderRadiosTable() {
    if (!radiosTableBody) return;
    radiosTableBody.innerHTML = radios.map((r) => `
      <tr>
        <td>
          <i class="fa-solid ${r.icon || 'fa-radio'}" style="color: var(--secondary); margin-left:8px; font-size: 1.1rem;"></i>
          <strong>${r.name}</strong>
        </td>
        <td>${r.country || 'عربي'}</td>
        <td><code style="font-size:0.7rem; color:var(--text-muted);">${(r.streamUrl || '').substring(0, 35)}...</code></td>
        <td>${r.description || 'بث صوتي مباشر'}</td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn-icon" onclick="editRadio('${r.id}')" style="color: var(--secondary); border-color: rgba(0,176,255,0.4);">
              <i class="fa-solid fa-pen"></i> تعديل
            </button>
            <button class="btn-icon" onclick="deleteRadio('${r.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3);">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // OPEN EDIT CHANNEL MODAL
  window.editChannel = (id) => {
    const ch = channels.find(c => c.id === id);
    if (!ch) return;

    document.getElementById('editChId').value = ch.id;
    document.getElementById('editChName').value = ch.name;
    document.getElementById('editChCategory').value = ch.category;
    document.getElementById('editChCountry').value = ch.country || '';
    document.getElementById('editChQuality').value = ch.quality || 'HD';
    document.getElementById('editChStreamUrl').value = ch.streamUrl || '';
    document.getElementById('editChLogo').value = ch.logo || '';
    document.getElementById('editChDesc').value = ch.description || '';

    editChannelModalBackdrop.classList.add('active');
  };

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', () => {
      editChannelModalBackdrop.classList.remove('active');
    });
  }

  // SAVE EDITED CHANNEL
  if (editChannelForm) {
    editChannelForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editChId').value;
      const idx = channels.findIndex(c => c.id === id);

      if (idx !== -1) {
        const rawUrl = document.getElementById('editChStreamUrl').value.trim();
        const formattedUrl = formatStreamUrl(rawUrl);

        channels[idx] = {
          ...channels[idx],
          name: document.getElementById('editChName').value.trim(),
          category: document.getElementById('editChCategory').value,
          country: document.getElementById('editChCountry').value.trim(),
          quality: document.getElementById('editChQuality').value,
          streamUrl: formattedUrl,
          fallbackUrl: formattedUrl,
          logo: document.getElementById('editChLogo').value.trim(),
          description: document.getElementById('editChDesc').value.trim()
        };

        localStorage.setItem('altv_channels', JSON.stringify(channels));
        renderChannelsTable();
        editChannelModalBackdrop.classList.remove('active');
        alert('تم تعديل القناة، استخراج رابط الإضمام iFrame وحفظ التحديثات بنجاح!');
      }
    });
  }

  // OPEN EDIT RADIO MODAL
  window.editRadio = (id) => {
    const r = radios.find(rad => rad.id === id);
    if (!r) return;

    document.getElementById('editRadId').value = r.id;
    document.getElementById('editRadName').value = r.name;
    document.getElementById('editRadCountry').value = r.country || '';
    document.getElementById('editRadStreamUrl').value = r.streamUrl || '';
    document.getElementById('editRadIcon').value = r.icon || 'fa-radio';
    document.getElementById('editRadDesc').value = r.description || '';

    editRadioModalBackdrop.classList.add('active');
  };

  if (closeEditRadioModalBtn) {
    closeEditRadioModalBtn.addEventListener('click', () => {
      editRadioModalBackdrop.classList.remove('active');
    });
  }

  // SAVE EDITED RADIO
  if (editRadioForm) {
    editRadioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = document.getElementById('editRadId').value;
      const idx = radios.findIndex(r => r.id === id);

      if (idx !== -1) {
        radios[idx] = {
          ...radios[idx],
          name: document.getElementById('editRadName').value.trim(),
          country: document.getElementById('editRadCountry').value.trim(),
          streamUrl: document.getElementById('editRadStreamUrl').value.trim(),
          icon: document.getElementById('editRadIcon').value.trim() || 'fa-radio',
          description: document.getElementById('editRadDesc').value.trim()
        };

        localStorage.setItem('altv_radios', JSON.stringify(radios));
        renderRadiosTable();
        editRadioModalBackdrop.classList.remove('active');
        alert('تم تعديل إحدى محطات الراديو وتحديث البث الصوتي بنجاح!');
      }
    });
  }

  // ADD RADIO
  if (addRadioForm) {
    addRadioForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newRad = {
        id: 'rad-' + Date.now(),
        name: document.getElementById('radName').value.trim(),
        country: document.getElementById('radCountry').value.trim() || 'عربي',
        streamUrl: document.getElementById('radStreamUrl').value.trim(),
        icon: document.getElementById('radIcon').value.trim() || 'fa-radio',
        description: document.getElementById('radDesc').value.trim() || 'بث صوّتي حي ومباشر'
      };

      radios.unshift(newRad);
      localStorage.setItem('altv_radios', JSON.stringify(radios));
      renderRadiosTable();
      addRadioForm.reset();
      alert('تم إضافة محطة الراديو بنجاح إلى البث الصوتي!');
    });
  }

  // ADD CHANNEL
  if (addChannelForm) {
    addChannelForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('chStreamUrl').value.trim();
      const formattedUrl = formatStreamUrl(rawUrl);

      const newCh = {
        id: 'ch-' + Date.now(),
        name: document.getElementById('chName').value.trim(),
        category: document.getElementById('chCategory').value,
        country: document.getElementById('chCountry').value.trim() || 'عربي',
        quality: document.getElementById('chQuality').value || 'HD',
        logo: document.getElementById('chLogo').value.trim() || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png',
        type: formattedUrl.includes('.m3u8') ? 'hls' : 'iframe',
        streamUrl: formattedUrl,
        fallbackUrl: formattedUrl,
        description: document.getElementById('chDesc').value.trim() || 'بث مباشر عالي الجودة',
        isFeatured: false,
        viewersCount: Math.floor(Math.random() * 20000) + 5000
      };

      channels.unshift(newCh);
      localStorage.setItem('altv_channels', JSON.stringify(channels));
      renderChannelsTable();
      addChannelForm.reset();
      alert('تم إضافة القناة واستخراج رابط الـ iFrame بنجاح!');
    });
  }

  // ADD MATCH
  if (addMatchForm) {
    addMatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('mStreamUrl').value.trim() || 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1';
      const formattedUrl = formatStreamUrl(rawUrl);

      const newMatch = {
        id: 'match-' + Date.now(),
        league: document.getElementById('mLeague').value.trim(),
        leagueFlag: '🏆',
        homeTeam: document.getElementById('mHomeTeam').value.trim(),
        homeLogo: '⚽',
        awayTeam: document.getElementById('mAwayTeam').value.trim(),
        awayLogo: '⚽',
        time: document.getElementById('mTime').value.trim(),
        date: document.getElementById('mDate').value.trim() || 'اليوم',
        status: document.getElementById('mStatus').value,
        channelName: document.getElementById('mChannelName').value.trim(),
        commentator: document.getElementById('mCommentator').value.trim() || 'غير محدد',
        stadium: 'الملعب الرئيسي',
        score: document.getElementById('mStatus').value === 'live' ? '0 - 0' : 'vs',
        servers: [
          { name: 'سيرفر 1 (Full HD)', url: formattedUrl },
          { name: 'سيرفر 2 (سريع بدون تقطيع)', url: 'https://www.youtube.com/embed/ww9P1LqjV2E?autoplay=1' }
        ]
      };

      matches.unshift(newMatch);
      localStorage.setItem('altv_matches', JSON.stringify(matches));
      renderMatchesTable();
      addMatchForm.reset();
      alert('تم إضافة المباراة بنجاح إلى جدول العرض والبث المباشر!');
    });
  }

  // ADD SPORTS NEWS
  if (addNewsForm) {
    addNewsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newArticle = {
        id: 'news-' + Date.now(),
        title: document.getElementById('newsTitle').value.trim(),
        summary: document.getElementById('newsSummary').value.trim(),
        category: document.getElementById('newsCategory').value.trim() || 'كرة قدم',
        timeAgo: 'الآن',
        image: document.getElementById('newsImage').value.trim() || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500',
        author: 'التحرير الرياضي'
      };

      sportsNews.unshift(newArticle);
      localStorage.setItem('altv_sports_news', JSON.stringify(sportsNews));
      renderSportsNewsTable();
      addNewsForm.reset();
      alert('تم نشر الخبر الرياضي بنجاح!');
    });
  }

  // DELETE HANDLERS
  window.deleteChannel = (id) => {
    if (confirm('هل أنت تأكد من رغبتك في حذف هذه القناة؟')) {
      channels = channels.filter(c => c.id !== id);
      localStorage.setItem('altv_channels', JSON.stringify(channels));
      renderChannelsTable();
    }
  };

  window.deleteRadio = (id) => {
    if (confirm('هل أنت تأكد من حذف محطة الراديو هذه؟')) {
      radios = radios.filter(r => r.id !== id);
      localStorage.setItem('altv_radios', JSON.stringify(radios));
      renderRadiosTable();
    }
  };

  window.deleteMatch = (id) => {
    if (confirm('هل أنت تأكد من رغبتك في حذف هذه المباراة؟')) {
      matches = matches.filter(m => m.id !== id);
      localStorage.setItem('altv_matches', JSON.stringify(matches));
      renderMatchesTable();
    }
  };

  window.deleteNews = (id) => {
    if (confirm('هل أنت تأكد من حذف هذا الخبر الرياضي؟')) {
      sportsNews = sportsNews.filter(n => n.id !== id);
      localStorage.setItem('altv_sports_news', JSON.stringify(sportsNews));
      renderSportsNewsTable();
    }
  };

  // RESET TO DEFAULTS
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', () => {
      if (confirm('سيتم إعادة ضبط البيانات إلى الحالة الأصلية الإفتراضية. هل تريد الاستمرار؟')) {
        localStorage.removeItem('altv_channels');
        localStorage.removeItem('altv_matches');
        localStorage.removeItem('altv_sports_news');
        localStorage.removeItem('altv_radios');
        localStorage.removeItem('altv_data_version');
        location.reload();
      }
    });
  }

  function renderAllTables() {
    renderChannelsTable();
    renderRadiosTable();
    renderMatchesTable();
    renderSportsNewsTable();
  }

  // Initial Auth & Render Check
  checkAuth();
  if (sessionStorage.getItem('altv_admin_auth') === 'true') {
    renderAllTables();
  }
});
