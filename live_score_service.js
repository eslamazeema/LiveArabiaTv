/**
 * Live Score Auto-Sync Service for Arabia Live TV (arabialivetv.com)
 * 
 * Automatically fetches real-time match scores and statuses from public sports APIs (ESPN Soccer)
 * Matches Arabic/English team names, updates SQLite DB in real time, and triggers notifications.
 */

const https = require('https');
const http = require('http');
const clubsCatalog = require('./clubs_catalog');

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

  // Turkish Süper Lig
  'غلطة سراي': ['galatasaray'],
  'فنربخشة': ['fenerbahce', 'fenerbahçe'],
  'بشكتاش': ['besiktas', 'beşiktaş'],
  'طرابزون سبور': ['trabzonspor'],
  'إسطنبول باشاك شهير': ['istanbul basaksehir', 'basaksehir'],
  'قاسم باشا': ['kasimpasa'],
  'سيفاس سبور': ['sivasspor'],
  'أنطاليا سبور': ['antalyaspor'],
  'قونية سبور': ['konyaspor'],
  'قيصري سبور': ['kayserispor'],
  'غازي عنتاب': ['gaziantep'],
  'سامسون سبور': ['samsunspor'],
  'ريزه سبور': ['rizespor', 'caykur rizespor'],
  'ألانيا سبور': ['alanyaspor'],
  'أيوب سبور': ['eyupspor'],
  'جوزتيبي': ['goztepe'],
  'بودروم': ['bodrum'],
  'أضنة ديميرسبور': ['adana demirspor'],
  'هاتاي سبور': ['hatayspor'],

  // Brazilian Serie A
  'فلامينغو': ['flamengo'],
  'بالميراس': ['palmeiras'],
  'ساو باولو': ['sao paulo', 'são paulo'],
  'كورينثيانز': ['corinthians'],
  'فلومينينسي': ['fluminense'],
  'بوتافوغو': ['botafogo'],
  'غريميو': ['gremio', 'grêmio'],
  'إنترناسيونال': ['internacional'],
  'أتلتيكو مينيرو': ['atletico mineiro', 'atlético mineiro'],
  'كروزيرو': ['cruzeiro'],
  'فاسكو دا غاما': ['vasco da gama', 'vasco'],
  'سانتوس': ['santos'],
  'باهيا': ['bahia'],
  'فورتاليزا': ['fortaleza'],
  'أتلتيكو باراناينسي': ['athletico paranaense', 'atletico paranaense'],
  'ريد بول براغانتينو': ['red bull bragantino', 'bragantino'],
  'كويابا': ['cuiaba'],
  'فيتوريا': ['vitoria'],
  'يوفنتود': ['juventude'],
  'كريسيوما': ['criciuma'],
  'أتلتيكو غويانينسي': ['atletico goianiense'],

  // German Cup (DFB-Pokal)
  'شالكه': ['schalke 04', 'schalke'],
  'هيرتا برلين': ['hertha bsc', 'hertha berlin', 'hertha'],
  'هامبورغ': ['hamburger sv', 'hamburg'],
  'هانوفر': ['hannover 96', 'hannover'],
  'كولن': ['1. fc koln', 'fc koln', 'cologne'],
  'كايزرسلاوترن': ['kaiserslautern'],
  'فورتونا دوسلدورف': ['fortuna dusseldorf', 'dusseldorf'],
  'نورنبرغ': ['1. fc nurnberg', 'nurnberg', 'نورنبرج'],
  'بادربورن': ['sc paderborn 07', 'paderborn'],
  'ماغديبورغ': ['1. fc magdeburg', 'magdeburg', 'ماجديبورج'],
  'دينامو دريسدن': ['dynamo dresden', 'دريسدين'],
  'كارلسروه': ['karlsruher sc', 'karlsruhe'],
  'أرمينيا بيليفيلد': ['arminia bielefeld', 'bielefeld'],
  'غرويتر فورت': ['greuther furth'],
  'دارمشتات': ['darmstadt'],
  'آينتراخت براونشفايغ': ['braunschweig'],
  'إلفرسبيرغ': ['elversberg'],
  'برويسن مونستر': ['preussen munster'],
  'أولم': ['ssv ulm', 'ulm'],
  'يان ريغنسبورغ': ['jahn regensburg'],

  // Egyptian Premier League & African Champions
  'الأهلي المصري': ['al ahly', 'al-ahly', 'ahly'],
  'الأهلي': ['al ahly', 'al-ahly', 'ahly'],
  'الزمالك': ['zamalek'],
  'المقاولون العرب': ['al mokawloon', 'mokawloon', 'arab contractors'],
  'البنك الأهلي': ['national bank of egypt', 'bank al ahly', 'national bank'],
  'طلائع الجيش': ['tala\'ea el gaish', 'talaea el gaish', 'el gaish'],
  'فاركو': ['pharco'],
  'غزل المحلة': ['ghazl el mahalla'],
  'حرس الحدود': ['haras el hodood'],
  'بتروجيت': ['petrojet'],
  'مودرن سبورت': ['modern sport', 'modern future', 'future fc'],
  'بلدية المحلة': ['baladiyat el mahalla'],
  'الداخلية': ['el dakhleya', 'dakhleya'],
  'بيراميدز': ['pyramids', 'pyramids fc'],
  'الإسماعيلي': ['ismaily', 'al ismaily'],
  'المصري البورسعيدي': ['al masry', 'masry', 'المصري'],
  'الاتحاد السكندري': ['al ittihad alexandria', 'ittihad alexandria'],
  'سيراميكا كليوباترا': ['ceramica cleopatra'],
  'زد': ['zed', 'zed fc'],
  'سموحة': ['smouha'],
  'إنبي': ['enppi'],
  'الجونة': ['el gouna', 'gouna'],
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
  'ksa.1',          // Saudi Pro League (دوري روشن السعودي)
  'afc.champions',  // AFC Champions League Elite (دوري أبطال آسيا للنخبة)
  'tur.1',          // Turkish Süper Lig (الدوري التركي الممتاز)
  'bra.1',          // Brazilian Serie A (الدوري البرازيلي)
  'ger.dfb_pokal'   // German Cup (كأس ألمانيا - DFB-Pokal)
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
 * Calculate match kickoff timestamp in milliseconds
 * Supports utcTime ISO string, or combining date/dateIso and time (Riyadh/Cairo GMT+3 ref)
 */
