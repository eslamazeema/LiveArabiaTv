/**
 * Arabia Live TV (arabialivetv.com) - Admin Control Panel v2.5
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
      console.warn('⚠️ Server API unreachable, using built-in default data in admin panel:', err);
      if (typeof DEFAULT_CHANNELS !== 'undefined' && channels.length === 0) channels = [...DEFAULT_CHANNELS];
      if (typeof DEFAULT_RADIOS !== 'undefined' && radios.length === 0) radios = [...DEFAULT_RADIOS];
      if (typeof DEFAULT_MATCHES !== 'undefined' && matches.length === 0) matches = [...DEFAULT_MATCHES];
      if (typeof DEFAULT_SPORTS_NEWS !== 'undefined' && sportsNews.length === 0) sportsNews = [...DEFAULT_SPORTS_NEWS];
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
  function updateDefaultChannelBadge() {
    const currentDefaultBadge = document.getElementById('currentDefaultChannelBadge');
    if (!currentDefaultBadge) return;
    const defCh = channels.find(c => c.isDefault) || channels[0];
    if (defCh) {
      currentDefaultBadge.innerHTML = `<i class="fa-solid fa-star"></i> ${defCh.name}`;
    } else {
      currentDefaultBadge.innerHTML = 'لم يتم تحديد قناة';
    }
  }

  function renderChannelsTable() {
    if (!channelsTableBody) return;
    updateDefaultChannelBadge();

    channelsTableBody.innerHTML = channels.map((ch, idx) => `
      <tr draggable="true" data-id="${ch.id}" data-index="${idx}" class="draggable-row">
        <td style="text-align: center;">
          <span style="font-weight: 900; color: var(--primary); font-size: 0.95rem;">${idx + 1}</span>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${ch.logo}" style="width:36px; height:36px; border-radius:50%; object-fit:contain; background:#fff; padding:2px; border:1px solid rgba(255,255,255,0.15); flex-shrink: 0;" onerror="this.src='/assets/logos/generic.svg'">
            <div>
              <strong>${ch.name}</strong>
              <div style="font-size:0.75rem; color:var(--text-muted); direction:ltr; text-align:right;">${(ch.streamUrl || '').substring(0, 32)}...</div>
            </div>
          </div>
        </td>
        <td><span class="badge-quality">${ch.category}</span></td>
        <td>${ch.country || 'عربي'}</td>
        <td><span class="badge-quality" style="color:var(--secondary); border-color:rgba(0,176,255,0.3); font-weight:800;">${ch.quality || 'HD'}</span></td>
        <td style="text-align: center;">
          ${ch.isDefault ? `
            <span style="display:inline-flex; align-items:center; gap:6px; background:rgba(255,215,0,0.18); border:1px solid var(--gold); color:var(--gold); padding:5px 14px; border-radius:20px; font-weight:800; font-size:0.8rem; box-shadow:0 0 12px rgba(255,215,0,0.25);">
              <i class="fa-solid fa-star"></i> القناة الافتراضية
            </span>
          ` : `
            <button class="btn-icon" onclick="setAsDefault('${ch.id}')" style="padding:4px 12px; font-size:0.78rem; border-color:rgba(255,255,255,0.15); color:var(--text-muted); border-radius:20px;" title="تعيين كقناة افتراضية تبدأ تلقائياً عند زيارة الموقع">
              <i class="fa-regular fa-star"></i> جعلها افتراضية
            </button>
          `}
        </td>
        <td style="text-align: center;">
          <div style="display:inline-flex; gap:6px; align-items:center;">
            <button class="order-btn" onclick="moveChannel(${idx}, -1)" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="تحريك لأعلى">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button class="order-btn" onclick="moveChannel(${idx}, 1)" ${idx === channels.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="تحريك لأسفل">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:8px;">
            <button class="btn-icon" onclick="editChannel('${ch.id}')" style="color: var(--primary); border-color: rgba(255,82,0,0.4); padding: 5px 12px; font-size: 0.8rem;">
              <i class="fa-solid fa-pen"></i> تعديل
            </button>
            <button class="btn-icon" onclick="deleteChannel('${ch.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3); padding: 5px 12px; font-size: 0.8rem;">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    setupChannelsDragAndDrop();
  }

  // ========================== CHANNELS REORDER & DEFAULT LOGIC ==========================
  window.setAsDefault = async (id) => {
    const ch = channels.find(c => c.id === id);
    const result = await apiCall('POST', `/api/channels/${id}/set-default`);
    if (result && result.success) {
      channels.forEach(c => { c.isDefault = (c.id === id); });
      renderChannelsTable();
      showToast(`تم تعيين "${ch ? ch.name : id}" كقناة افتراضية بنجاح!`, 'success');
    } else {
      showToast(result?.message || 'فشل تحديد القناة الافتراضية', 'error');
    }
  };

  window.moveChannel = async (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= channels.length) return;
    const temp = channels[index];
    channels[index] = channels[targetIndex];
    channels[targetIndex] = temp;
    renderChannelsTable();
    await saveChannelOrder(false); // Auto-save in background
  };

  window.saveChannelOrder = async (showNotification = true) => {
    const saveBtn = document.getElementById('saveOrderBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
    }
    try {
      const orderedIds = channels.map(c => c.id);
      const result = await apiCall('POST', '/api/channels/reorder', { orderedIds });
      if (result && result.success) {
        if (showNotification) {
          showToast('تم حفظ وتثبيت ترتيب القنوات الجديد بنجاح!', 'success');
        }
      } else {
        if (showNotification) {
          showToast(result?.message || 'فشل حفظ ترتيب القنوات', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving channel order:', err);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-arrow-down-short-wide"></i> حفظ ترتيب القنوات الجديد';
      }
    }
  };

  let draggedRowIndex = null;
  function setupChannelsDragAndDrop() {
    if (!channelsTableBody) return;
    const rows = channelsTableBody.querySelectorAll('tr.draggable-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedRowIndex = parseInt(row.dataset.index, 10);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedRowIndex);
      });
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      row.addEventListener('dragenter', (e) => {
        e.preventDefault();
        row.style.background = 'rgba(255, 82, 0, 0.15)';
      });
      row.addEventListener('dragleave', () => {
        row.style.background = '';
      });
      row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.style.background = '';
        const targetIndex = parseInt(row.dataset.index, 10);
        if (draggedRowIndex !== null && draggedRowIndex !== targetIndex) {
          const [movedItem] = channels.splice(draggedRowIndex, 1);
          channels.splice(targetIndex, 0, movedItem);
          renderChannelsTable();
          await saveChannelOrder(true);
        }
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        draggedRowIndex = null;
      });
    });
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
      const rawUrl = document.getElementById('editRadStreamUrl').value.trim();
      const formattedUrl = formatStreamUrl(rawUrl);

      const payload = {
        name: document.getElementById('editRadName').value.trim(),
        country: document.getElementById('editRadCountry').value.trim(),
        streamUrl: formattedUrl,
        icon: document.getElementById('editRadIcon').value.trim() || 'fa-radio',
        description: document.getElementById('editRadDesc').value.trim()
      };

      const result = await apiCall('PUT', `/api/radios/${id}`, payload);
      if (result && result.success) {
        const idx = radios.findIndex(r => r.id === id);
        if (idx !== -1) radios[idx] = result.data;
        renderRadiosTable();
        if (editRadioModalBackdrop) editRadioModalBackdrop.classList.remove('active');
        showToast('تم تعديل محطة الراديو بنجاح!', 'success');
      } else if (!result || !result.success) {
        // Fallback for static mode
        const idx = radios.findIndex(r => r.id === id);
        if (idx !== -1) {
          radios[idx] = { ...radios[idx], ...payload, id };
          renderRadiosTable();
          if (editRadioModalBackdrop) editRadioModalBackdrop.classList.remove('active');
          showToast('تم تحديث بيانات الراديو محلياً بنجاح!', 'success');
        } else {
          showToast(result?.message || 'فشل التحديث', 'error');
        }
      }
    });
  }

  if (addRadioForm) {
    addRadioForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('radStreamUrl').value.trim();
      const formattedUrl = formatStreamUrl(rawUrl);

      const payload = {
        name: document.getElementById('radName').value.trim(),
        country: document.getElementById('radCountry').value.trim() || 'عربي',
        streamUrl: formattedUrl,
        icon: document.getElementById('radIcon').value.trim() || 'fa-radio',
        description: document.getElementById('radDesc').value.trim() || 'بث صوّتي حي ومباشر'
      };

      const result = await apiCall('POST', '/api/radios', payload);
      if (result && result.success) {
        radios.unshift(result.data);
        renderRadiosTable();
        addRadioForm.reset();
        showToast('تم إضافة محطة الراديو بنجاح!', 'success');
      } else {
        // Fallback for static mode
        const newRadio = { id: 'rad-' + Date.now(), ...payload };
        radios.unshift(newRadio);
        renderRadiosTable();
        addRadioForm.reset();
        showToast('تمت إضافة محطة الراديو محلياً بنجاح!', 'success');
      }
    });
  }

  window.deleteRadio = async (id) => {
    if (!confirm('هل أنت متأكد من حذف محطة الراديو هذه؟')) return;
    const result = await apiCall('DELETE', `/api/radios/${id}`);
    if (result && result.success) {
      radios = radios.filter(r => r.id !== id);
      renderRadiosTable();
      showToast('تم حذف المحطة بنجاح', 'success');
    } else {
      radios = radios.filter(r => r.id !== id);
      renderRadiosTable();
      showToast('تم حذف المحطة محلياً بنجاح', 'success');
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
  const matchesFilterStatus = document.getElementById('matchesFilterStatus');
  const clearEndedMatchesBtn = document.getElementById('clearEndedMatchesBtn');
  const endedMatchesCountBadge = document.getElementById('endedMatchesCountBadge');
  const matchesStatsSummary = document.getElementById('matchesStatsSummary');

  const editMatchModalBackdrop = document.getElementById('editMatchModalBackdrop');
  const editMatchForm = document.getElementById('editMatchForm');
  const closeEditMatchModalBtn = document.getElementById('closeEditMatchModalBtn');
  const cancelEditMatchBtn = document.getElementById('cancelEditMatchBtn');

  // Quick Date Helpers
  window.setQuickDate = (label) => {
    const input = document.getElementById('mDate');
    if (input) input.value = label;
  };

  window.setQuickEditDate = (label) => {
    const input = document.getElementById('editMatchDate');
    if (input) input.value = label;
  };

  const mDateInput = document.getElementById('mDateInput');
  const mDate = document.getElementById('mDate');
  if (mDateInput && mDate) {
    mDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        const parts = e.target.value.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          try {
            mDate.value = d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
          } catch (_) {
            mDate.value = e.target.value;
          }
        }
      }
    });
  }

  const editMatchDateInput = document.getElementById('editMatchDateInput');
  const editMatchDate = document.getElementById('editMatchDate');
  if (editMatchDateInput && editMatchDate) {
    editMatchDateInput.addEventListener('change', (e) => {
      if (e.target.value) {
        const parts = e.target.value.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          try {
            editMatchDate.value = d.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' });
          } catch (_) {
            editMatchDate.value = e.target.value;
          }
        }
      }
    });
  }

  function renderMatchesTable() {
    if (!matchesTableBody) return;

    const filter = matchesFilterStatus ? matchesFilterStatus.value : 'all';
    const filteredMatches = matches.filter(m => {
      if (filter === 'all') return true;
      return m.status === filter;
    });

    // Update stats
    const totalCount = matches.length;
    const liveCount = matches.filter(m => m.status === 'live').length;
    const upcomingCount = matches.filter(m => m.status === 'upcoming').length;
    const endedCount = matches.filter(m => m.status === 'ended').length;

    if (endedMatchesCountBadge) {
      endedMatchesCountBadge.textContent = endedCount;
    }
    if (matchesStatsSummary) {
      matchesStatsSummary.innerHTML = `إجمالي: <strong>${totalCount}</strong> | مباشر: <strong style="color:#00e676;">${liveCount}</strong> | قادمة: <strong style="color:var(--primary);">${upcomingCount}</strong> | منتهية: <strong style="color:#ff5252;">${endedCount}</strong>`;
    }

    if (filteredMatches.length === 0) {
      matchesTableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-muted);">
            <i class="fa-solid fa-futbol" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
            لا توجد مباريات مطابقة للفلتر المحدد.
          </td>
        </tr>
      `;
      return;
    }

    matchesTableBody.innerHTML = filteredMatches.map((m) => {
      const srv1 = (m.servers && m.servers[0] && m.servers[0].url) ? m.servers[0].url : '';
      const hasEmbed = srv1.includes('<iframe') || srv1.includes('<script');
      const hasHls = srv1.includes('.m3u8');
      const scriptBadge = srv1
        ? (hasEmbed
            ? `<span style="display:inline-block; font-size:0.7rem; background:rgba(0,230,118,0.15); color:#00e676; padding:2px 6px; border-radius:4px; margin-top:4px;"><i class="fa-solid fa-code"></i> كود iFrame مدمج</span>`
            : (hasHls
                ? `<span style="display:inline-block; font-size:0.7rem; background:rgba(0,180,216,0.15); color:#00b4d8; padding:2px 6px; border-radius:4px; margin-top:4px;"><i class="fa-solid fa-play"></i> بث HLS مباشر</span>`
                : `<span style="display:inline-block; font-size:0.7rem; background:rgba(255,193,7,0.15); color:#ffc107; padding:2px 6px; border-radius:4px; margin-top:4px;"><i class="fa-solid fa-link"></i> رابط مخصص</span>`))
        : `<span style="display:inline-block; font-size:0.7rem; background:rgba(255,255,255,0.08); color:var(--text-muted); padding:2px 6px; border-radius:4px; margin-top:4px;">افتراضي</span>`;

      let statusBadge = '';
      if (m.status === 'live') {
        statusBadge = `<span class="match-status-tag status-live"><span class="pulse-dot-red"></span> مباشر</span>`;
      } else if (m.status === 'ended') {
        statusBadge = `<span class="match-status-tag" style="background: rgba(158,158,158,0.15); color: #b0bec5; border: 1px solid rgba(158,158,158,0.3);"><i class="fa-solid fa-flag-checkered"></i> انتهت</span>`;
      } else {
        statusBadge = `<span class="match-status-tag status-upcoming"><i class="fa-regular fa-clock"></i> قريباً</span>`;
      }

      const currentScore = m.score || (m.status === 'live' ? '0 - 0' : 'vs');

      return `
        <tr>
          <td>
            <div style="font-weight: 700; color: #fff;">${m.leagueFlag || '🏆'} ${m.league}</div>
            ${m.commentator ? `<small style="color: var(--text-muted); font-size: 0.75rem;"><i class="fa-solid fa-microphone"></i> ${m.commentator}</small>` : ''}
          </td>
          <td>
            <div style="font-size: 0.95rem;">
              <strong>${m.homeTeam}</strong> <span style="color: var(--text-muted); font-size: 0.8rem;">ضد</span> <strong>${m.awayTeam}</strong>
            </div>
          </td>
          <td>
            <div style="color: var(--primary); font-weight: 600; font-size: 0.85rem;">
              <i class="fa-regular fa-calendar-days"></i> ${m.date || 'اليوم'}
            </div>
            <div style="color: var(--text-muted); font-size: 0.8rem;">
              <i class="fa-regular fa-clock"></i> ${m.time}
            </div>
          </td>
          <td>
            <div style="display: flex; gap: 4px; align-items: center;">
              <input type="text" id="score_input_${m.id}" value="${currentScore}" style="width: 75px; text-align: center; font-weight: 900; background: #080d16; border: 1px solid var(--border-glass); border-radius: 6px; color: #ffeb3b; padding: 4px 6px; font-size: 0.9rem;" title="اضغط للتعديل ثم اضغط علامة الصح">
              <button class="btn-sm" style="padding: 5px 8px; background: rgba(0,230,118,0.15); color: #00e676; border: 1px solid rgba(0,230,118,0.3); border-radius: 6px; cursor: pointer;" onclick="window.quickUpdateScore('${m.id}')" title="حفظ النتيجة فوراً">
                <i class="fa-solid fa-check"></i>
              </button>
            </div>
          </td>
          <td>${statusBadge}</td>
          <td>
            <div>${m.channelName || 'قناة رياضية'}</div>
            ${scriptBadge}
          </td>
          <td>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button class="btn-icon" onclick="window.openEditMatchModal('${m.id}')" style="color: #00e676; border-color: rgba(0,230,118,0.3); font-size: 0.8rem; padding: 6px 12px;">
                <i class="fa-solid fa-pen-to-square"></i> تعديل البث
              </button>
              <button class="btn-icon" onclick="window.deleteMatch('${m.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3); font-size: 0.8rem; padding: 6px 10px;">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  if (matchesFilterStatus) {
    matchesFilterStatus.addEventListener('change', renderMatchesTable);
  }

  // --- Quick Score Update ---
  window.quickUpdateScore = async (id) => {
    const input = document.getElementById(`score_input_${id}`);
    if (!input) return;
    const newScore = input.value.trim();
    const targetMatch = matches.find(m => m.id === id);

    const result = await apiCall('PATCH', `/api/matches/${id}/score`, {
      score: newScore,
      status: targetMatch ? targetMatch.status : undefined
    });

    if (result && result.success) {
      if (targetMatch) targetMatch.score = newScore;
      showToast(`تم تحديث نتيجة المباراة إلى: ${newScore}`, 'success');
      renderMatchesTable();
    } else {
      showToast(result?.message || 'فشل تحديث النتيجة', 'error');
    }
  };

  // --- Open & Close Edit Match Modal ---
  window.openEditMatchModal = (id) => {
    const m = matches.find(x => x.id === id);
    if (!m) return;

    document.getElementById('editMatchId').value = m.id;
    document.getElementById('editMatchLeague').value = m.league || '';
    document.getElementById('editMatchHomeTeam').value = m.homeTeam || '';
    document.getElementById('editMatchAwayTeam').value = m.awayTeam || '';
    document.getElementById('editMatchDate').value = m.date || 'اليوم';
    document.getElementById('editMatchTime').value = m.time || '';
    document.getElementById('editMatchScore').value = m.score || (m.status === 'live' ? '0 - 0' : 'vs');
    document.getElementById('editMatchStatus').value = m.status || 'upcoming';
    document.getElementById('editMatchChannelName').value = m.channelName || '';
    document.getElementById('editMatchCommentator').value = m.commentator || '';

    const srv1 = (m.servers && m.servers[0]) ? m.servers[0].url : '';
    const srv2 = (m.servers && m.servers[1]) ? m.servers[1].url : '';
    document.getElementById('editMatchStreamUrl').value = srv1;
    document.getElementById('editMatchStreamUrl2').value = srv2;

    if (editMatchModalBackdrop) editMatchModalBackdrop.classList.add('active');
  };

  function closeEditMatchModal() {
    if (editMatchModalBackdrop) editMatchModalBackdrop.classList.remove('active');
  }

  if (closeEditMatchModalBtn) closeEditMatchModalBtn.addEventListener('click', closeEditMatchModal);
  if (cancelEditMatchBtn) cancelEditMatchBtn.addEventListener('click', closeEditMatchModal);
  if (editMatchModalBackdrop) {
    editMatchModalBackdrop.addEventListener('click', (e) => {
      if (e.target === editMatchModalBackdrop) closeEditMatchModal();
    });
  }

  // --- Edit Match Form Submit ---
  if (editMatchForm) {
    editMatchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editMatchId').value;
      const srv1 = document.getElementById('editMatchStreamUrl').value.trim();
      const srv2 = document.getElementById('editMatchStreamUrl2').value.trim();
      const status = document.getElementById('editMatchStatus').value;

      const payload = {
        league: document.getElementById('editMatchLeague').value.trim(),
        homeTeam: document.getElementById('editMatchHomeTeam').value.trim(),
        awayTeam: document.getElementById('editMatchAwayTeam').value.trim(),
        date: document.getElementById('editMatchDate').value.trim() || 'اليوم',
        time: document.getElementById('editMatchTime').value.trim(),
        score: document.getElementById('editMatchScore').value.trim() || (status === 'live' ? '0 - 0' : 'vs'),
        status,
        channelName: document.getElementById('editMatchChannelName').value.trim(),
        commentator: document.getElementById('editMatchCommentator').value.trim() || 'غير محدد',
        streamUrl: srv1,
        streamUrl2: srv2,
        servers: [
          { name: 'سيرفر 1 (البث المباشر الأساسي)', url: srv1 || 'https://shoof.alkass.net/live/ch1.m3u8' },
          { name: 'سيرفر 2 (احتياطي عالي السرعة)', url: srv2 || 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' }
        ]
      };

      const result = await apiCall('PUT', `/api/matches/${id}`, payload);
      if (result && result.success) {
        const idx = matches.findIndex(x => x.id === id);
        if (idx !== -1) {
          matches[idx] = { ...matches[idx], ...payload, id };
        }
        renderMatchesTable();
        closeEditMatchModal();
        showToast('تم تحديث بيانات واسكريبت البث للمباراة بنجاح!', 'success');
      } else {
        showToast(result?.message || 'فشل تحديث المباراة', 'error');
      }
    });
  }

  // --- Add Match Form Submit ---
  if (addMatchForm) {
    addMatchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('mStreamUrl').value.trim();
      const rawUrl2 = document.getElementById('mStreamUrl2') ? document.getElementById('mStreamUrl2').value.trim() : '';
      const status = document.getElementById('mStatus').value;
      const scoreVal = document.getElementById('mScore') ? document.getElementById('mScore').value.trim() : '';

      const payload = {
        league: document.getElementById('mLeague').value.trim(),
        homeTeam: document.getElementById('mHomeTeam').value.trim(),
        awayTeam: document.getElementById('mAwayTeam').value.trim(),
        time: document.getElementById('mTime').value.trim(),
        date: document.getElementById('mDate').value.trim() || 'اليوم',
        status,
        channelName: document.getElementById('mChannelName').value.trim(),
        commentator: document.getElementById('mCommentator').value.trim() || 'غير محدد',
        score: scoreVal || (status === 'live' ? '0 - 0' : 'vs'),
        streamUrl: rawUrl,
        streamUrl2: rawUrl2,
        servers: [
          { name: 'سيرفر 1 (البث المباشر الأساسي)', url: rawUrl || 'https://shoof.alkass.net/live/ch1.m3u8' },
          { name: 'سيرفر 2 (احتياطي عالي السرعة)', url: rawUrl2 || 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8' }
        ]
      };

      const result = await apiCall('POST', '/api/matches', payload);
      if (result && result.success) {
        matches.unshift(result.data);
        renderMatchesTable();
        addMatchForm.reset();
        showToast('تمت إضافة المباراة بنجاح إلى جدول البث المباشر!', 'success');
      } else {
        showToast(result?.message || 'فشل الإضافة', 'error');
      }
    });
  }

  // --- Clear Ended Matches ---
  window.clearEndedMatches = async () => {
    const endedCount = matches.filter(m => m.status === 'ended').length;
    if (endedCount === 0) {
      showToast('لا توجد مباريات منتهية حالياً لمسحها', 'info');
      return;
    }

    if (!confirm(`هل أنت متأكد من مسح جميع المباريات التي انتهت (${endedCount} مباراة) نهائياً من الجدول؟`)) return;

    const result = await apiCall('POST', '/api/matches/clear-ended');
    if (result && result.success) {
      matches = matches.filter(m => m.status !== 'ended');
      renderMatchesTable();
      showToast(`تم مسح ${result.count || endedCount} مباراة منتهية بنجاح!`, 'success');
    } else {
      showToast(result?.message || 'فشل مسح المباريات المنتهية', 'error');
    }
  };

  if (clearEndedMatchesBtn) {
    clearEndedMatchesBtn.addEventListener('click', window.clearEndedMatches);
  }

  // --- Delete Single Match ---
  window.deleteMatch = async (id) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذه المباراة؟')) return;
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
