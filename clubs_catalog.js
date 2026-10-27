/**
 * Arabia Live TV (arabialivetv.com) - Official Clubs & Badges Catalog
 * 
 * Standardizes Arabic club names and provides high-resolution official team badges.
 */

const CLUBS = {
  // Saudi Pro League
  "الهلال": {
    aliases: ["al hilal", "al-hilal", "alhilal", "al hilal riyadh"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/929.png"
  },
  "النصر": {
    aliases: ["al nassr", "al-nassr", "alnassr", "al nassr riyadh"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/817.png"
  },
  "الاتحاد": {
    aliases: ["al ittihad", "al-ittihad", "alittihad", "ittihad jeddah"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2276.png"
  },
  "الأهلي السعودي": {
    aliases: ["al ahli", "al-ahli", "alahli", "al ahli saudi", "ahli jeddah"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8346.png"
  },
  "الشباب": {
    aliases: ["al shabab", "al-shabab", "alshabab"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/793.png"
  },
  "الاتفاق": {
    aliases: ["al ettifaq", "al-ettifaq", "alettifaq"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8363.png"
  },
  "التعاون": {
    aliases: ["al taawoun", "al-taawoun", "altaawoun"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18459.png"
  },
  "الفتح": {
    aliases: ["al fateh", "al-fateh", "alfateh"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/13033.png"
  },
  "ضمك": {
    aliases: ["damac"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/22026.png"
  },
  "الفيحاء": {
    aliases: ["al faiha", "al-faiha", "al fayha"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/21827.png"
  },
  "الرائد": {
    aliases: ["al raed", "al-raed"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/13034.png"
  },
  "الوحدة السعودي": {
    aliases: ["al wehda", "al-wehda", "al wahda mecca"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/13035.png"
  },
  "الخليج": {
    aliases: ["al khaleej", "al-khaleej"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/21829.png"
  },
  "الأخدود": {
    aliases: ["al akhdoud", "al-akhdoud", "al okhdood"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/22025.png"
  },
  "العروبة": {
    aliases: ["al orobah", "al-orobah", "al oroba"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18458.png"
  },
  "القادسية": {
    aliases: ["al qadsiah", "al-qadsiah", "al qadisiya"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/22022.png"
  },
  "الخلود": {
    aliases: ["al kholood", "al-kholood"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/22028.png"
  },
  "الرياض": {
    aliases: ["al riyadh", "al-riyadh"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/21965.png"
  },
  "أبها": {
    aliases: ["abha", "abha club"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/21828.png"
  },
  "الفيصلي": {
    aliases: ["al faisaly", "al-faisaly", "al faisaly fc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/13033.png"
  },

  // Asian & Gulf Giants
  "العين": {
    aliases: ["al ain", "al-ain", "al ain fc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7128.png"
  },
  "الوصل": {
    aliases: ["al wasl", "al-wasl", "al wasl sc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8365.png"
  },
  "شباب الأهلي": {
    aliases: ["shabab al ahli", "shabab al-ahli", "al ahli dubai"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6968.png"
  },
  "الشارقة": {
    aliases: ["sharjah", "al sharjah"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6967.png"
  },
  "الوحدة الإماراتي": {
    aliases: ["al wahda", "al-wahda", "al wahda abu dhabi"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6969.png"
  },
  "السد": {
    aliases: ["al sadd", "al-sadd", "al sadd sc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7135.png"
  },
  "الدحيل": {
    aliases: ["al duhail", "al-duhail", "lekhwiya"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/11382.png"
  },
  "الغرافة": {
    aliases: ["al-gharafa", "al gharafa", "algharafa"],
    logo: "https://a.espncdn.com/guid/a0ee48aa-0d67-c802-ac49-7492db10d894/logos/default.png"
  },
  "الريان": {
    aliases: ["al rayyan", "al-rayyan", "al rayan"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7091.png"
  },
  "تراكتور": {
    aliases: ["tractor", "tractor sazi", "tractor sc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8364.png"
  },
  "برسيبوليس": {
    aliases: ["persepolis", "perspolis"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8362.png"
  },
  "استقلال طهران": {
    aliases: ["esteghlal", "esteghlal tehran"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8361.png"
  },
  "سباهان": {
    aliases: ["sepahan", "sepahan isfahan"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8360.png"
  },
  "القوة الجوية": {
    aliases: ["al-quwa al-jawiya", "al quwa al jawiya", "air force club"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18465.png"
  },
  "الشرطة العراقي": {
    aliases: ["al shorta", "al-shorta"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18466.png"
  },
  "باختاكور": {
    aliases: ["pakhtakor", "pakhtakor tashkent"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8366.png"
  },
  "نيفتشي فرغانة": {
    aliases: ["neftchi fergana", "neftchi"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18467.png"
  },
  "نسف قرشي": {
    aliases: ["nasaf", "nasaf qarshi"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18468.png"
  },

  // Egyptian Premier League & African Champions
  "الأهلي المصري": {
    aliases: ["al ahly", "al-ahly", "ahly", "al ahly cairo", "الأهلي"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/8c/Al_Ahly_SC_logo.png"
  },
  "الزمالك": {
    aliases: ["zamalek", "zamalek sc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/04/ZamalekSC.png"
  },
  "بيراميدز": {
    aliases: ["pyramids", "pyramids fc"],
    logo: "https://upload.wikimedia.org/wikipedia/en/9/91/Pyramids_FC_logo.svg.png"
  },
  "الإسماعيلي": {
    aliases: ["ismaily", "al ismaily"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/00/IsmailySC.png"
  },
  "المصري البورسعيدي": {
    aliases: ["al masry", "masry", "al masry club"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/f/fe/Al_Masry_Logo.png"
  },
  "الاتحاد السكندري": {
    aliases: ["al ittihad alexandria", "ittihad alexandria"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/5/52/Al_Ittihad_Alexandria_Club_Logo.png"
  },
  "سيراميكا كليوباترا": {
    aliases: ["ceramica cleopatra"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/e/e0/Ceramica_Cleopatra_FC.png"
  },
  "زد": {
    aliases: ["zed", "zed fc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/6/67/ZED_FC_logo.png"
  },
  "سموحة": {
    aliases: ["smouha", "smouha sc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/0d/Smouha_SC_logo.png"
  },
  "إنبي": {
    aliases: ["enppi"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/05/Enppi_Logo.png"
  },
  "الجونة": {
    aliases: ["el gouna", "gouna"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/30/El_Gouna_FC_Logo.png"
  },
  "الترجي": {
    aliases: ["esperance", "es tunis", "esperance tunis"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/7/7b/Esperance_Sportive_de_Tunis.png"
  },
  "الإفريقي التونسي": {
    aliases: ["club africain"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/b/ba/Club_Africain.png"
  },
  "النجم الساحلي": {
    aliases: ["etoile du sahel"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/c/c5/Etoile_Sportive_du_Sahel.png"
  },
  "الصفاقسي": {
    aliases: ["cs sfaxien"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/2/29/CS_Sfaxien.png"
  },
  "الوداد": {
    aliases: ["wydad", "wydad casablanca", "wac"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/7/7f/Wydad_Athletic_Club_logo.png"
  },
  "الرجاء": {
    aliases: ["raja", "raja casablanca"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/87/Raja_Club_Athletic_logo.png"
  },
  "الجيش الملكي": {
    aliases: ["as far", "far rabat"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/1/1a/ASFAR_logo.png"
  },
  "نهضة بركان": {
    aliases: ["rs berkane"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/4/4b/RS_Berkane_logo.png"
  },
  "مولودية الجزائر": {
    aliases: ["mc alger"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/0e/MC_Alger_logo.png"
  },
  "شباب بلوزداد": {
    aliases: ["cr belouizdad"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/f/f6/CR_Belouizdad_logo.png"
  },
  "وفاق سطيف": {
    aliases: ["es setif"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/1/1e/ES_Setif_logo.png"
  },
  "شبيبة القبائل": {
    aliases: ["js kabylie"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/5/52/JS_Kabylie_logo.png"
  },
  "الهلال السوداني": {
    aliases: ["al hilal omdurman", "al hilal sdn"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/2/22/Al-Hilal_Club_Omdurman.png"
  },
  "المريخ السوداني": {
    aliases: ["al merreikh"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/2/2b/Al_Merreikh_SC_logo.png"
  },
  "ماميلودي صن داونز": {
    aliases: ["mamelodi sundowns", "sundowns"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6908.png"
  },
  "تي بي مازيمبي": {
    aliases: ["tp mazembe", "mazembe"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/86/TP_Mazembe.png"
  },
  "سيمبا": {
    aliases: ["simba sc", "simba"],
    logo: "https://upload.wikimedia.org/wikipedia/en/9/91/Simba_Sports_Club_logo.png"
  },
  "يانغ أفريكانز": {
    aliases: ["young africans"],
    logo: "https://upload.wikimedia.org/wikipedia/en/9/98/Young_Africans_SC_logo.png"
  },
  "كيتارا الأوغندي": {
    aliases: ["kitara", "kitara fc"],
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kitara_FC_logo.png/220px-Kitara_FC_logo.png"
  },

  // English Premier League
  "ليفربول": {
    aliases: ["liverpool"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/364.png"
  },
  "مانشستر سيتي": {
    aliases: ["manchester city", "man city"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/382.png"
  },
  "مانشستر يونايتد": {
    aliases: ["manchester united", "man utd", "manchester utd"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/360.png"
  },
  "أرسنال": {
    aliases: ["arsenal"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/359.png"
  },
  "تشيلسي": {
    aliases: ["chelsea"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/363.png"
  },
  "توتنهام": {
    aliases: ["tottenham", "tottenham hotspur"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/367.png"
  },
  "نيوكاسل": {
    aliases: ["newcastle", "newcastle united"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/361.png"
  },
  "أستون فيلا": {
    aliases: ["aston villa"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/362.png"
  },
  "برايتون": {
    aliases: ["brighton", "brighton & hove albion"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/331.png"
  },
  "بورنموث": {
    aliases: ["bournemouth", "afc bournemouth"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/349.png"
  },
  "وست هام": {
    aliases: ["west ham", "west ham united"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/371.png"
  },
  "فولهام": {
    aliases: ["fulham"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/370.png"
  },
  "كريستال بالاس": {
    aliases: ["crystal palace"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/384.png"
  },
  "إيفرتون": {
    aliases: ["everton"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/368.png"
  },
  "برينتفورد": {
    aliases: ["brentford"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/337.png"
  },
  "وولفرهامبتون": {
    aliases: ["wolverhampton", "wolves"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/380.png"
  },
  "نوتينغهام فورست": {
    aliases: ["nottingham forest"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/393.png"
  },
  "ليستر سيتي": {
    aliases: ["leicester", "leicester city"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/375.png"
  },
  "إيبسويتش تاون": {
    aliases: ["ipswich town", "ipswich"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/373.png"
  },
  "ساوثهامبتون": {
    aliases: ["southampton"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/376.png"
  },

  // Spanish La Liga
  "ريال مدريد": {
    aliases: ["real madrid"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/86.png"
  },
  "برشلونة": {
    aliases: ["barcelona", "fc barcelona"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/83.png"
  },
  "أتلتيكو مدريد": {
    aliases: ["atletico madrid", "atlético madrid"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/1068.png"
  },
  "إشبيلية": {
    aliases: ["sevilla"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/243.png"
  },
  "ريال بيتيس": {
    aliases: ["real betis", "betis"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/244.png"
  },
  "ريال سوسيداد": {
    aliases: ["real sociedad"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/89.png"
  },
  "أتلتيك بلباو": {
    aliases: ["athletic club", "athletic bilbao"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/93.png"
  },
  "فياريال": {
    aliases: ["villarreal"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/102.png"
  },
  "فالنسيا": {
    aliases: ["valencia"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/94.png"
  },
  "جيرونا": {
    aliases: ["girona"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/9812.png"
  },
  "أوساسونا": {
    aliases: ["osasuna"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/97.png"
  },
  "سلتا فيغو": {
    aliases: ["celta vigo", "celta de vigo", "celta"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/85.png"
  },
  "مايوركا": {
    aliases: ["mallorca", "rcd mallorca"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/84.png"
  },
  "خيتافي": {
    aliases: ["getafe"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2922.png"
  },
  "ألافيس": {
    aliases: ["alaves", "deportivo alavés"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/96.png"
  },
  "إسبانيول": {
    aliases: ["espanyol", "rcd espanyol"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/88.png"
  },
  "رايو فاليكانو": {
    aliases: ["rayo vallecano"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/101.png"
  },
  "لاس بالماس": {
    aliases: ["las palmas"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/98.png"
  },
  "ليغانيس": {
    aliases: ["leganes", "leganés"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/9811.png"
  },
  "بلد الوليد": {
    aliases: ["valladolid", "real valladolid"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/95.png"
  },

  // Italian Serie A
  "يوفنتوس": {
    aliases: ["juventus"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/111.png"
  },
  "إنتر ميلان": {
    aliases: ["internazionale", "inter", "inter milan"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/110.png"
  },
  "ميلان": {
    aliases: ["ac milan", "milan"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/103.png"
  },
  "نابولي": {
    aliases: ["napoli"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/114.png"
  },
  "روما": {
    aliases: ["roma", "as roma"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/104.png"
  },
  "لاتسيو": {
    aliases: ["lazio"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/112.png"
  },
  "أتالانتا": {
    aliases: ["atalanta"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/105.png"
  },
  "فيورنتينا": {
    aliases: ["fiorentina"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/109.png"
  },
  "بولونيا": {
    aliases: ["bologna"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/107.png"
  },
  "تورينو": {
    aliases: ["torino"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/239.png"
  },
  "أودينيزي": {
    aliases: ["udinese"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/118.png"
  },
  "جنوى": {
    aliases: ["genoa"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3263.png"
  },
  "كالياري": {
    aliases: ["cagliari"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2925.png"
  },
  "بارما": {
    aliases: ["parma"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/115.png"
  },
  "كومو": {
    aliases: ["como"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2572.png"
  },
  "فيرونا": {
    aliases: ["hellas verona", "verona"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/119.png"
  },
  "إمبولي": {
    aliases: ["empoli"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/108.png"
  },
  "مونزا": {
    aliases: ["monza"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/4007.png"
  },
  "فينيسيا": {
    aliases: ["venezia"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/17530.png"
  },
  "ليتشي": {
    aliases: ["lecce"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/113.png"
  },
  "ساسولو": {
    aliases: ["sassuolo"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3997.png"
  },

  // German Bundesliga
  "بايرن ميونخ": {
    aliases: ["bayern munich", "bayern münchen", "bayern"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/132.png"
  },
  "بوروسيا دورتموند": {
    aliases: ["borussia dortmund", "dortmund"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/124.png"
  },
  "باير ليفركوزن": {
    aliases: ["bayer leverkusen", "leverkusen"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/131.png"
  },
  "لايبزيغ": {
    aliases: ["rb leipzig", "leipzig"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/11420.png"
  },
  "آينتراخت فرانكفورت": {
    aliases: ["eintracht frankfurt", "frankfurt"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/125.png"
  },
  "شتوتغارت": {
    aliases: ["vfb stuttgart", "stuttgart"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/134.png"
  },
  "فرايبورج": {
    aliases: ["sc freiburg", "freiburg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/126.png"
  },
  "فولفسبورغ": {
    aliases: ["vfl wolfsburg", "wolfsburg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/138.png"
  },
  "بوروسيا مونشنغلادباخ": {
    aliases: ["borussia monchengladbach", "mönchengladbach"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/268.png"
  },
  "فيردر بريمن": {
    aliases: ["werder bremen", "bremen"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/137.png"
  },
  "هوفنهايم": {
    aliases: ["tsg hoffenheim", "hoffenheim"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7911.png"
  },
  "ماينز": {
    aliases: ["mainz 05", "mainz"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2950.png"
  },
  "أوغسبورغ": {
    aliases: ["augsburg", "fc augsburg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3841.png"
  },
  "يونيون برلين": {
    aliases: ["union berlin", "1. fc union berlin"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/598.png"
  },
  "سانت باولي": {
    aliases: ["fc st. pauli", "st. pauli"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/136.png"
  },
  "هولشتاين كيل": {
    aliases: ["holstein kiel"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7057.png"
  },
  "بوخوم": {
    aliases: ["vfl bochum", "bochum"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/123.png"
  },
  "هايدنهايم": {
    aliases: ["fc heidenheim", "heidenheim"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/10385.png"
  },

  // French Ligue 1
  "باريس سان جيرمان": {
    aliases: ["paris saint-germain", "psg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/160.png"
  },
  "مارسيليا": {
    aliases: ["olympique de marseille", "marseille"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/176.png"
  },
  "موناكو": {
    aliases: ["as monaco", "monaco"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/174.png"
  },
  "ليل": {
    aliases: ["lille", "lille osc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/166.png"
  },
  "ليون": {
    aliases: ["olympique lyonnais", "lyon"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/167.png"
  },
  "نيس": {
    aliases: ["nice", "ogc nice"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2502.png"
  },
  "لانس": {
    aliases: ["lens", "rc lens"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/175.png"
  },
  "رين": {
    aliases: ["rennes", "stade rennais"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/169.png"
  },
  "ستراسبورغ": {
    aliases: ["strasbourg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/180.png"
  },
  "تولوز": {
    aliases: ["toulouse"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/179.png"
  },
  "بريست": {
    aliases: ["brest"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6997.png"
  }
};

function normalizeText(s) {
  if (!s) return "";
  let t = s.toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove arabic tashkeel
    .replace(/[أإآ]/g, "ا")
    .replace(/[ة]/g, "ه")
    .replace(/[ى]/g, "ي")
    .replace(/[^a-z0-9\u0621-\u064A ]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  
  // Strip common noisy prefixes
  for (const prefix of ["al-", "al ", "fc ", " sc", " fc", "club "]) {
    if (t.startsWith(prefix)) t = t.slice(prefix.length).trim();
    if (t.endsWith(prefix)) t = t.slice(0, -prefix.length).trim();
  }
  return t.trim();
}

/**
 * Standardize team name in Arabic and resolve official high-res badge logo URL
 * @param {string} rawName - Raw team name (Arabic or English)
 * @param {string} rawLogo - Any existing/scraped logo URL or emoji
 * @returns {{ name: string, logo: string }} Standardized Arabic name and logo URL
 */
function resolveTeam(rawName, rawLogo) {
  if (!rawName) {
    return { name: "فريق غير محدد", logo: rawLogo || "" };
  }

  const trimmed = rawName.trim();

  // 1. Exact match with catalog key
  if (CLUBS[trimmed]) {
    return {
      name: trimmed,
      logo: (rawLogo && rawLogo.startsWith("http")) ? rawLogo : (CLUBS[trimmed].logo || rawLogo || "")
    };
  }

  const norm = normalizeText(trimmed);

  // 2. Search aliases and normalized keys
  for (const [arName, meta] of Object.entries(CLUBS)) {
    if (norm === normalizeText(arName)) {
      return {
        name: arName,
        logo: (rawLogo && rawLogo.startsWith("http")) ? rawLogo : (meta.logo || rawLogo || "")
      };
    }
    for (const alias of (meta.aliases || [])) {
      const aliasNorm = normalizeText(alias);
      if (norm === aliasNorm || norm.includes(aliasNorm) || aliasNorm.includes(norm)) {
        return {
          name: arName,
          logo: (rawLogo && rawLogo.startsWith("http")) ? rawLogo : (meta.logo || rawLogo || "")
        };
      }
    }
  }

  // 3. Fallback: If rawName contains Arabic letters, keep it clean
  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);
  if (hasArabic) {
    return {
      name: trimmed,
      logo: rawLogo || ""
    };
  }

  // 4. Fallback for untranslated English: clean up common prefixes
  let fallbackName = trimmed;
  if (fallbackName.toLowerCase().startsWith("al ")) {
    fallbackName = "الـ " + fallbackName.slice(3);
  } else if (fallbackName.toLowerCase().startsWith("al-")) {
    fallbackName = "الـ " + fallbackName.slice(3);
  }

  return {
    name: fallbackName,
    logo: rawLogo || ""
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CLUBS,
    resolveTeam,
    normalizeText
  };
}