function getMatchKickoffMs(m) {
  if (m.utcTime) {
    const t = new Date(m.utcTime).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  const dateStr = (m.dateIso || m.date || '').trim();
  const timeStr = (m.time || '').trim();
  if (dateStr && timeStr) {
    const dM = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    const tM = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (dM && tM) {
      const year = parseInt(dM[1], 10);
      const month = parseInt(dM[2], 10) - 1;
      const day = parseInt(dM[3], 10);
      const hour = parseInt(tM[1], 10);
      const min = parseInt(tM[2], 10);
      // Reference timezone for stored times is Asia/Riyadh / GMT+3
      return Date.UTC(year, month, day, hour - 3, min);
    }
  }
  return null;
}

/**
 * Fetch today's Arab, Egyptian, and Gulf match fixtures from FilGoal JSON-LD Schema
 */
async function fetchFilgoalTodayMatches() {
  const matches = [];
  try {
    const html = await new Promise((resolve, reject) => {
      https.get('https://www.filgoal.com/matches', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 10000
      }, res => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve(body));
      }).on('error', reject);
    });

    const scriptRegex = /<script type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    while ((match = scriptRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (data && data.itemListElement) {
          for (const item of data.itemListElement) {
            const ev = item.item;
            if (ev && ev['@type'] === 'SportsEvent' && ev.homeTeam && ev.awayTeam) {
              matches.push(ev);
            }
          }
        }
      } catch (_) {}
    }
  } catch (err) {
    // Network or parse issue, continue with ESPN feeds
  }
  return matches;
}

