/**
 * Live Score Auto-Sync Service for Arabia Live TV (arabialivetv.com)
 * 
 * Automatically fetches real-time match scores and statuses from public sports APIs (ESPN Soccer)
 * Matches Arabic/English team names, updates SQLite DB in real time, and triggers notifications.
 */

const https = require('https');
const http = require('http');

// Bilingual dictionary of common Arabic football teams to standardized English tokens
const TEAM_ALIASES = {
  // English Premier League
  'ليفربول': ['liverpool'],
  'برايتون': ['brighton', 'brighton & hove albion'],
  'مانشستر يونايتد': ['manchester united', 'man utd', 'manchester utd'],
  'مانشستر سيتي': ['manchester city', 'man city'],
  'أرسنال': ['arsenal'],
  'ارسنال': ['arsenal'],
  'تشيلسي': ['chelsea'],
  'توتنهام': ['tottenham', 'tottenham hotspur'],
  'بورنموث': ['bournemouth', 'afc bournemouth'],
  'نيوكاسل': ['newcastle', 'newcastle united'],
  'أستون فيلا': ['aston villa'],
  'استون فيلا': ['aston villa'],
  'إيفرتون': ['everton'],
  'ايفرتون': ['everton'],
  'وست هام': ['west ham', 'west ham united'],
  'فولهام': ['fulham'],
  'كريستال بالاس': ['crystal palace'],
  'برينتفورد': ['brentford'],
  'وولفرهامبتون': ['wolverhampton', 'wolves'],
  'نوتينغهام فورست': ['nottingham forest'],
  'ليستر سيتي': ['leicester', 'leicester city'],
  'إيبسويتش تاون': ['ipswich town', 'ipswich'],
  'ساوثهامبتون': ['southampton'],

  // Spanish La Liga
  'ريال مدريد': ['real madrid'],
  'برشلونة': ['barcelona', 'fc barcelona'],
  'أتلتيكو مدريد': ['atletico madrid', 'atlético madrid'],
  'اتلتيكو مدريد': ['atletico madrid'],
  'إشبيلية': ['sevilla'],
  'اشبيلية': ['sevilla'],
  'ريال بيتيس': ['real betis', 'betis'],
  'ريال سوسيداد': ['real sociedad'],
  'أتلتيك بلباو': ['athletic club', 'athletic bilbao'],
  'اتلتيك بلباو': ['athletic club'],
  'فياريال': ['villarreal'],
  'فالنسيا': ['valencia'],
  'جيرونا': ['girona'],
  'سلتا فيغو': ['celta vigo', 'celta de vigo', 'celta'],
  'خيتافي': ['getafe'],
  'أوساسونا': ['osasuna'],
  'مايوركا': ['mallorca', 'rcd mallorca'],
  'لاس بالماس': ['las palmas'],
  'رايو فاليكانو': ['rayo vallecano'],
  'ألافيس': ['alaves', 'deportivo alavés'],
  'إسبانيول': ['espanyol', 'rcd espanyol'],
  'بلد الوليد': ['valladolid', 'real valladolid'],
  'ليغانيس': ['leganes', 'leganés'],

  // Italian Serie A
  'يوفنتوس': ['juventus'],
  'إنتر ميلان': ['internazionale', 'inter', 'inter milan'],
  'انتر ميلان': ['internazionale', 'inter'],
  'إنتر': ['internazionale', 'inter'],
  'ميلان': ['ac milan', 'milan'],
  'نابولي': ['napoli'],
  'روما': ['roma', 'as roma'],
  'لاتسيو': ['lazio'],
  'أتالانتا': ['atalanta'],
  'فيورنتينا': ['fiorentina'],
  'بولونيا': ['bologna'],
  'تورينو': ['torino'],
  'أودينيزي': ['udinese'],
  'اودينيزي': ['udinese'],
  'جنوى': ['genoa'],
  'كالياري': ['cagliari'],
  'بارما': ['parma'],
  'كومو': ['como'],
  'فيرونا': ['hellas verona', 'verona'],
  'إمبولي': ['empoli'],
  'مونزا': ['monza'],
  'فينيسيا': ['venezia'],
  'ليتشي': ['lecce'],

  // German Bundesliga
  'بايرن ميونخ': ['bayern munich', 'bayern münchen', 'bayern'],
  'بوروسيا دورتموند': ['borussia dortmund', 'dortmund'],
  'باير ليفركوزن': ['bayer leverkusen', 'leverkusen'],
  'لايبزيغ': ['rb leipzig', 'leipzig'],
  'آينتراخت فرانكفورت': ['eintracht frankfurt', 'frankfurt'],
  'شتوتغارت': ['vfb stuttgart', 'stuttgart'],
  'فرايبورج': ['sc freiburg', 'freiburg'],
  'فولفسبورغ': ['vfl wolfsburg', 'wolfsburg'],
  'بوروسيا مونشنغلادباخ': ['borussia monchengladbach', 'mönchengladbach'],
  'فيردر بريمن': ['werder bremen', 'bremen'],
  'هوفنهايم': ['tsg hoffenheim', 'hoffenheim'],
  'ماينز': ['mainz 05', 'mainz'],
  'أوغسبورغ': ['augsburg'],
  'يونيون برلين': ['union berlin'],
  'سانت باولي': ['fc st. pauli', 'st. pauli'],
  'هولشتاين كيل': ['holstein kiel'],
  'بوخوم': ['vfl bochum', 'bochum'],
  'هايدنهايم': ['fc heidenheim', 'heidenheim'],

  // French Ligue 1
  'باريس سان جيرمان': ['paris saint-germain', 'psg'],
  'مارسيليا': ['olympique de marseille', 'marseille'],
  'موناكو': ['as monaco', 'monaco'],
  'ليل': ['lille', 'lille osc'],
  'ليون': ['olympique lyonnais', 'lyon'],
  'نيس': ['nice', 'ogc nice'],
  'لانس': ['lens', 'rc lens'],
  'رين': ['rennes', 'stade rennais'],

  // Saudi Pro League
  'الهلال': ['al hilal', 'al-hilal'],
  'النصر': ['al nassr', 'al-nassr'],
  'الاتحاد': ['al ittihad', 'al-ittihad'],
  'الأهلي السعودي': ['al ahli', 'al-ahli'],
  'الشباب': ['al shabab', 'al-shabab'],
  'الاتفاق': ['al ettifaq', 'al-ettifaq'],
  'التعاون': ['al taawoun', 'al-taawoun'],
  'الفتح': ['al fateh', 'al-fateh'],
  'ضمك': ['damac'],
  'الفيحاء': ['al faiha', 'al fayha'],
  'الرائد': ['al raed'],
  'الوحدة السعودي': ['al wehda'],
  'الخليج': ['al khaleej'],
  'الأخدود': ['al akhdoud'],
  'العروبة': ['al orobah', 'al-orobah'],
  'القادسية': ['al qadsiah'],

  // African & Arab Champions
  'الأهلي المصري': ['al ahly', 'al-ahly', 'ahly'],
  'الأهلي': ['al ahly', 'al-ahly', 'ahly'],
  'الزمالك': ['zamalek'],
  'بيراميدز': ['pyramids', 'pyramids fc'],
  'الترجي': ['esperance', 'esperance tunis', 'es tunis'],
  'الإفريقي التونسي': ['club africain'],
  'النجم الساحلي': ['etoile du sahel'],
  'الصفاقسي': ['cs sfaxien'],
  'الوداد': ['wydad', 'wydad casablanca', 'wac'],
  'الرجاء': ['raja', 'raja casablanca'],
  'الجيش الملكي': ['as far', 'far rabat'],
  'نهضة بركان': ['rs berkane'],
  'شباب بلوزداد': ['cr belouizdad'],
  'مولودية الجزائر': ['mc alger'],
  'وفاق سطيف': ['es setif'],
  'شبيبة القبائل': ['js kabylie'],
  'الهلال السوداني': ['al hilal omdurman'],
  'المريخ السوداني': ['al merreikh'],
  'تي بي مازيمبي': ['tp mazembe', 'mazembe'],
  'ماميلودي صن داونز': ['mamelodi sundowns', 'sundowns'],
  'سيمبا': ['simba sc', 'simba'],
  'يانغ أفريكانز': ['young africans'],
  'أسيك ميموزا': ['asec mimosas'],
  'كيتارا الأوغندي': ['kitara', 'kitara fc']
};

