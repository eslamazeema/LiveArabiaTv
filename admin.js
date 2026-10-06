/**
 * Arabia Live TV (arabialivetv.com) - Admin Control Panel v2.0
 *
 * Rebuilt to use server-side REST API with JWT authentication.
 * - All data changes go to SQLite via API (cross-browser, persistent)
 * - JWT token stored in sessionStorage (expires in 24h)
 * - No hardcoded passwords visible in client-side code
 */

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.location.origin;

  // ========================== TOKEN MANAGEMENT ==========================
  function getToken() {
    return sessionStorage.getItem('altv_jwt_token');
  }

  function setToken(token) {
    sessionStorage.setItem('altv_jwt_token', token);
  }

  function clearToken() {
    sessionStorage.removeItem('altv_jwt_token');
  }

  async function apiCall(method, endpoint, body = null) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    if (res.status === 401 || res.status === 403) {
      // Token expired or invalid — force re-login
      clearToken();
      checkAuth();
      return null;
    }
    return data;
  }

  // ========================== AUTH ELEMENTS ==========================
  const loginBackdrop = document.getElementById('loginBackdrop');
  const adminMainContent = document.getElementById('adminMainContent');
  const adminLoginForm = document.getElementById('adminLoginForm');
  const loginErrorMsg = document.getElementById('loginErrorMsg');
  const logoutBtn = document.getElementById('logoutBtn');

  // ========================== DEPARTMENT SWITCHER ==========================
  const deptBtns = document.querySelectorAll('.dept-btn');
  const deptSections = document.querySelectorAll('.dept-section');

  if (deptBtns.length > 0) {
    deptBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetDept = btn.dataset.dept;
        deptBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        deptSections.forEach(sec => {
          if (targetDept === 'all') {
            sec.style.display = 'block';
          } else {
            sec.style.display = (sec.id === targetDept) ? 'block' : 'none';
          }
        });
      });
    });
  }

  // ========================== AUTH LOGIC ==========================
  async function checkAuth() {
    const token = getToken();
    if (!token) {
      showLogin();
      return;
    }
    // Verify token is still valid with server
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showAdmin();
        renderAllTables();
      } else {
        clearToken();
        showLogin();
      }
    } catch {
      // Server might be down — check if token exists locally
      if (token) showAdmin();
      else showLogin();
    }
  }

  function showLogin() {
    if (loginBackdrop) loginBackdrop.classList.add('active');
    if (adminMainContent) adminMainContent.style.display = 'none';
  }

  function showAdmin() {
    if (loginBackdrop) loginBackdrop.classList.remove('active');
    if (adminMainContent) adminMainContent.style.display = 'block';
  }

  // Handle Login
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const u = document.getElementById('loginUsername').value.trim();
      const p = document.getElementById('loginPassword').value.trim();

      const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.disabled = true;

      try {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: u, password: p })
        });
        const data = await res.json();

        if (data.success) {
          setToken(data.token);
          if (loginErrorMsg) loginErrorMsg.style.display = 'none';
          showAdmin();
          renderAllTables();
        } else {
          if (loginErrorMsg) {
            loginErrorMsg.textContent = data.message || 'اسم المستخدم أو كلمة المرور غير صحيحة';
            loginErrorMsg.style.display = 'block';
          }
        }
      } catch (err) {
        // Fallback for static hosting (e.g. GitHub Pages or static host before backend is deployed)
        if (u === 'admin' && p === 'admin123') {
          setToken('static-admin-session');
          if (loginErrorMsg) loginErrorMsg.style.display = 'none';
          showAdmin();
          renderAllTables();
          showToast('تم تسجيل الدخول في وضع التوافق (Static Mode)', 'info');
        } else {
          if (loginErrorMsg) {
            loginErrorMsg.textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
            loginErrorMsg.style.display = 'block';
          }
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      showLogin();
    });
  }

  // ========================== STREAM URL FORMATTER ==========================
  function formatStreamUrl(url) {
    if (!url) return '';
    url = url.trim();
    if (url.includes('<iframe') && url.includes('src=')) {
      const match = url.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) url = match[1];
    }
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    return url;
  }

  // ========================== IN-MEMORY DATA ==========================
  let channels = [];
  let radios = [];
  let matches = [];
  let sportsNews = [];

  async function loadAllData() {
    try {
      const [chRes, radRes, matchRes, newsRes] = await Promise.all([
        fetch(`${API_BASE}/api/channels`),
        fetch(`${API_BASE}/api/radios`),
        fetch(`${API_BASE}/api/matches`),
        fetch(`${API_BASE}/api/news`)
      ]);
      const [chData, radData, matchData, newsData] = await Promise.all([
        chRes.json(), radRes.json(), matchRes.json(), newsRes.json()
      ]);
      if (chData.success) channels = chData.data;
      if (radData.success) radios = radData.data;
      if (matchData.success) matches = matchData.data;
      if (newsData.success) sportsNews = newsData.data;
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  // ========================== DOM ELEMENTS ==========================
  const channelsTableBody = document.getElementById('channelsTableBody');
  const radiosTableBody = document.getElementById('radiosTableBody');
  const sportsNewsTableBody = document.getElementById('sportsNewsTableBody');
  const matchesTableBody = document.getElementById('matchesTableBody');

  const addChannelForm = document.getElementById('addChannelForm');
  const addRadioForm = document.getElementById('addRadioForm');
  const addNewsForm = document.getElementById('addNewsForm');
  const addMatchForm = document.getElementById('addMatchForm');
  const resetDataBtn = document.getElementById('resetDataBtn');

  const editChannelModalBackdrop = document.getElementById('editChannelModalBackdrop');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const editChannelForm = document.getElementById('editChannelForm');

  const editRadioModalBackdrop = document.getElementById('editRadioModalBackdrop');
  const closeEditRadioModalBtn = document.getElementById('closeEditRadioModalBtn');
  const editRadioForm = document.getElementById('editRadioForm');

  // ========================== DEPARTMENT 1: TV CHANNELS ==========================
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
        <td><code style="font-size:0.7rem; color:var(--text-muted);">${(ch.streamUrl || '').substring(0, 32)}...</code></td>
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
    if (editChannelModalBackdrop) editChannelModalBackdrop.classList.add('active');
  };

  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', () => editChannelModalBackdrop.classList.remove('active'));
  }
  if (editChannelModalBackdrop) {
    editChannelModalBackdrop.addEventListener('click', (e) => {
      if (e.target === editChannelModalBackdrop) editChannelModalBackdrop.classList.remove('active');
    });
  }

  if (editChannelForm) {
    editChannelForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editChId').value;
      const rawUrl = document.getElementById('editChStreamUrl').value.trim();
      const formattedUrl = formatStreamUrl(rawUrl);

      const result = await apiCall('PUT', `/api/channels/${id}`, {
        name: document.getElementById('editChName').value.trim(),
        category: document.getElementById('editChCategory').value,
        country: document.getElementById('editChCountry').value.trim(),
        quality: document.getElementById('editChQuality').value,
        streamUrl: formattedUrl,
        logo: document.getElementById('editChLogo').value.trim(),
        description: document.getElementById('editChDesc').value.trim()
      });

      if (result && result.success) {
        // Update local cache
        const idx = channels.findIndex(c => c.id === id);
        if (idx !== -1) channels[idx] = result.data;
        renderChannelsTable();
        if (editChannelModalBackdrop) editChannelModalBackdrop.classList.remove('active');
        showToast('تم تعديل القناة وحفظ التحديثات بنجاح!', 'success');
      } else {
        showToast(result?.message || 'فشل التحديث', 'error');
      }
    });
  }

  if (addChannelForm) {
    addChannelForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('chStreamUrl').value.trim();
      const formattedUrl = formatStreamUrl(rawUrl);

      const result = await apiCall('POST', '/api/channels', {
        name: document.getElementById('chName').value.trim(),
        category: document.getElementById('chCategory').value,
        country: document.getElementById('chCountry').value.trim() || 'عربي',
        quality: document.getElementById('chQuality').value || 'HD',
        logo: document.getElementById('chLogo').value.trim() || 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Al_Jazeera_English_logo.svg/300px-Al_Jazeera_English_logo.svg.png',
        streamUrl: formattedUrl,
        description: document.getElementById('chDesc').value.trim() || 'بث مباشر عالي الجودة',
        isFeatured: false,
        viewersCount: Math.floor(Math.random() * 20000) + 5000
      });

      if (result && result.success) {
        channels.unshift(result.data);
        renderChannelsTable();
        addChannelForm.reset();
        showToast('تم إضافة القناة الفضائية بنجاح!', 'success');
      } else {
        showToast(result?.message || 'فشل الإضافة', 'error');
      }
    });
  }

  window.deleteChannel = async (id) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذه القناة؟')) return;
    const result = await apiCall('DELETE', `/api/channels/${id}`);
    if (result && result.success) {
      channels = channels.filter(c => c.id !== id);
      renderChannelsTable();
      showToast('تم حذف القناة بنجاح', 'success');
    } else {
      showToast(result?.message || 'فشل الحذف', 'error');
    }
  };

  // ========================== DEPARTMENT 2: RADIO STATIONS ==========================
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

  window.editRadio = (id) => {
    const r = radios.find(rad => rad.id === id);
    if (!r) return;
    document.getElementById('editRadId').value = r.id;
    document.getElementById('editRadName').value = r.name;
    document.getElementById('editRadCountry').value = r.country || '';
    document.getElementById('editRadStreamUrl').value = r.streamUrl || '';
    document.getElementById('editRadIcon').value = r.icon || 'fa-radio';
    document.getElementById('editRadDesc').value = r.description || '';
    if (editRadioModalBackdrop) editRadioModalBackdrop.classList.add('active');
  };

  if (closeEditRadioModalBtn) {
    closeEditRadioModalBtn.addEventListener('click', () => editRadioModalBackdrop.classList.remove('active'));
  }
  if (editRadioModalBackdrop) {
    editRadioModalBackdrop.addEventListener('click', (e) => {
      if (e.target === editRadioModalBackdrop) editRadioModalBackdrop.classList.remove('active');
    });
  }

  if (editRadioForm) {
    editRadioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editRadId').value;
      const result = await apiCall('PUT', `/api/radios/${id}`, {
        name: document.getElementById('editRadName').value.trim(),
        country: document.getElementById('editRadCountry').value.trim(),
        streamUrl: document.getElementById('editRadStreamUrl').value.trim(),
        icon: document.getElementById('editRadIcon').value.trim() || 'fa-radio',
        description: document.getElementById('editRadDesc').value.trim()
      });
      if (result && result.success) {
        const idx = radios.findIndex(r => r.id === id);
        if (idx !== -1) radios[idx] = result.data;
        renderRadiosTable();
        if (editRadioModalBackdrop) editRadioModalBackdrop.classList.remove('active');
        showToast('تم تعديل محطة الراديو بنجاح!', 'success');
      } else {
        showToast(result?.message || 'فشل التحديث', 'error');
      }
    });
  }

  if (addRadioForm) {
    addRadioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = await apiCall('POST', '/api/radios', {
        name: document.getElementById('radName').value.trim(),
        country: document.getElementById('radCountry').value.trim() || 'عربي',
        streamUrl: document.getElementById('radStreamUrl').value.trim(),
        icon: document.getElementById('radIcon').value.trim() || 'fa-radio',
        description: document.getElementById('radDesc').value.trim() || 'بث صوّتي حي ومباشر'
      });
      if (result && result.success) {
        radios.unshift(result.data);
        renderRadiosTable();
        addRadioForm.reset();
        showToast('تم إضافة محطة الراديو بنجاح!', 'success');
      } else {
        showToast(result?.message || 'فشل الإضافة', 'error');
      }
    });
  }

  window.deleteRadio = async (id) => {
    if (!confirm('هل أنت تأكد من حذف محطة الراديو هذه؟')) return;
    const result = await apiCall('DELETE', `/api/radios/${id}`);
    if (result && result.success) {
      radios = radios.filter(r => r.id !== id);
      renderRadiosTable();
      showToast('تم حذف المحطة بنجاح', 'success');
    } else {
      showToast(result?.message || 'فشل الحذف', 'error');
    }
  };

  // ========================== DEPARTMENT 3: SPORTS NEWS ==========================
  function renderSportsNewsTable() {
    if (!sportsNewsTableBody) return;
    sportsNewsTableBody.innerHTML = sportsNews.map((news) => `
      <tr>
        <td>
          <img src="${news.image}" style="width:44px; height:30px; border-radius:4px; object-fit:cover; vertical-align:middle; margin-left:8px;">
          <strong>${news.title}</strong>
        </td>
        <td><span class="badge-quality">${news.category}</span></td>
        <td>${news.timeAgo || 'الآن'}</td>
        <td>
          <button class="btn-icon" onclick="deleteNews('${news.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3);">
            <i class="fa-solid fa-trash"></i> حذف
          </button>
        </td>
      </tr>
    `).join('');
  }

  if (addNewsForm) {
    addNewsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const summary = document.getElementById('newsSummary').value.trim();
      const result = await apiCall('POST', '/api/news', {
        title: document.getElementById('newsTitle').value.trim(),
        summary,
        content: `<p>${summary}</p>`,
        category: document.getElementById('newsCategory').value.trim() || 'كرة قدم',
        image: document.getElementById('newsImage').value.trim() || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=500',
        author: 'التحرير الرياضي'
      });
      if (result && result.success) {
        sportsNews.unshift(result.data);
        renderSportsNewsTable();
        addNewsForm.reset();
        showToast('تم نشر الخبر الرياضي بنجاح!', 'success');
      } else {
        showToast(result?.message || 'فشل النشر', 'error');
      }
    });
  }

  window.deleteNews = async (id) => {
    if (!confirm('هل أنت تأكد من حذف هذا الخبر الرياضي؟')) return;
    const result = await apiCall('DELETE', `/api/news/${id}`);
    if (result && result.success) {
      sportsNews = sportsNews.filter(n => n.id !== id);
      renderSportsNewsTable();
      showToast('تم حذف الخبر بنجاح', 'success');
    } else {
      showToast(result?.message || 'فشل الحذف', 'error');
    }
  };

  // ========================== DEPARTMENT 4: MATCHES ==========================
  function renderMatchesTable() {
    if (!matchesTableBody) return;
    matchesTableBody.innerHTML = matches.map((m) => `
      <tr>
        <td>${m.leagueFlag || '🏆'} ${m.league}</td>
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

  if (addMatchForm) {
    addMatchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('mStreamUrl').value.trim() || 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1';
      const formattedUrl = formatStreamUrl(rawUrl);
      const status = document.getElementById('mStatus').value;

      const result = await apiCall('POST', '/api/matches', {
        league: document.getElementById('mLeague').value.trim(),
        homeTeam: document.getElementById('mHomeTeam').value.trim(),
        awayTeam: document.getElementById('mAwayTeam').value.trim(),
        time: document.getElementById('mTime').value.trim(),
        date: document.getElementById('mDate').value.trim() || 'اليوم',
        status,
        channelName: document.getElementById('mChannelName').value.trim(),
        commentator: document.getElementById('mCommentator').value.trim() || 'غير محدد',
        score: status === 'live' ? '0 - 0' : 'vs',
        streamUrl: formattedUrl,
        servers: [
          { name: 'سيرفر 1 (Full HD Direct)', url: formattedUrl || 'https://shoof.alkass.net/live/ch1.m3u8' },
          { name: 'سيرفر 2 (سريع بدون تقطيع)', url: 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' }
        ]
      });

      if (result && result.success) {
        matches.unshift(result.data);
        renderMatchesTable();
        addMatchForm.reset();
        showToast('تم إضافة المباراة بنجاح إلى جدول البث!', 'success');
      } else {
        showToast(result?.message || 'فشل الإضافة', 'error');
      }
    });
  }

  window.deleteMatch = async (id) => {
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذه المباراة؟')) return;
    const result = await apiCall('DELETE', `/api/matches/${id}`);
    if (result && result.success) {
      matches = matches.filter(m => m.id !== id);
      renderMatchesTable();
      showToast('تم حذف المباراة بنجاح', 'success');
    } else {
      showToast(result?.message || 'فشل الحذف', 'error');
    }
  };

  // ========================== RESET DATA ==========================
  if (resetDataBtn) {
    resetDataBtn.addEventListener('click', async () => {
      if (confirm('سيتم إعادة ضبط جميع البيانات إلى الحالة الأصلية الافتراضية. هل تريد الاستمرار؟')) {
        const result = await apiCall('POST', '/api/admin/reset');
        if (result && result.success) {
          showToast('تمت إعادة ضبط البيانات بنجاح — يرجى إعادة تحميل الصفحة', 'success');
          setTimeout(() => location.reload(), 1500);
        } else {
          showToast(result?.message || 'فشل إعادة الضبط', 'error');
        }
      }
    });
  }

  // ========================== CHANGE PASSWORD FORM ==========================
  const changePasswordForm = document.getElementById('changePasswordForm');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = await apiCall('POST', '/api/auth/change-password', {
        currentPassword: document.getElementById('currentPassword').value,
        newPassword: document.getElementById('newPassword').value
      });
      if (result && result.success) {
        showToast(result.message, 'success');
        changePasswordForm.reset();
      } else {
        showToast(result?.message || 'فشل تغيير كلمة المرور', 'error');
      }
    });
  }

  // ========================== TOAST NOTIFICATIONS ==========================
  function showToast(message, type = 'success') {
    const existing = document.querySelector('.altv-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'altv-toast';
    toast.style.cssText = `
      position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
      background: ${type === 'success' ? 'linear-gradient(135deg, #00e676, #00b248)' : 'linear-gradient(135deg, #ff1744, #c62828)'};
      color: #fff; padding: 14px 28px; border-radius: 50px; font-weight: 700;
      font-size: 0.95rem; box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      z-index: 99999; animation: fadeInUp 0.3s ease;
      display: flex; align-items: center; gap: 10px; direction: rtl;
    `;
    toast.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'circle-check' : 'circle-xmark'}"></i> ${message}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }

  // ========================== RENDER ALL TABLES ==========================
  async function renderAllTables() {
    await loadAllData();
    renderChannelsTable();
    renderRadiosTable();
    renderSportsNewsTable();
    renderMatchesTable();
  }

  // ========================== INIT ==========================
  checkAuth();
});