/**
 * Synchronize live scores with local / production SQLite database
 * Runs automatically every 2 minutes:
 *  - Matches live scores from ESPN
 *  - Automatically changes status from (upcoming / قريباً) to (live / مباشر الان) when kickoff time arrives
 *  - Automatically changes status from (live / مباشر الان) to (ended / انتهت) after match ends (>= 120 mins)
 *  - Triggers WhatsApp notifications upon live score updates
 * 
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
  const now = Date.now();

  for (const match of currentMatches) {
    // 1. Try to find matching ESPN event
    const matchedEvent = events.find(ev => {
      const comps = ev.competitions && ev.competitions[0] && ev.competitions[0].competitors;
      if (!comps || comps.length < 2) return false;
      const c1Name = comps[0].team.displayName || comps[0].team.name || '';
      const c2Name = comps[1].team.displayName || comps[1].team.name || '';

      const match1 = (teamMatches(match.homeTeam, c1Name) && teamMatches(match.awayTeam, c2Name)) ||
                     (teamMatches(match.homeTeam, c2Name) && teamMatches(match.awayTeam, c1Name));
      return match1;
    });

    let newStatus = match.status;
    let newScore = match.score;
    const kickoffMs = getMatchKickoffMs(match);
    const elapsedMinutes = kickoffMs ? (now - kickoffMs) / 60000 : null;

    if (matchedEvent) {
      const comps = matchedEvent.competitions[0].competitors;
      const st = matchedEvent.status && matchedEvent.status.type ? matchedEvent.status.type : {};
      const state = st.state; // 'pre', 'in', 'post'

      // Identify which competitor corresponds to home team
      let homeComp = comps[0];
      let awayComp = comps[1];

      if (teamMatches(match.awayTeam, homeComp.team.displayName || homeComp.team.name)) {
        homeComp = comps[1];
        awayComp = comps[0];
      }

      const homeScore = homeComp && homeComp.score !== undefined ? String(homeComp.score) : '0';
      const awayScore = awayComp && awayComp.score !== undefined ? String(awayComp.score) : '0';

      if (state === 'in') {
        newStatus = 'live';
        newScore = `${homeScore} - ${awayScore}`;
      } else if (state === 'post') {
        newStatus = 'ended';
        newScore = `${homeScore} - ${awayScore}`;
      } else if (state === 'pre') {
        // If kickoff time has arrived (0 <= elapsed < 120 mins)
        if (elapsedMinutes !== null && elapsedMinutes >= 0 && elapsedMinutes < 120) {
          newStatus = 'live';
          if (!newScore || newScore === 'vs') {
            newScore = '0 - 0';
          }
        } else if (elapsedMinutes !== null && elapsedMinutes >= 120) {
          newStatus = 'ended';
        } else {
          newStatus = 'upcoming';
          if (!newScore || newScore !== 'vs') {
            newScore = 'vs';
          }
        }
      }
    } else {
      // 2. Not found in ESPN (e.g. Egyptian Premier League, Gulf Champions League, or custom match)
      // Perform automated time-based transition:
      // (upcoming -> live with 0 - 0 at kickoff, live -> ended after 120 mins)
      if (elapsedMinutes !== null) {
        if (elapsedMinutes >= 0 && elapsedMinutes < 120) {
          if (match.status === 'upcoming') {
            newStatus = 'live';
            if (!newScore || newScore === 'vs') {
              newScore = '0 - 0';
            }
          }
        } else if (elapsedMinutes >= 120) {
          if (match.status === 'live') {
            newStatus = 'ended';
          }
        }
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

  return {
    success: true,
    totalMatches: currentMatches.length,
    eventsQueried: events.length,
    updatedCount,
    updates
  };
}

const LEAGUE_META = {
  // Top 7 Priority Competitions requested by user:
  'egy.1': { name: 'الدوري المصري الممتاز', flag: '🇪🇬', channel: 'أون تايم سبورتس 1' },
  'tur.1': { name: 'الدوري التركي الممتاز', flag: '🇹🇷', channel: 'beIN SPORTS TR' },
  'ksa.1': { name: 'دوري روشن السعودي', flag: '🇸🇦', channel: 'SSC 1 HD' },
  'afc.champions': { name: 'دوري أبطال آسيا للنخبة', flag: '🌏', channel: 'beIN AFC HD' },
  'gulf.champions': { name: 'دوري أبطال الخليج للأندية', flag: '🏆', channel: 'الكأس 1 HD' },
  'bra.1': { name: 'الدوري البرازيلي - Serie A', flag: '🇧🇷', channel: 'SSC EXTRA 1 HD' },
  'ger.dfb_pokal': { name: 'كأس ألمانيا - DFB-Pokal', flag: '🇩🇪', channel: 'دبي الرياضية 1' },

  // Major European & Continental Leagues:
  'eng.1': { name: 'الدوري الإنجليزي الممتاز', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', channel: 'بي إن سبورتس 1 HD' },
  'esp.1': { name: 'الدوري الإسباني - La Liga', flag: '🇪🇸', channel: 'بي إن سبورتس 1 HD' },
  'ita.1': { name: 'الدوري الإيطالي - Serie A', flag: '🇮🇹', channel: 'أبوظبي الرياضية بريميوم 1' },
  'ger.1': { name: 'الدوري الألماني - Bundesliga', flag: '🇩🇪', channel: 'بي إن سبورتس 2 HD' },
  'fra.1': { name: 'الدوري الفرنسي - Ligue 1', flag: '🇫🇷', channel: 'بي إن سبورتس 4 HD' },
  'uefa.champions': { name: 'دوري أبطال أوروبا', flag: '🇪🇺', channel: 'بي إن سبورتس 1 HD' },
  'uefa.europa': { name: 'الدوري الأوروبي', flag: '🇪🇺', channel: 'بي إن سبورتس 2 HD' },
  'caf.champions': { name: 'دوري أبطال إفريقيا', flag: '🌍', channel: 'بي إن سبورتس 6 HD' }
};

function findArabicTeamName(englishName) {
  if (!englishName) return '';
  const resolved = clubsCatalog.resolveTeam(englishName);
  if (resolved && resolved.name && !/^[a-zA-Z\s]+$/.test(resolved.name)) {
    return resolved.name;
  }
  const eNorm = normalizeStr(englishName);
  for (const [arName, aliases] of Object.entries(TEAM_ALIASES)) {
    for (const al of aliases) {
      const alNorm = normalizeStr(al);
      if (eNorm === alNorm || eNorm.includes(alNorm) || alNorm.includes(eNorm)) {
        return arName;
      }
    }
  }
  return resolved.name || englishName;
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\w\u0621-\u064A]+/gu, '-')
    .replace(/^-+|-+$/g, '') || 'match';
}

/**
 * Fetch and automatically add today's match fixtures into the database.
 * Supports:
 *  1. الدوري المصري الممتاز (Egyptian Premier League via FilGoal)
 *  2. الدوري التركي الممتاز (Turkish Süper Lig via ESPN tur.1)
 *  3. دوري روشن السعودي (Saudi Pro League via ESPN ksa.1)
 *  4. دوري أبطال آسيا للنخبة (AFC Champions League Elite via ESPN afc.champions)
 *  5. دوري أبطال الخليج للأندية (Gulf Club Champions League via FilGoal)
 *  6. الدوري البرازيلي - Serie A (Brazilian Serie A via ESPN bra.1)
 *  7. كأس ألمانيا - DFB-Pokal (German Cup via ESPN ger.dfb_pokal)
 *  Plus all major European & Continental Leagues.
 * 
 * Standardizes Arabic club names and badges with zero impact on other DB data.
 * 
 * @param {Object} db - Database module
 * @returns {Promise<Object>} Added fixtures summary
 */