// Leagues to query on ESPN
const SUPPORTED_LEAGUES = [
  'eng.1',          // English Premier League
  'esp.1',          // Spanish La Liga
  'ita.1',          // Italian Serie A
  'ger.1',          // German Bundesliga
  'fra.1',          // French Ligue 1
  'uefa.champions', // UEFA Champions League
  'uefa.europa',    // UEFA Europa League
  'caf.champions',  // CAF Champions League
  'ksa.1',          // Saudi Pro League
  'afc.champions'   // AFC Champions League
];

function normalizeStr(s) {
  if (!s) return '';
  return s.toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove arabic tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[^a-z0-9\u0621-\u064A ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function teamMatches(arabicName, englishName) {
  if (!arabicName || !englishName) return false;
  const aNorm = normalizeStr(arabicName);
  const eNorm = normalizeStr(englishName);

  // Direct include check
  if (eNorm.includes(aNorm) || aNorm.includes(eNorm)) return true;

  // Check alias table
  for (const [ar, aliases] of Object.entries(TEAM_ALIASES)) {
    const arNorm = normalizeStr(ar);
    if (aNorm === arNorm || aNorm.includes(arNorm) || arNorm.includes(aNorm)) {
      for (const al of aliases) {
        const alNorm = normalizeStr(al);
        if (eNorm.includes(alNorm) || alNorm.includes(eNorm)) {
          return true;
        }
      }
    }
  }

  return false;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, timeout: 12000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject).on('timeout', () => reject(new Error('Timeout')));
  });
}

