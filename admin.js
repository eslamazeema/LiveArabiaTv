/**
 * Arabia Live TV (arabialivetv.com) - Admin Control Panel Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Load data or defaults
  let channels = JSON.parse(localStorage.getItem('altv_channels')) || DEFAULT_CHANNELS;
  let matches = JSON.parse(localStorage.getItem('altv_matches')) || DEFAULT_MATCHES;
  let sportsNews = JSON.parse(localStorage.getItem('altv_sports_news')) || DEFAULT_SPORTS_NEWS;

  // DOM Elements
  const channelsTableBody = document.getElementById('channelsTableBody');
  const matchesTableBody = document.getElementById('matchesTableBody');
  const sportsNewsTableBody = document.getElementById('sportsNewsTableBody');
  const addChannelForm = document.getElementById('addChannelForm');
  const addMatchForm = document.getElementById('addMatchForm');
  const addNewsForm = document.getElementById('addNewsForm');
  const resetDataBtn = document.getElementById('resetDataBtn');

  // RENDER CHANNELS TABLE
  function renderChannelsTable() {
    if (!channelsTableBody) return;
    channelsTableBody.innerHTML = channels.map((ch) => `
      <tr>
        <td>
          <img src="${ch.logo}" style="width:36px; height:36px; border-radius:50%; object-fit:cover; vertical-align:middle; margin-left:8px;">
          <strong>${ch.name}</strong>
        </td>
        <td><span class="badge-quality">${ch.category}</span></td>
        <td>${ch.country}</td>
        <td>${ch.quality}</td>
        <td>
          <button class="btn-icon" onclick="deleteChannel('${ch.id}')" style="color: var(--danger); border-color: rgba(255,23,68,0.3);">
            <i class="fa-solid fa-trash"></i> حذف
          </button>
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

  // ADD CHANNEL
  if (addChannelForm) {
    addChannelForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newCh = {
        id: 'ch-' + Date.now(),
        name: document.getElementById('chName').value.trim(),
        category: document.getElementById('chCategory').value,
        country: document.getElementById('chCountry').value.trim() || 'عربي',
        quality: document.getElementById('chQuality').value || 'HD',
        logo: document.getElementById('chLogo').value.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=150',
        type: 'youtube',
        streamUrl: document.getElementById('chStreamUrl').value.trim(),
        fallbackUrl: document.getElementById('chStreamUrl').value.trim(),
        description: document.getElementById('chDesc').value.trim() || 'بث مباشر عالي الجودة',
        isFeatured: false,
        viewersCount: Math.floor(Math.random() * 20000) + 5000
      };

      channels.unshift(newCh);
      localStorage.setItem('altv_channels', JSON.stringify(channels));
      renderChannelsTable();
      addChannelForm.reset();
      alert('تم إضافة القناة بنجاح!');
    });
  }

  // ADD MATCH
  if (addMatchForm) {
    addMatchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const streamUrl = document.getElementById('mStreamUrl').value.trim() || 'https://www.youtube.com/embed/5_fQ_1nJpEE?autoplay=1';
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
          { name: 'سيرفر 1 (Full HD)', url: streamUrl },
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
        location.reload();
      }
    });
  }

  // Initial Table Render
  renderChannelsTable();
  renderMatchesTable();
  renderSportsNewsTable();
});