async function fetchAndAddTodayFixtures(db) {
  if (!db || typeof db.getAllMatches !== 'function') {
    throw new Error('Database instance is required');
  }

  const currentMatches = db.getAllMatches();
  const espnEvents = await fetchAllLiveEvents();
  const filgoalEvents = await fetchFilgoalTodayMatches();
  const now = Date.now();
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];

  const addedMatches = [];
  let existingCount = 0;

  // 1. Process ESPN Events across all supported leagues
  for (const ev of espnEvents) {
    const comps = ev.competitions && ev.competitions[0] && ev.competitions[0].competitors;
    if (!comps || comps.length < 2) continue;

    const evDateStr = ev.date ? String(ev.date).slice(0, 10) : '';
    const st = ev.status && ev.status.type ? ev.status.type.state : '';
    const isTodayEvent = evDateStr === todayIso || st === 'in';

    if (!isTodayEvent) continue;

    const rawHome = comps[0].team.displayName || comps[0].team.name || 'الفريق الأول';
    const rawAway = comps[1].team.displayName || comps[1].team.name || 'الفريق الثاني';
    const rawHomeLogo = comps[0].team.logo || '';
    const rawAwayLogo = comps[1].team.logo || '';

    const resolvedHome = clubsCatalog.resolveTeam(rawHome, rawHomeLogo);
    const resolvedAway = clubsCatalog.resolveTeam(rawAway, rawAwayLogo);

    const homeArabic = resolvedHome.name;
    const homeLogoUrl = resolvedHome.logo;
    const awayArabic = resolvedAway.name;
    const awayLogoUrl = resolvedAway.logo;

    // Deduplication check against DB & added matches
    const alreadyExists = currentMatches.some(m => {
      return (teamMatches(m.homeTeam, rawHome) && teamMatches(m.awayTeam, rawAway)) ||
             (teamMatches(m.homeTeam, rawAway) && teamMatches(m.awayTeam, rawHome)) ||
             (m.homeTeam === homeArabic && m.awayTeam === awayArabic);
    }) || addedMatches.some(a => a.homeTeam === homeArabic && a.awayTeam === awayArabic);

    if (alreadyExists) {
      existingCount++;
      continue;
    }

    let matchTimeStr = '20:00';
    let matchUtcIso = '';
    let matchDateIso = todayIso;
    let kickoffMs = null;
    try {
      if (ev.date) {
        const d = new Date(ev.date);
        matchUtcIso = d.toISOString();
        kickoffMs = d.getTime();
        try {
          matchTimeStr = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Asia/Riyadh',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }).format(d);
        } catch (_) {
          const ksaHours = String((d.getUTCHours() + 3) % 24).padStart(2, '0');
          const mins = String(d.getUTCMinutes()).padStart(2, '0');
          matchTimeStr = `${ksaHours}:${mins}`;
        }
        try {
          matchDateIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(d);
        } catch (_) {
          matchDateIso = d.toISOString().split('T')[0];
        }
      }
    } catch (_) {}

    const lgCode = ev._leagueCode || 'eng.1';
    const lgMeta = LEAGUE_META[lgCode] || { name: 'مباراة دولية', flag: '⚽', channel: 'قناة رياضية' };

    const homeScore = comps[0].score !== undefined ? String(comps[0].score) : '0';
    const awayScore = comps[1].score !== undefined ? String(comps[1].score) : '0';

    let initialStatus = 'upcoming';
    let initialScore = 'vs';
    const elapsed = kickoffMs ? (now - kickoffMs) / 60000 : null;

    if (st === 'in' || (elapsed !== null && elapsed >= 0 && elapsed < 120)) {
      initialStatus = 'live';
      initialScore = (st === 'in' ? `${homeScore} - ${awayScore}` : '0 - 0');
    } else if (st === 'post' || (elapsed !== null && elapsed >= 120)) {
      initialStatus = 'ended';
      initialScore = `${homeScore} - ${awayScore}`;
    }

    const newMatch = {
      id: `match-${slugify(rawHome)}-${slugify(rawAway)}-${Date.now() % 100000}`,
      league: lgMeta.name,
      leagueFlag: lgMeta.flag,
      homeTeam: homeArabic,
      homeLogo: homeLogoUrl,
      awayTeam: awayArabic,
      awayLogo: awayLogoUrl,
      time: matchTimeStr,
      utcTime: matchUtcIso,
      date: matchDateIso,
      dateIso: matchDateIso,
      status: initialStatus,
      channelName: lgMeta.channel,
      channelId: '',
      commentator: 'معلق متميز',
      stadium: (ev.competitions[0].venue ? ev.competitions[0].venue.fullName : 'استاد المباراة'),
      score: initialScore,
      servers: [
        { name: 'سيرفر البث 1 (HD)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
        { name: 'سيرفر البث 2 (سريع)', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' }
      ],
      sortOrder: (currentMatches.length + addedMatches.length + 1)
    };

    const created = db.createMatch(newMatch);
    if (created) {
      addedMatches.push(created);
    }
  }

  // 2. Process FilGoal Events (Egyptian Premier League & Gulf Club Champions League)
  for (const fg of filgoalEvents) {
    const rawHome = fg.homeTeam ? fg.homeTeam.name : '';
    const rawAway = fg.awayTeam ? fg.awayTeam.name : '';
    if (!rawHome || !rawAway) continue;

    const desc = fg.name || fg.description || '';
    let lgMeta = null;
    if (desc.includes('المصري') || desc.includes('الدوري المصري')) {
      lgMeta = LEAGUE_META['egy.1'];
    } else if (desc.includes('الخليج') || desc.includes('دوري أبطال الخليج')) {
      lgMeta = LEAGUE_META['gulf.champions'];
    }

    // Only process if it is Egyptian League or Gulf Champions or target leagues
    if (!lgMeta) continue;

    const resolvedHome = clubsCatalog.resolveTeam(rawHome);
    const resolvedAway = clubsCatalog.resolveTeam(rawAway);
    const homeArabic = resolvedHome.name;
    const awayArabic = resolvedAway.name;

    const alreadyExists = currentMatches.some(m => {
      return (teamMatches(m.homeTeam, rawHome) && teamMatches(m.awayTeam, rawAway)) ||
             (teamMatches(m.homeTeam, rawAway) && teamMatches(m.awayTeam, rawHome)) ||
             (m.homeTeam === homeArabic && m.awayTeam === awayArabic);
    }) || addedMatches.some(a => a.homeTeam === homeArabic && a.awayTeam === awayArabic);

    if (alreadyExists) {
      existingCount++;
      continue;
    }

    let matchTimeStr = '20:00';
    let matchUtcIso = '';
    let matchDateIso = todayIso;
    let kickoffMs = null;

    try {
      if (fg.startDate) {
        const d = new Date(fg.startDate);
        if (!isNaN(d.getTime())) {
          matchUtcIso = d.toISOString();
          kickoffMs = d.getTime();
          try {
            matchTimeStr = new Intl.DateTimeFormat('en-GB', {
              timeZone: 'Asia/Riyadh',
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            }).format(d);
          } catch (_) {
            const ksaHours = String((d.getUTCHours() + 3) % 24).padStart(2, '0');
            const mins = String(d.getUTCMinutes()).padStart(2, '0');
            matchTimeStr = `${ksaHours}:${mins}`;
          }
          try {
            matchDateIso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Riyadh' }).format(d);
          } catch (_) {
            matchDateIso = d.toISOString().split('T')[0];
          }
        }
      }
    } catch (_) {}

    let initialStatus = 'upcoming';
    let initialScore = 'vs';
    const elapsed = kickoffMs ? (now - kickoffMs) / 60000 : null;

    if (elapsed !== null && elapsed >= 0 && elapsed < 120) {
      initialStatus = 'live';
      initialScore = '0 - 0';
    } else if (elapsed !== null && elapsed >= 120) {
      initialStatus = 'ended';
      initialScore = '0 - 0';
    }

    const newMatch = {
      id: `match-${slugify(rawHome)}-${slugify(rawAway)}-${Date.now() % 100000}`,
      league: lgMeta.name,
      leagueFlag: lgMeta.flag,
      homeTeam: homeArabic,
      homeLogo: resolvedHome.logo || '',
      awayTeam: awayArabic,
      awayLogo: resolvedAway.logo || '',
      time: matchTimeStr,
      utcTime: matchUtcIso,
      date: matchDateIso,
      dateIso: matchDateIso,
      status: initialStatus,
      channelName: lgMeta.channel,
      channelId: '',
      commentator: 'معلق متميز',
      stadium: fg.location ? fg.location.name : 'استاد المباراة',
      score: initialScore,
      servers: [
        { name: 'سيرفر البث 1 (HD)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
        { name: 'سيرفر البث 2 (سريع)', url: 'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8' }
      ],
      sortOrder: (currentMatches.length + addedMatches.length + 1)
    };

    const created = db.createMatch(newMatch);
    if (created) {
      addedMatches.push(created);
    }
  }

  return {
    success: true,
    addedCount: addedMatches.length,
    existingCount,
    addedMatches
  };
}

module.exports = {
  syncLiveScores,
  fetchAllLiveEvents,
  fetchFilgoalTodayMatches,
  fetchAndAddTodayFixtures,
  findArabicTeamName,
  teamMatches,
  getMatchKickoffMs,
  TEAM_ALIASES,
  SUPPORTED_LEAGUES,
  LEAGUE_META
};