/**
 * Fetch all events across supported leagues from ESPN
 */
async function fetchAllLiveEvents() {
  const allEvents = [];
  for (const lg of SUPPORTED_LEAGUES) {
    try {
      const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/${lg}/scoreboard`;
      const data = await fetchJson(url);
      const events = data.events || [];
      events.forEach(ev => {
        ev._leagueCode = lg;
      });
      allEvents.push(...events);
    } catch (err) {
      // League fetch error or timeout, continue with others
    }
  }
  return allEvents;
}

/**
 * Synchronize live scores with local / production SQLite database
 * @param {Object} db - Database module
 * @param {Function} [notifyGoalFn] - Optional goal notify handler
 * @returns {Promise<Object>} sync summary
 */
async function syncLiveScores(db, notifyGoalFn = null) {
  if (!db || typeof db.getAllMatches !== 'function') {
    throw new Error('Database instance is required for sync');
  }

  const currentMatches = db.getAllMatches();
  if (!currentMatches || currentMatches.length === 0) {
    return { success: true, updated: 0, message: 'لا توجد مباريات مدرجة في قاعدة البيانات' };
  }

  const events = await fetchAllLiveEvents();
  let updatedCount = 0;
  const updates = [];

  for (const match of currentMatches) {
    // Find matching ESPN event
    const matchedEvent = events.find(ev => {
      const comps = ev.competitions && ev.competitions[0] && ev.competitions[0].competitors;
      if (!comps || comps.length < 2) return false;
      const c1Name = comps[0].team.displayName || comps[0].team.name || '';
      const c2Name = comps[1].team.displayName || comps[1].team.name || '';

      const match1 = (teamMatches(match.homeTeam, c1Name) && teamMatches(match.awayTeam, c2Name)) ||
                     (teamMatches(match.homeTeam, c2Name) && teamMatches(match.awayTeam, c1Name));
      return match1;
    });

    if (matchedEvent) {
      const comps = matchedEvent.competitions[0].competitors;
      const st = matchedEvent.status && matchedEvent.status.type ? matchedEvent.status.type : {};
      const state = st.state; // 'pre', 'in', 'post'

      // Identify which competitor corresponds to home team
      let homeComp = comps[0];
      let awayComp = comps[1];

      if (teamMatches(match.awayTeam, homeComp.team.displayName || homeComp.team.name)) {
        // Swap
        homeComp = comps[1];
        awayComp = comps[0];
      }

      const homeScore = homeComp && homeComp.score !== undefined ? String(homeComp.score) : '0';
      const awayScore = awayComp && awayComp.score !== undefined ? String(awayComp.score) : '0';

      let newStatus = match.status;
      let newScore = match.score;

      if (state === 'in') {
        newStatus = 'live';
        newScore = `${homeScore} - ${awayScore}`;
      } else if (state === 'post') {
        newStatus = 'ended';
        newScore = `${homeScore} - ${awayScore}`;
      } else if (state === 'pre') {
        newStatus = 'upcoming';
        if (!newScore || newScore !== 'vs') {
          // If pre-match, default to vs unless manual score
          newScore = 'vs';
        }
      }

      // Check if update is needed
      const scoreChanged = newScore !== match.score;
      const statusChanged = newStatus !== match.status;

      if (scoreChanged || statusChanged) {
        db.updateMatchScore(match.id, newScore, newStatus);
        updatedCount++;
        updates.push({
          id: match.id,
          title: `${match.homeTeam} vs ${match.awayTeam}`,
          oldScore: match.score,
          newScore,
          oldStatus: match.status,
          newStatus
        });

        // Trigger WhatsApp Goal notification if live score changed
        if (scoreChanged && newStatus === 'live' && typeof notifyGoalFn === 'function') {
          try {
            await notifyGoalFn(
              { ...match, score: newScore, status: newStatus },
              match.score,
              newScore,
              'تحديث تلقائي آلي'
            );
          } catch (e) {
            console.error('Goal notify err:', e.message);
          }
        }
      }
    }
  }

  return {
    success: true,
    totalMatches: currentMatches.length,
    eventsQueried: events.length,
    updatedCount,
    updates
  };
}

module.exports = {
  syncLiveScores,
  fetchAllLiveEvents,
  teamMatches,
  TEAM_ALIASES,
  SUPPORTED_LEAGUES
};
