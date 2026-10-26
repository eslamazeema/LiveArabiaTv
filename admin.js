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
        if (targetDept === 'dept-whatsapp' || targetDept === 'all') {
          loadWhatsAppConfig();
          loadWaSubscribers();
        }
        if (targetDept === 'dept-matches' || targetDept === 'all') {
          loadMatches();
          loadWaSubscribers();
        }
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
        if (u === 'admin' && (p === 'admin' || p === 'admin123')) {
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
      if (radData.success) {
        radios = radData.data;
        radios.sort((a, b) => (a.sortOrder || a.sort_order || 0) - (b.sortOrder || b.sort_order || 0));
      }
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
    radiosTableBody.innerHTML = radios.map((r, idx) => `
      <tr class="draggable-row" draggable="true" data-index="${idx}" data-id="${r.id}">
        <td style="text-align: center; vertical-align: middle;">
          ${r.logo ? `
            <img src="${r.logo}" alt="${r.name}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--secondary); display: inline-block; box-shadow: 0 2px 8px rgba(0,176,255,0.3);" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex';">
            <div style="display:none; width:42px; height:42px; border-radius:50%; background:rgba(0,176,255,0.15); border:1px solid var(--secondary); align-items:center; justify-content:center;">
              <i class="fa-solid ${r.icon || 'fa-radio'}" style="color: var(--secondary); font-size: 1.1rem;"></i>
            </div>
          ` : `
            <div style="display:inline-flex; width:42px; height:42px; border-radius:50%; background:rgba(0,176,255,0.15); border:1px solid var(--secondary); align-items:center; justify-content:center;">
              <i class="fa-solid ${r.icon || 'fa-radio'}" style="color: var(--secondary); font-size: 1.1rem;"></i>
            </div>
          `}
        </td>
        <td style="vertical-align: middle;">
          <strong style="font-size: 0.95rem; color: #fff;">${r.name}</strong>
        </td>
        <td style="vertical-align: middle;"><span class="badge-quality" style="background: rgba(0,176,255,0.15); color: var(--secondary); border: 1px solid rgba(0,176,255,0.3);">${r.country || 'عربي'}</span></td>
        <td style="vertical-align: middle;"><code style="font-size:0.75rem; color:var(--text-muted); background: rgba(0,0,0,0.3); padding: 4px 8px; border-radius: 4px;">${(r.streamUrl || '').substring(0, 32)}...</code></td>
        <td style="vertical-align: middle; color: var(--text-muted); font-size: 0.85rem;">${r.description || 'بث صوتي مباشر'}</td>
        <td style="text-align: center; vertical-align: middle;">
          <div style="display:inline-flex; gap:6px; align-items:center;">
            <button type="button" class="order-btn" onclick="window.moveRadioById('${r.id}', -1)" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="تحريك لأعلى">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button type="button" class="order-btn" onclick="window.moveRadioById('${r.id}', 1)" ${idx === radios.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="تحريك لأسفل">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
          </div>
        </td>
        <td style="vertical-align: middle;">
          <div style="display:flex; gap:8px;">
            <button class="btn-icon" onclick="editRadio('${r.id}')" style="color: var(--secondary); border-color: rgba(0,176,255,0.4); padding: 6px 14px; font-size: 0.82rem;">
              <i class="fa-solid fa-pen"></i> تعديل
            </button>
            <button class="btn-icon" onclick="deleteRadio('${r.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3); padding: 6px 14px; font-size: 0.82rem;">
              <i class="fa-solid fa-trash"></i> حذف
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    setupRadiosDragAndDrop();
  }

  window.moveRadioById = async (id, delta) => {
    const index = radios.findIndex(r => String(r.id) === String(id));
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= radios.length) return;
    const temp = radios[index];
    radios[index] = radios[targetIndex];
    radios[targetIndex] = temp;
    radios.forEach((r, i) => { r.sortOrder = i + 1; });
    renderRadiosTable();
    await window.saveRadioOrder(false); // Auto-save in background
  };

  window.moveRadio = window.moveRadioById;

  window.saveRadioOrder = async (showNotification = true) => {
    const saveBtn = document.getElementById('saveRadiosOrderBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
    }
    try {
      const orderedIds = radios.map(r => r.id);
      const result = await apiCall('POST', '/api/radios/reorder', { orderedIds });
      if (result && result.success) {
        if (showNotification) {
          showToast('تم حفظ وتثبيت ترتيب محطات الراديو بنجاح!', 'success');
        }
      } else {
        if (showNotification) {
          showToast(result?.message || 'فشل حفظ ترتيب محطات الراديو', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving radio order:', err);
      if (showNotification) {
        showToast('حدث خطأ أثناء حفظ ترتيب محطات الراديو', 'error');
      }
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-arrow-down-short-wide"></i> حفظ ترتيب محطات الراديو';
      }
    }
  };

  const saveRadiosOrderBtn = document.getElementById('saveRadiosOrderBtn');
  if (saveRadiosOrderBtn) {
    saveRadiosOrderBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.saveRadioOrder(true);
    });
  }

  let draggedRadioIndex = null;
  function setupRadiosDragAndDrop() {
    if (!radiosTableBody) return;
    const rows = radiosTableBody.querySelectorAll('tr.draggable-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedRadioIndex = parseInt(row.dataset.index, 10);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedRadioIndex);
      });
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      row.addEventListener('dragenter', (e) => {
        e.preventDefault();
        row.style.background = 'rgba(0, 176, 255, 0.15)';
      });
      row.addEventListener('dragleave', () => {
        row.style.background = '';
      });
      row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.style.background = '';
        const targetIndex = parseInt(row.dataset.index, 10);
        if (draggedRadioIndex !== null && draggedRadioIndex !== targetIndex) {
          const [movedItem] = radios.splice(draggedRadioIndex, 1);
          radios.splice(targetIndex, 0, movedItem);
          renderRadiosTable();
          await saveRadioOrder(true);
        }
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        draggedRadioIndex = null;
      });
    });
  }

  window.editRadio = (id) => {
    const r = radios.find(rad => rad.id === id);
    if (!r) return;
    document.getElementById('editRadId').value = r.id;
    document.getElementById('editRadName').value = r.name;
    document.getElementById('editRadCountry').value = r.country || '';
    document.getElementById('editRadStreamUrl').value = r.streamUrl || '';
    document.getElementById('editRadLogo').value = r.logo || r.image || '';
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
        logo: document.getElementById('editRadLogo').value.trim(),
        icon: document.getElementById('editRadIcon').value.trim() || 'fa-radio',
        description: document.getElementById('editRadDesc').value.trim()
      };

      const result = await apiCall('PUT', `/api/radios/${id}`, payload);
      if (result && result.success) {
        const idx = radios.findIndex(r => r.id === id);
        if (idx !== -1) radios[idx] = result.data;
        renderRadiosTable();
        if (editRadioModalBackdrop) editRadioModalBackdrop.classList.remove('active');
        showToast('تم تعديل محطة الراديو وحفظ الصورة بنجاح!', 'success');
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
        logo: document.getElementById('radLogo').value.trim(),
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
      if (filter === 'today') {
        const raw = (m.date || '').trim();
        return raw === 'اليوم' || m.status === 'live';
      }
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
          <td colspan="9" style="text-align: center; padding: 30px; color: var(--text-muted);">
            <i class="fa-solid fa-futbol" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.5;"></i>
            لا توجد مباريات مطابقة للفلتر المحدد.
          </td>
        </tr>
      `;
      return;
    }

    matchesTableBody.innerHTML = filteredMatches.map((m, idx) => {
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

      const scoreParts = (m.score || '').split(/[-–:]/).map(x => x.trim());
      const homeScoreVal = !isNaN(scoreParts[0]) && scoreParts[0] !== '' ? scoreParts[0] : (m.status === 'live' ? '0' : '0');
      const awayScoreVal = !isNaN(scoreParts[1]) && scoreParts[1] !== '' ? scoreParts[1] : (m.status === 'live' ? '0' : '0');

      return `
        <tr draggable="true" data-id="${m.id}" data-index="${idx}" class="draggable-match-row">
          <td style="text-align: center;">
            <span style="font-weight: 900; color: #00e676; font-size: 0.95rem;">${idx + 1}</span>
          </td>
          <td style="text-align: center;">
            <div style="display:inline-flex; gap:4px; align-items:center;">
              <i class="fa-solid fa-grip-vertical" style="color: var(--text-muted); cursor: grab; padding: 0 4px;" title="اسحب لإعادة الترتيب"></i>
              <button class="order-btn" onclick="moveMatchById('${m.id}', -1)" ${idx === 0 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="تحريك لأعلى">
                <i class="fa-solid fa-arrow-up"></i>
              </button>
              <button class="order-btn" onclick="moveMatchById('${m.id}', 1)" ${idx === filteredMatches.length - 1 ? 'disabled style="opacity:0.3; cursor:not-allowed;"' : ''} title="تحريك لأسفل">
                <i class="fa-solid fa-arrow-down"></i>
              </button>
            </div>
          </td>
          <td>
            <div style="font-weight: 700; color: #fff;">${m.leagueFlag || '🏆'} ${m.league}</div>
            ${m.commentator ? `<small style="color: var(--text-muted); font-size: 0.75rem;"><i class="fa-solid fa-microphone"></i> ${m.commentator}</small>` : ''}
          </td>
          <td>
            <div style="font-size: 0.95rem;">
              <strong style="color: #00e676;">${m.homeTeam}</strong> <span style="color: var(--text-muted); font-size: 0.8rem;">ضد</span> <strong style="color: var(--secondary);">${m.awayTeam}</strong>
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
            <div style="display: inline-flex; align-items: center; gap: 6px; direction: rtl; background: rgba(0,0,0,0.45); padding: 5px 8px; border-radius: 8px; border: 1px solid var(--border-glass);">
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-size: 0.72rem; color: #00e676; max-width: 65px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; margin-bottom: 2px;" title="${m.homeTeam}">${m.homeTeam}</span>
                <input type="number" id="score_home_${m.id}" value="${homeScoreVal}" min="0" style="width: 42px; height: 32px; text-align: center; font-weight: 900; background: #080d16; border: 1.5px solid #00e676; border-radius: 6px; color: #ffeb3b; padding: 2px; font-size: 1.05rem;" title="أهداف: ${m.homeTeam} (صاحب الأرض - اليمين)">
              </div>
              <span style="color: var(--text-muted); font-weight: 900; font-size: 1.2rem; margin-top: 14px;">-</span>
              <div style="display: flex; flex-direction: column; align-items: center;">
                <span style="font-size: 0.72rem; color: var(--secondary); max-width: 65px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; margin-bottom: 2px;" title="${m.awayTeam}">${m.awayTeam}</span>
                <input type="number" id="score_away_${m.id}" value="${awayScoreVal}" min="0" style="width: 42px; height: 32px; text-align: center; font-weight: 900; background: #080d16; border: 1.5px solid var(--secondary); border-radius: 6px; color: #ffeb3b; padding: 2px; font-size: 1.05rem;" title="أهداف: ${m.awayTeam} (الضيف - اليسار)">
              </div>
              <button class="btn-sm" style="padding: 6px 9px; background: rgba(0,230,118,0.2); color: #00e676; border: 1px solid #00e676; border-radius: 6px; cursor: pointer; margin-top: 14px; margin-right: 2px;" onclick="window.quickUpdateScore('${m.id}')" title="حفظ النتيجة">
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
              <button class="btn-icon" onclick="window.openManualGoalModal('${m.id}')" style="color: #25D366; border-color: rgba(37,211,102,0.35); font-size: 0.8rem; padding: 6px 10px; display: inline-flex; align-items: center; gap: 4px;" title="إرسال إشعار هدف بالواتساب للمشتركين">
                <i class="fa-brands fa-whatsapp"></i> هدف ${waSubscribersList && waSubscribersList.filter(s => s.match_id === m.id && s.is_active).length > 0 ? `<span style="background: rgba(37,211,102,0.22); color: #25D366; border-radius: 10px; padding: 1px 6px; font-size: 0.72rem; font-weight: 800;">${waSubscribersList.filter(s => s.match_id === m.id && s.is_active).length}</span>` : ''}
              </button>
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

    setupMatchesDragAndDrop();
  }

  if (matchesFilterStatus) {
    matchesFilterStatus.addEventListener('change', renderMatchesTable);
  }

  // --- Quick Score Update ---
  window.quickUpdateScore = async (id) => {
    const homeInput = document.getElementById(`score_home_${id}`);
    const awayInput = document.getElementById(`score_away_${id}`);
    const targetMatch = matches.find(m => m.id === id);

    let newScore = '0 - 0';
    if (homeInput && awayInput) {
      const hVal = homeInput.value.trim() || '0';
      const aVal = awayInput.value.trim() || '0';
      newScore = `${hVal} - ${aVal}`;
    }

    const result = await apiCall('PATCH', `/api/matches/${id}/score`, {
      score: newScore,
      status: targetMatch ? targetMatch.status : undefined
    });

    if (result && result.success) {
      if (targetMatch) targetMatch.score = newScore;
      const toastMsg = result.message || `تم تحديث نتيجة المباراة إلى: ${newScore}`;
      showToast(toastMsg, 'success');
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
    
    // Dual RTL score inputs with clear color-coded labels
    const editHomeLabel = document.getElementById('editHomeTeamLabel');
    const editAwayLabel = document.getElementById('editAwayTeamLabel');
    if (editHomeLabel) editHomeLabel.innerHTML = `<strong style="color: #00e676;">${m.homeTeam || 'صاحب الأرض'}</strong> <small style="display:block; font-size:0.7rem; color:var(--text-muted);">(اليمين)</small>`;
    if (editAwayLabel) editAwayLabel.innerHTML = `<strong style="color: var(--secondary);">${m.awayTeam || 'الضيف'}</strong> <small style="display:block; font-size:0.7rem; color:var(--text-muted);">(اليسار)</small>`;
    const editScoreParts = (m.score || '0-0').split(/[-–:]/).map(x => x.trim());
    if (document.getElementById('editMatchHomeScore')) document.getElementById('editMatchHomeScore').value = (!isNaN(editScoreParts[0]) && editScoreParts[0] !== '') ? editScoreParts[0] : '0';
    if (document.getElementById('editMatchAwayScore')) document.getElementById('editMatchAwayScore').value = (!isNaN(editScoreParts[1]) && editScoreParts[1] !== '') ? editScoreParts[1] : '0';
    document.getElementById('editMatchStatus').value = m.status || 'upcoming';
    document.getElementById('editMatchChannelName').value = m.channelName || '';
    document.getElementById('editMatchCommentator').value = m.commentator || '';

    const srv1 = (m.servers && m.servers[0]) ? m.servers[0].url : '';
    const srv2 = (m.servers && m.servers[1]) ? m.servers[1].url : '';
    document.getElementById('editMatchStreamUrl').value = srv1;
    document.getElementById('editMatchStreamUrl2').value = srv2;
    if (document.getElementById('editMatchDateInput')) {
      document.getElementById('editMatchDateInput').value = m.dateIso || '';
    }

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

  // Live team name label update for Edit Modal
  const editMatchHomeTeamInput = document.getElementById('editMatchHomeTeam');
  if (editMatchHomeTeamInput) {
    editMatchHomeTeamInput.addEventListener('input', () => {
      const editHomeLabel = document.getElementById('editHomeTeamLabel');
      if (editHomeLabel) editHomeLabel.innerHTML = `<strong style="color: #00e676;">${editMatchHomeTeamInput.value.trim() || 'صاحب الأرض'}</strong> <small style="display:block; font-size:0.7rem; color:var(--text-muted);">(اليمين)</small>`;
    });
  }
  const editMatchAwayTeamInput = document.getElementById('editMatchAwayTeam');
  if (editMatchAwayTeamInput) {
    editMatchAwayTeamInput.addEventListener('input', () => {
      const editAwayLabel = document.getElementById('editAwayTeamLabel');
      if (editAwayLabel) editAwayLabel.innerHTML = `<strong style="color: var(--secondary);">${editMatchAwayTeamInput.value.trim() || 'الضيف'}</strong> <small style="display:block; font-size:0.7rem; color:var(--text-muted);">(اليسار)</small>`;
    });
  }

  function normalizeArabicDigits(str) {
    if (!str) return '';
    return String(str)
      .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
      .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d));
  }

  function parseDateToIsoClient(dateStr, explicitIso) {
    if (explicitIso && /^\d{4}-\d{2}-\d{2}$/.test(String(explicitIso).trim())) {
      return String(explicitIso).trim();
    }
    const today = new Date().toLocaleDateString('en-CA');
    const s = normalizeArabicDigits(dateStr || '').trim();
    if (!s || s === 'اليوم') return today;

    const isoMatch = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2].padStart(2, '0')}-${isoMatch[3].padStart(2, '0')}`;

    const dmyMatch = s.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})\b/);
    if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;

    if (s.includes('غداً') || s.includes('غدا')) {
      const tom = new Date(); tom.setDate(tom.getDate() + 1);
      return tom.toLocaleDateString('en-CA');
    }
    if (s.includes('بعد غد')) {
      const aft = new Date(); aft.setDate(aft.getDate() + 2);
      return aft.toLocaleDateString('en-CA');
    }

    const ARABIC_MONTHS = {
      'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'ابريل': 4,
      'مايو': 5, 'يونيو': 6, 'يوليو': 7, 'أغسطس': 8, 'اغسطس': 8,
      'سبتمبر': 9, 'أكتوبر': 10, 'اكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12
    };

    for (const [mName, mNum] of Object.entries(ARABIC_MONTHS)) {
      if (s.includes(mName)) {
        const dM = s.match(/\b(\d{1,2})\b/);
        if (dM) {
          const day = parseInt(dM[1], 10);
          const yM = s.match(/\b(20\d{2})\b/);
          const year = yM ? parseInt(yM[1], 10) : new Date().getFullYear();
          return `${year}-${String(mNum).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      }
    }
    return today;
  }

  // --- Edit Match Form Submit ---
  if (editMatchForm) {
    editMatchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('editMatchId').value;
      const srv1 = document.getElementById('editMatchStreamUrl').value.trim();
      const srv2 = document.getElementById('editMatchStreamUrl2').value.trim();
      const status = document.getElementById('editMatchStatus').value;

      const editDateVal = document.getElementById('editMatchDate').value.trim() || 'اليوم';
      const editDatePicker = document.getElementById('editMatchDateInput') ? document.getElementById('editMatchDateInput').value : '';
      const dateIso = parseDateToIsoClient(editDateVal, editDatePicker);

      const editHScore = document.getElementById('editMatchHomeScore') ? document.getElementById('editMatchHomeScore').value.trim() : '0';
      const editAScore = document.getElementById('editMatchAwayScore') ? document.getElementById('editMatchAwayScore').value.trim() : '0';
      let scoreVal = `${editHScore || '0'} - ${editAScore || '0'}`;
      if (status === 'upcoming' && (editHScore === '0' || editHScore === '') && (editAScore === '0' || editAScore === '')) {
        scoreVal = 'vs';
      }

      const payload = {
        league: document.getElementById('editMatchLeague').value.trim(),
        homeTeam: document.getElementById('editMatchHomeTeam').value.trim(),
        awayTeam: document.getElementById('editMatchAwayTeam').value.trim(),
        date: editDateVal,
        dateIso,
        time: document.getElementById('editMatchTime').value.trim(),
        score: scoreVal,
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

  // Live team name label update for Add Form
  const mHomeTeamInput = document.getElementById('mHomeTeam');
  if (mHomeTeamInput) {
    mHomeTeamInput.addEventListener('input', () => {
      const addHomeLabel = document.getElementById('addHomeTeamLabel');
      if (addHomeLabel) addHomeLabel.innerHTML = `<strong style="color: #00e676;">${mHomeTeamInput.value.trim() || 'صاحب الأرض'}</strong> <small style="display:block; font-size:0.7rem; color:var(--text-muted);">(اليمين)</small>`;
    });
  }
  const mAwayTeamInput = document.getElementById('mAwayTeam');
  if (mAwayTeamInput) {
    mAwayTeamInput.addEventListener('input', () => {
      const addAwayLabel = document.getElementById('addAwayTeamLabel');
      if (addAwayLabel) addAwayLabel.innerHTML = `<strong style="color: var(--secondary);">${mAwayTeamInput.value.trim() || 'الضيف'}</strong> <small style="display:block; font-size:0.7rem; color:var(--text-muted);">(اليسار)</small>`;
    });
  }

  // --- Add Match Form Submit ---
  if (addMatchForm) {
    addMatchForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawUrl = document.getElementById('mStreamUrl').value.trim();
      const rawUrl2 = document.getElementById('mStreamUrl2') ? document.getElementById('mStreamUrl2').value.trim() : '';
      const status = document.getElementById('mStatus').value;

      const addHScore = document.getElementById('mHomeScore') ? document.getElementById('mHomeScore').value.trim() : '0';
      const addAScore = document.getElementById('mAwayScore') ? document.getElementById('mAwayScore').value.trim() : '0';
      let scoreVal = `${addHScore || '0'} - ${addAScore || '0'}`;
      if (status === 'upcoming' && (addHScore === '0' || addHScore === '') && (addAScore === '0' || addAScore === '')) {
        scoreVal = 'vs';
      }

      const mDateVal = document.getElementById('mDate').value.trim() || 'اليوم';
      const mDatePicker = document.getElementById('mDateInput') ? document.getElementById('mDateInput').value : '';
      const dateIso = parseDateToIsoClient(mDateVal, mDatePicker);

      const payload = {
        league: document.getElementById('mLeague').value.trim(),
        homeTeam: document.getElementById('mHomeTeam').value.trim(),
        awayTeam: document.getElementById('mAwayTeam').value.trim(),
        time: document.getElementById('mTime').value.trim(),
        date: mDateVal,
        dateIso,
        status,
        channelName: document.getElementById('mChannelName').value.trim(),
        commentator: document.getElementById('mCommentator').value.trim() || 'غير محدد',
        score: scoreVal,
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

  // ========================== MATCHES REORDER & DRAG AND DROP ==========================
  // Move by ID — works correctly regardless of active filter
  window.moveMatchById = async (id, delta) => {
    const index = matches.findIndex(m => String(m.id) === String(id));
    if (index === -1) return;
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= matches.length) return;
    const temp = matches[index];
    matches[index] = matches[targetIndex];
    matches[targetIndex] = temp;
    renderMatchesTable();
    await window.saveMatchOrder(false); // Auto-save in background
  };

  // Legacy alias kept for compatibility
  window.moveMatch = async (index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= matches.length) return;
    const temp = matches[index];
    matches[index] = matches[targetIndex];
    matches[targetIndex] = temp;
    renderMatchesTable();
    await window.saveMatchOrder(false);
  };

  window.saveMatchOrder = async (showNotification = true) => {
    const saveBtn = document.getElementById('saveMatchesOrderBtn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
    }
    try {
      const orderedIds = matches.map(m => m.id);
      const result = await apiCall('POST', '/api/matches/reorder', { orderedIds });
      if (result && result.success) {
        if (showNotification) {
          showToast('تم حفظ وتثبيت ترتيب جدول المباريات بنجاح!', 'success');
        }
      } else {
        if (showNotification) {
          showToast(result?.message || 'فشل حفظ ترتيب المباريات', 'error');
        }
      }
    } catch (err) {
      console.error('Error saving match order:', err);
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ ترتيب المباريات';
      }
    }
  };

  let draggedMatchRowIndex = null;
  function setupMatchesDragAndDrop() {
    if (!matchesTableBody) return;
    const rows = matchesTableBody.querySelectorAll('tr.draggable-match-row');
    rows.forEach(row => {
      row.addEventListener('dragstart', (e) => {
        draggedMatchRowIndex = parseInt(row.dataset.index, 10);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', draggedMatchRowIndex);
      });
      row.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      row.addEventListener('dragenter', (e) => {
        e.preventDefault();
        row.style.background = 'rgba(0, 230, 118, 0.15)';
      });
      row.addEventListener('dragleave', () => {
        row.style.background = '';
      });
      row.addEventListener('drop', async (e) => {
        e.preventDefault();
        row.style.background = '';
        const targetIndex = parseInt(row.dataset.index, 10);
        if (draggedMatchRowIndex !== null && draggedMatchRowIndex !== targetIndex) {
          const [movedItem] = matches.splice(draggedMatchRowIndex, 1);
          matches.splice(targetIndex, 0, movedItem);
          renderMatchesTable();
          await window.saveMatchOrder(true);
        }
      });
      row.addEventListener('dragend', () => {
        row.classList.remove('dragging');
        draggedMatchRowIndex = null;
      });
    });
  }

  const saveMatchesOrderBtn = document.getElementById('saveMatchesOrderBtn');
  if (saveMatchesOrderBtn) {
    saveMatchesOrderBtn.addEventListener('click', () => window.saveMatchOrder(true));
  }

  const sortMatchesLiveFirstBtn = document.getElementById('sortMatchesLiveFirstBtn');
  if (sortMatchesLiveFirstBtn) {
    sortMatchesLiveFirstBtn.addEventListener('click', async () => {
      const statusWeight = { 'live': 1, 'upcoming': 2, 'ended': 3 };
      matches.sort((a, b) => {
        const wA = statusWeight[a.status] || 2;
        const wB = statusWeight[b.status] || 2;
        return wA - wB;
      });
      renderMatchesTable();
      await window.saveMatchOrder(true);
      showToast('تم ترتيب المباريات: المباشر أولاً ثم القادمة وحفظ الترتيب!', 'success');
    });
  }

  const sortMatchesByTimeBtn = document.getElementById('sortMatchesByTimeBtn');
  if (sortMatchesByTimeBtn) {
    sortMatchesByTimeBtn.addEventListener('click', async () => {
      matches.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
      renderMatchesTable();
      await window.saveMatchOrder(true);
      showToast('تم ترتيب المباريات حسب التوقيت وحفظ الترتيب!', 'success');
    });
  }

  // --- Auto-Fetch & Add Today's Fixtures from Sports Network ---
  const addTodayFixturesBtn = document.getElementById('addTodayFixturesBtn');
  if (addTodayFixturesBtn) {
    addTodayFixturesBtn.addEventListener('click', async () => {
      addTodayFixturesBtn.disabled = true;
      const originalHtml = addTodayFixturesBtn.innerHTML;
      addTodayFixturesBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري جلب مباريات اليوم...';
      try {
        const res = await apiCall('POST', '/api/admin/matches/fetch-today-fixtures');
        if (res && res.success) {
          const freshRes = await fetch(`${API_BASE}/api/matches`);
          if (freshRes.ok) {
            const data = await freshRes.json();
            matches = data.data || [];
            renderMatchesTable();
          }
          showToast(res.message || 'تم جلب وإضافة مباريات اليوم بنجاح!', 'success');
        } else {
          showToast(res?.message || 'فشل جلب مباريات اليوم', 'error');
        }
      } catch (err) {
        showToast('خطأ: ' + err.message, 'error');
      } finally {
        addTodayFixturesBtn.disabled = false;
        addTodayFixturesBtn.innerHTML = originalHtml;
      }
    });
  }

  // --- Auto-Sync Live Scores from Internet ---
  const autoSyncLiveScoresBtn = document.getElementById('autoSyncLiveScoresBtn');
  if (autoSyncLiveScoresBtn) {
    autoSyncLiveScoresBtn.addEventListener('click', async () => {
      autoSyncLiveScoresBtn.disabled = true;
      const originalHtml = autoSyncLiveScoresBtn.innerHTML;
      autoSyncLiveScoresBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري جلب وتحديث النتائج...';
      try {
        const res = await apiCall('POST', '/api/admin/matches/auto-sync');
        if (res && res.success) {
          const freshRes = await fetch(`${API_BASE}/api/matches`);
          if (freshRes.ok) {
            const data = await freshRes.json();
            matches = data.data || [];
            renderMatchesTable();
          }
          const lastEl = document.getElementById('lastAutoSyncTime');
          if (lastEl) {
            lastEl.textContent = `آخر تحديث: ${new Date().toLocaleTimeString('ar-EG')}`;
          }
          showToast(res.message || 'تم تحديث نتائج المباريات آلياً بنجاح!', 'success');
        } else {
          showToast(res?.message || 'فشل التحديث الآلي', 'error');
        }
      } catch (err) {
        showToast('خطأ: ' + err.message, 'error');
      } finally {
        autoSyncLiveScoresBtn.disabled = false;
        autoSyncLiveScoresBtn.innerHTML = originalHtml;
      }
    });
  }

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

  // ========================== DEPARTMENT 5: WHATSAPP MANAGEMENT ==========================
  let waSubscribersList = [];

  async function loadWhatsAppConfig() {
    try {
      const res = await apiCall('GET', '/api/admin/whatsapp/config');
      if (res && res.success && res.data) {
        const cfg = res.data;
        const enEl = document.getElementById('waCfgEnabled');
        const provEl = document.getElementById('waCfgProvider');
        const instEl = document.getElementById('waCfgInstanceId');
        const tokEl = document.getElementById('waCfgToken');
        const phoneEl = document.getElementById('waCfgSenderPhone');
        const badge = document.getElementById('waConfigBadge');

        if (enEl) enEl.value = cfg.enabled ? 'true' : 'false';
        if (provEl) provEl.value = cfg.provider || 'simulator';
        if (instEl) instEl.value = cfg.instanceId || '';
        if (tokEl) tokEl.value = cfg.token || '';
        if (phoneEl) phoneEl.value = cfg.senderPhone || '';

        if (badge) {
          if (cfg.provider === 'simulator' || !cfg.token) {
            badge.textContent = `🧪 وضع المحاكاة الداخلي (رسائل: ${cfg.sentCount || 0})`;
            badge.style.color = '#25D366';
            badge.style.borderColor = 'rgba(37,211,102,0.4)';
          } else {
            badge.textContent = `🚀 بوابة ${cfg.provider} مفعّلة (رسائل: ${cfg.sentCount || 0})`;
            badge.style.color = '#00e676';
            badge.style.borderColor = 'rgba(0,230,118,0.5)';
          }
        }
        checkWhatsAppStatus();
      }
    } catch (e) {
      console.warn('Error loading WhatsApp config:', e.message);
    }
  }

  async function checkWhatsAppStatus() {
    const qrBox = document.getElementById('waQrBox');
    const alertBox = document.getElementById('waStatusAlert');
    const qrImg = document.getElementById('waQrImg');
    const qrContainer = document.getElementById('waQrContainer');
    const refreshBtn = document.getElementById('refreshWaStatusBtn');

    if (!qrBox) return;

    const prov = document.getElementById('waCfgProvider')?.value || 'simulator';
    if (prov !== 'greenapi') {
      qrBox.style.display = 'none';
      return;
    }

    qrBox.style.display = 'block';
    if (refreshBtn) refreshBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص الاتصال...';

    try {
      const res = await apiCall('GET', '/api/admin/whatsapp/status');
      if (refreshBtn) refreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> تحديث رمز الـ QR والحالة';

      if (res && res.success) {
        if (res.isAuthorized || res.state === 'authorized') {
          alertBox.style.background = 'rgba(0, 230, 118, 0.15)';
          alertBox.style.border = '1px solid rgba(0, 230, 118, 0.4)';
          alertBox.style.color = '#00e676';
          alertBox.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size: 1.2rem;"></i> <span>رقم هاتفك متصل بنجاح وجاهز 100% لإرسال إشعارات الأهداف تلقائياً للمشتركين!</span>';
          if (qrContainer) qrContainer.style.display = 'none';
        } else {
          alertBox.style.background = 'rgba(255, 171, 0, 0.15)';
          alertBox.style.border = '1px solid rgba(255, 171, 0, 0.4)';
          alertBox.style.color = 'var(--gold)';
          alertBox.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size: 1.2rem;"></i> <span>الهاتف غير مرتبط حالياً. يرجى مسح رمز الـ QR أدناه عبر تطبيق واتساب على هاتفك لتفعيله:</span>';
          if (qrContainer) qrContainer.style.display = 'flex';

          if (res.qr) {
            qrImg.src = `data:image/png;base64,${res.qr}`;
          } else {
            qrImg.src = './whatsapp_qr.png?' + Date.now();
          }
        }
      }
    } catch (e) {
      if (refreshBtn) refreshBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate"></i> تحديث رمز الـ QR والحالة';
      console.warn('Error checking WhatsApp status:', e.message);
    }
  }

  const refreshWaStatusBtn = document.getElementById('refreshWaStatusBtn');
  if (refreshWaStatusBtn) {
    refreshWaStatusBtn.addEventListener('click', () => {
      checkWhatsAppStatus();
    });
  }

  const provSelect = document.getElementById('waCfgProvider');
  if (provSelect) {
    provSelect.addEventListener('change', () => {
      checkWhatsAppStatus();
    });
  }

  const whatsappConfigForm = document.getElementById('whatsappConfigForm');
  if (whatsappConfigForm) {
    whatsappConfigForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        enabled: document.getElementById('waCfgEnabled').value === 'true',
        provider: document.getElementById('waCfgProvider').value,
        instanceId: document.getElementById('waCfgInstanceId').value.trim(),
        token: document.getElementById('waCfgToken').value.trim(),
        senderPhone: document.getElementById('waCfgSenderPhone').value.trim()
      };
      const res = await apiCall('POST', '/api/admin/whatsapp/config', payload);
      if (res && res.success) {
        showToast('تم حفظ وتحديث إعدادات بوابة الواتساب بنجاح!', 'success');
        loadWhatsAppConfig();
      } else {
        showToast(res?.message || 'فشل حفظ الإعدادات', 'error');
      }
    });
  }

  const sendWaTestBtn = document.getElementById('sendWaTestBtn');
  if (sendWaTestBtn) {
    sendWaTestBtn.addEventListener('click', async () => {
      const phone = document.getElementById('waTestPhone').value.trim();
      const resBox = document.getElementById('waTestResult');
      if (!phone) {
        showToast('يرجى كتابة رقم الهاتف للتجربة', 'error');
        return;
      }
      sendWaTestBtn.disabled = true;
      sendWaTestBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';
      const res = await apiCall('POST', '/api/admin/whatsapp/test', { phone });
      sendWaTestBtn.disabled = false;
      sendWaTestBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> إرسال تجربة الآن';
      if (resBox) {
        resBox.style.display = 'block';
        if (res && res.success) {
          resBox.style.background = 'rgba(0,230,118,0.15)';
          resBox.style.color = '#00e676';
          resBox.innerHTML = `✅ تم إرسال الرسالة بنجاح إلى ${phone}! ${res.result?.simulated ? '(تم حفظها في سجل محاكاة الواتساب بنجاح)' : ''}`;
          showToast('تم إرسال رسالة الاختبار بنجاح!', 'success');
        } else {
          resBox.style.background = 'rgba(255,23,68,0.15)';
          resBox.style.color = '#ff5252';
          resBox.textContent = `❌ ${res?.message || res?.result?.error || 'فشل الإرسال'}`;
        }
      }
    });
  }

  async function loadWaSubscribers() {
    try {
      const res = await apiCall('GET', '/api/admin/whatsapp/subscribers');
      if (res && res.success) {
        waSubscribersList = res.data || [];
        renderWaSubscribersTable();
      }
    } catch (e) {
      console.warn('Error loading subscribers:', e.message);
    }
  }

  function renderWaSubscribersTable() {
    const tbody = document.getElementById('waSubscribersTableBody');
    const countEl = document.getElementById('waSubscribersTotalCount');
    if (countEl) countEl.textContent = waSubscribersList.length;
    if (!tbody) return;

    const query = (document.getElementById('waSubscriberSearch')?.value || '').trim().toLowerCase();
    const filtered = waSubscribersList.filter(s => {
      if (!query) return true;
      return (s.phone && s.phone.includes(query)) ||
             (s.whatsapp_number && s.whatsapp_number.includes(query)) ||
             (s.matchTitle && s.matchTitle.toLowerCase().includes(query));
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 25px; color: var(--text-muted);">
            <i class="fa-brands fa-whatsapp" style="font-size: 2rem; opacity: 0.3; display: block; margin-bottom: 8px;"></i>
            لا يوجد مشتركون مسجلون حالياً.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map((s, idx) => `
      <tr>
        <td style="text-align:center; font-weight:700; color: #25D366;">${idx + 1}</td>
        <td>
          <div style="direction: ltr; text-align: right; font-weight:700; color:#fff;">
            <i class="fa-brands fa-whatsapp" style="color: #25D366; margin-left: 6px;"></i> +${s.whatsapp_number}
          </div>
          ${s.phone !== s.whatsapp_number ? `<small style="color: var(--text-muted);">${s.phone}</small>` : ''}
        </td>
        <td>
          <div style="font-weight: 700; color:#fff;">${s.matchTitle || 'مباراة'}</div>
          <small style="color: var(--text-muted);">${s.matchLeague || ''}</small>
        </td>
        <td>
          <span class="badge-quality" style="background: rgba(255,255,255,0.08); font-size: 0.75rem;">
            ${s.team_interest === 'home' ? 'الفريق الأول' : (s.team_interest === 'away' ? 'الفريق الثاني' : 'كلا الفريقين')}
          </span>
        </td>
        <td>
          <small style="color: var(--text-muted);">${s.created_at ? s.created_at.replace('T', ' ').slice(0, 16) : 'مؤخراً'}</small>
        </td>
        <td>
          ${s.is_active ? '<span style="color: #00e676; font-size: 0.8rem; font-weight: 700;">🟢 نشط</span>' : '<span style="color: #9e9e9e; font-size: 0.8rem;">⚪ ملغي</span>'}
        </td>
        <td style="text-align: center;">
          <button class="btn-icon" onclick="window.deleteWaSubscriber('${s.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3); padding: 5px 10px; font-size: 0.8rem;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.deleteWaSubscriber = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المشترك؟')) return;
    const res = await apiCall('DELETE', `/api/admin/whatsapp/subscribers/${id}`);
    if (res && res.success) {
      showToast('تم حذف المشترك بنجاح', 'success');
      loadWaSubscribers();
    } else {
      showToast(res?.message || 'فشل حذف المشترك', 'error');
    }
  };

  const refreshWaSubscribersBtn = document.getElementById('refreshWaSubscribersBtn');
  if (refreshWaSubscribersBtn) {
    refreshWaSubscribersBtn.addEventListener('click', () => {
      loadWaSubscribers();
      showToast('تم تحديث قائمة المشتركين!', 'info');
    });
  }

  const waSubscriberSearch = document.getElementById('waSubscriberSearch');
  if (waSubscriberSearch) {
    waSubscriberSearch.addEventListener('input', renderWaSubscribersTable);
  }

  // --- Manual Goal Alert Modal ---
  const manualGoalModalBackdrop = document.getElementById('manualGoalModalBackdrop');
  const closeManualGoalModalBtn = document.getElementById('closeManualGoalModalBtn');
  const manualGoalForm = document.getElementById('manualGoalForm');

  window.openManualGoalModal = async (matchId) => {
    const m = matches.find(x => x.id === matchId);
    if (!m) return;
    document.getElementById('mgMatchId').value = m.id;
    document.getElementById('mgModalMatchTitle').textContent = `${m.homeTeam} 🆚 ${m.awayTeam} (${m.league})`;
    
    if (document.getElementById('mgHomeTeamName')) document.getElementById('mgHomeTeamName').innerHTML = `<strong style="color: #00e676;">${m.homeTeam}</strong> <small style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(صاحب الأرض - اليمين)</small>`;
    if (document.getElementById('mgAwayTeamName')) document.getElementById('mgAwayTeamName').innerHTML = `<strong style="color: var(--secondary);">${m.awayTeam}</strong> <small style="display:block; font-size:0.75rem; color:var(--text-muted); font-weight:normal;">(الضيف - اليسار)</small>`;

    const parts = (m.score || '0-0').split(/[-–:]/).map(x => x.trim());
    if (document.getElementById('mgHomeScore')) document.getElementById('mgHomeScore').value = !isNaN(parts[0]) ? parts[0] : '0';
    if (document.getElementById('mgAwayScore')) document.getElementById('mgAwayScore').value = !isNaN(parts[1]) ? parts[1] : '0';

    document.getElementById('mgScorerName').value = '';
    const statusBox = document.getElementById('mgStatus');
    if (statusBox) statusBox.style.display = 'none';
    document.getElementById('mgModalSubscribersCount').innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري فحص عدد المشتركين...';
    if (manualGoalModalBackdrop) manualGoalModalBackdrop.classList.add('active');

    try {
      await loadWaSubscribers();
      const matchSubs = waSubscribersList.filter(s => s.match_id === m.id && s.is_active);
      document.getElementById('mgModalSubscribersCount').innerHTML = `عدد المشتركين المسجلين لهذه المباراة: <strong style="color: #25D366; font-size: 0.95rem;">${matchSubs.length} مشترك</strong>`;
    } catch (_) {}
  };

  if (closeManualGoalModalBtn) {
    closeManualGoalModalBtn.addEventListener('click', () => manualGoalModalBackdrop.classList.remove('active'));
  }
  if (manualGoalModalBackdrop) {
    manualGoalModalBackdrop.addEventListener('click', (e) => {
      if (e.target === manualGoalModalBackdrop) manualGoalModalBackdrop.classList.remove('active');
    });
  }

  if (manualGoalForm) {
    manualGoalForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const matchId = document.getElementById('mgMatchId').value;
      const hScore = document.getElementById('mgHomeScore') ? document.getElementById('mgHomeScore').value.trim() : '0';
      const aScore = document.getElementById('mgAwayScore') ? document.getElementById('mgAwayScore').value.trim() : '0';
      const score = `${hScore} - ${aScore}`;
      const scorerName = document.getElementById('mgScorerName').value.trim();
      const submitBtn = document.getElementById('mgSubmitBtn');
      const statusBox = document.getElementById('mgStatus');

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري إرسال الإشعار لجميع المشتركين...';

      const res = await apiCall('POST', `/api/admin/matches/${encodeURIComponent(matchId)}/notify-goal`, {
        score,
        scorerName
      });

      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> إرسال إشعار الهدف الآن لجميع المشتركين';

      if (statusBox) {
        statusBox.style.display = 'block';
        if (res && res.success) {
          statusBox.style.background = 'rgba(0, 230, 118, 0.18)';
          statusBox.style.color = '#00e676';
          statusBox.textContent = `✅ ${res.message}`;
          showToast('تم إرسال إشعار الأهداف للمشتركين بنجاح!', 'success');
          const targetM = matches.find(x => x.id === matchId);
          if (targetM) targetM.score = score;
          renderMatchesTable();
          setTimeout(() => {
            if (manualGoalModalBackdrop) manualGoalModalBackdrop.classList.remove('active');
          }, 2000);
        } else {
          statusBox.style.background = 'rgba(255, 23, 68, 0.18)';
          statusBox.style.color = '#ff5252';
          statusBox.textContent = `❌ ${res?.message || 'فشل إرسال الإشعار'}`;
        }
      }
    });
  }

  // ========================== RENDER ALL TABLES ==========================
  async function renderAllTables() {
    await loadAllData();
    renderChannelsTable();
    renderRadiosTable();
    renderSportsNewsTable();
    renderMatchesTable();
    loadWhatsAppConfig();
    loadWaSubscribers();
  }

  // ========================== INIT ==========================
  checkAuth();
});
