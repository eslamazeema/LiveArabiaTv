/**
 * Arabia Live TV (arabialivetv.com) - Official Clubs & Badges Catalog
 * 
 * Standardizes Arabic club names and provides high-resolution official team badges.
 */

const CLUBS = {
  "سندرلاند": {
    aliases: ["sunderland", "sunderland afc", "afc sunderland"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/366.png"
  },
  "ليفانتي": {
    aliases: ["levante", "levante ud", "ud levante"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/98.png"
  },
  "تشوروم": {
    aliases: ["çorum fk", "corum fk", "çorum", "corum", "تشوروم إف كيه"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/19085.png"
  },
  "جينتشلاربيرليجي": {
    aliases: ["genclerbirligi", "gençlerbirliği", "genclerbirligi sk"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/448.png"
  },
  "إيرزوروم سبور": {
    aliases: ["erzurum bb", "erzurumspor", "erzurum bb fk", "bb erzurumspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18856.png"
  },
  "تشايكور ريزه سبور": {
    aliases: ["ريزه سبور", "riizespor", "caykur rizespor", "rizespor", "çaiykur rizespor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2202.png"
  },
  "نادي رع": {
    aliases: ["رع", "نادي رع", "ra fc"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soccerball.svg/500px-Soccerball.svg.png"
  },
  "القناة": {
    aliases: ["نادي القناة", "el qanah", "al qanah"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/b/b8/El_Qanah_FC_logo.png"
  },
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
  "المقاولون العرب": {
    aliases: ["al mokawloon", "mokawloon", "arab contractors", "al-mokawloon al-arab", "المقاولون"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/36/Al_Mokawloon_Al_Arab_SC_logo.png"
  },
  "البنك الأهلي": {
    aliases: ["national bank of egypt", "bank al ahly", "al bank al ahly", "national bank", "البنك الاهلي"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/b/b3/National_Bank_of_Egypt_SC_logo.png"
  },
  "طلائع الجيش": {
    aliases: ["tala'ea el gaish", "talaea el gaish", "el gaish", "talaee al jaish", "طلائع الجيش"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/5/5f/Tala%27ea_El-Gaish_SC_logo.png"
  },
  "فاركو": {
    aliases: ["pharco", "pharco fc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/d/d7/Pharco_FC_logo.png"
  },
  "غزل المحلة": {
    aliases: ["ghazl el mahalla", "el mahalla"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/3f/Ghazl_El_Mahalla_SC_logo.png"
  },
  "حرس الحدود": {
    aliases: ["haras el hodood", "haras el hodoud"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/f/f6/Haras_El_Hodood_SC_logo.png"
  },
  "بتروجيت": {
    aliases: ["petrojet", "petrojet fc", "بتروجت", "م.السـويس بتروجت", "م.السويس بتروجت"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/4/4c/Petrojet_SC_logo.png"
  },
  "منتخب السويس": {
    aliases: ["montakhab el suez", "suez sc", "el suez", "م.السويس", "م.السـويس"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/2/25/Suez_SC_logo.png"
  },
  "دلفي": {
    aliases: ["delphi", "delphi sc", "نادي دلفي"],
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Soccerball.svg/500px-Soccerball.svg.png"
  },
  "بترول أسيوط": {
    aliases: ["aspyout petroleum", "petrol asyut", "petrol assiut"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/87/Asyut_Petroleum_SC_logo.png"
  },
  "النجوم": {
    aliases: ["nogoom", "nogoom fc", "el nogoom", "نادي النجوم"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/9/90/Nogoom_FC_Logo.png"
  },
  "مودرن سبورت": {
    aliases: ["modern sport", "modern future", "future fc", "مودرن فيوتشر", "فيوتشر"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/a/a2/Modern_Sport_FC_logo.png"
  },
  "بلدية المحلة": {
    aliases: ["baladiyat el mahalla"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/87/Baladiyat_El_Mahalla_SC_logo.png"
  },
  "الداخلية": {
    aliases: ["el dakhleya", "el dakhliya", "dakhleya"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/e/e0/El_Dakhleya_SC_logo.png"
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
  "الفتح الرباطي": {
    aliases: ["fus rabat", "fus"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/07/FUS_Rabat_logo.png"
  },
  "المغرب الفاسي": {
    aliases: ["mas fes", "mas fez", "maghreb fes"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/9/91/Maghreb_Association_Sportive_de_F%C3%A8s_logo.png"
  },
  "اتحاد طنجة": {
    aliases: ["ittihad tanger", "ir tanger", "irt"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/36/Ittihad_Tanger_logo.png"
  },
  "حسنية أكادير": {
    aliases: ["hassania agadir", "husa"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/3d/Hassania_Union_Sport_d%27Agadir.png"
  },
  "أولمبيك آسفي": {
    aliases: ["olympic safi", "ocs"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/a/a2/Olympic_Club_de_Safi_logo.png"
  },
  "المغرب التطواني": {
    aliases: ["moghreb tetouan", "mat tetouan"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/7/75/Moghreb_T%C3%A9touan_logo.png"
  },
  "نهضة الزمامرة": {
    aliases: ["renaissance zemamra", "rcaz"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/87/RCAZ_logo.png"
  },
  "اتحاد تواركة": {
    aliases: ["union touarga", "uts"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/f/fe/Union_Touarga_Sport_logo.png"
  },
  "شباب السوالم": {
    aliases: ["js soualem", "jeunesse soualem"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/c/cb/JS_Soualem_logo.png"
  },
  "النادي المكناسي": {
    aliases: ["codm meknes", "codm"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/9/9d/CODM_Meknes_logo.png"
  },
  "الدفاع الحسني الجديدي": {
    aliases: ["dhj el jadida", "dhj"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/3d/Difaa_Hassani_El_Jadidi_logo.png"
  },
  "وادي دجلة": {
    aliases: ["wadi degla", "degla"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/5/52/Wadi_Degla_FC_Logo.png"
  },
  "أميد سبور": {
    aliases: ["amed sfk", "amedspor", "amed"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/19084.png"
  },
  "فروسينوني": {
    aliases: ["frosinone", "frosinone calcio"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6938.png"
  },
  "أوكسير": {
    aliases: ["aj auxerre", "auxerre"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/162.png"
  },
  "راسينغ سانتاندير": {
    aliases: ["racing santander", "racing de santander"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/94.png"
  },
  "أنجيه": {
    aliases: ["angers", "angers sco"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3243.png"
  },
  "إلتشي": {
    aliases: ["elche", "elche cf"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3751.png"
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
    aliases: ["ipswich town", "ipswich", "إبسويتش تاون", "ابسويتش تاون"],
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
    aliases: ["celta vigo", "celta de vigo", "celta", "سيلتا فيجو", "سيلتا فيغو", "سلتا فيجو"],
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
    aliases: ["rayo vallecano", "رايو فايكانو", "فايكانو"],
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
  },

  // Turkish Süper Lig
  "غلطة سراي": {
    aliases: ["galatasaray", "galatasaray sk"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/432.png"
  },
  "فنربخشة": {
    aliases: ["fenerbahce", "fenerbahçe", "fenerbahce sk"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/431.png"
  },
  "بشكتاش": {
    aliases: ["besiktas", "beşiktaş", "besiktas jk"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/430.png"
  },
  "طرابزون سبور": {
    aliases: ["trabzonspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/434.png"
  },
  "إسطنبول باشاك شهير": {
    aliases: ["istanbul basaksehir", "basaksehir", "istanbul başakşehir", "باشاك شهير"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/10398.png"
  },
  "قاسم باشا": {
    aliases: ["kasimpasa", "kasımpaşa"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8157.png"
  },
  "سيفاس سبور": {
    aliases: ["sivasspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6979.png"
  },
  "أنطاليا سبور": {
    aliases: ["antalyaspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2253.png"
  },
  "قونية سبور": {
    aliases: ["konyaspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2257.png"
  },
  "قيصري سبور": {
    aliases: ["kayserispor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6980.png"
  },
  "غازي عنتاب": {
    aliases: ["gaziantep", "gaziantep fk"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8158.png"
  },
  "سامسون سبور": {
    aliases: ["samsunspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2260.png"
  },
  "ريزه سبور": {
    aliases: ["caykur rizespor", "rizespor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2261.png"
  },
  "ألانيا سبور": {
    aliases: ["alanyaspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18182.png"
  },
  "أيوب سبور": {
    aliases: ["eyupspor", "eyüpspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/21568.png"
  },
  "جوزتيبي": {
    aliases: ["goztepe", "göztepe"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2255.png"
  },
  "بودروم": {
    aliases: ["bodrum", "bodrum fk"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/22421.png"
  },
  "أضنة ديميرسبور": {
    aliases: ["adana demirspor", "adana demir"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8161.png"
  },
  "هاتاي سبور": {
    aliases: ["hatayspor"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/18991.png"
  },

  // Brazilian Serie A
  "فلامينغو": {
    aliases: ["flamengo", "cr flamengo"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/819.png"
  },
  "بالميراس": {
    aliases: ["palmeiras", "se palmeiras"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2029.png"
  },
  "ساو باولو": {
    aliases: ["sao paulo", "são paulo", "sao paulo fc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2026.png"
  },
  "كورينثيانز": {
    aliases: ["corinthians", "sc corinthians"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/874.png"
  },
  "فلومينينسي": {
    aliases: ["fluminense", "fluminense fc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3445.png"
  },
  "بوتافوغو": {
    aliases: ["botafogo", "botafogo fr"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6075.png"
  },
  "غريميو": {
    aliases: ["gremio", "grêmio"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6273.png"
  },
  "إنترناسيونال": {
    aliases: ["internacional", "sc internacional"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/1936.png"
  },
  "أتلتيكو مينيرو": {
    aliases: ["atletico mineiro", "atlético mineiro", "atletico-mg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/870.png"
  },
  "كروزيرو": {
    aliases: ["cruzeiro", "cruzeiro ec"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/879.png"
  },
  "فاسكو دا غاما": {
    aliases: ["vasco da gama", "vasco"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3454.png"
  },
  "سانتوس": {
    aliases: ["santos", "santos fc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/2674.png"
  },
  "باهيا": {
    aliases: ["bahia", "ec bahia"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3429.png"
  },
  "فورتاليزا": {
    aliases: ["fortaleza", "fortaleza ec"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3434.png"
  },
  "أتلتيكو باراناينسي": {
    aliases: ["athletico paranaense", "atletico paranaense", "athletico-pr"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3426.png"
  },
  "ريد بول براغانتينو": {
    aliases: ["red bull bragantino", "bragantino"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6076.png"
  },
  "كويابا": {
    aliases: ["cuiaba", "cuiabá"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/17798.png"
  },
  "فيتوريا": {
    aliases: ["vitoria", "vitória", "ec vitoria"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3455.png"
  },
  "يوفنتود": {
    aliases: ["juventude", "ec juventude"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3448.png"
  },
  "كريسيوما": {
    aliases: ["criciuma", "criciúma"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3432.png"
  },
  "أتلتيكو غويانينسي": {
    aliases: ["atletico goianiense", "atlético goianiense", "atletico-go"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/8155.png"
  },

  // German Cup (DFB-Pokal) & 2. Bundesliga Clubs
  "شالكه": {
    aliases: ["schalke 04", "schalke", "fc schalke 04"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/133.png"
  },
  "هيرتا برلين": {
    aliases: ["hertha bsc", "hertha berlin", "hertha"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/129.png"
  },
  "هامبورغ": {
    aliases: ["hamburger sv", "hamburg", "hsv"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/127.png"
  },
  "هانوفر": {
    aliases: ["hannover 96", "hannover"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/128.png"
  },
  "كولن": {
    aliases: ["1. fc koln", "fc koln", "cologne", "koln"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/122.png"
  },
  "كايزرسلاوترن": {
    aliases: ["1. fc kaiserslautern", "kaiserslautern"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/130.png"
  },
  "فورتونا دوسلدورف": {
    aliases: ["fortuna dusseldorf", "dusseldorf", "düsseldorf"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/266.png"
  },
  "نورنبرغ": {
    aliases: ["1. fc nurnberg", "nurnberg", "nürnberg", "نورنبرج"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/135.png"
  },
  "بادربورن": {
    aliases: ["sc paderborn 07", "paderborn", "sc paderborn"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/6986.png"
  },
  "ماغديبورغ": {
    aliases: ["1. fc magdeburg", "magdeburg", "ماجديبورج"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7058.png"
  },
  "دينامو دريسدن": {
    aliases: ["sg dynamo dresden", "dynamo dresden", "دريسدين"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7059.png"
  },
  "كارلسروه": {
    aliases: ["karlsruher sc", "karlsruhe"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/267.png"
  },
  "أرمينيا بيليفيلد": {
    aliases: ["arminia bielefeld", "bielefeld"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/123.png"
  },
  "غرويتر فورت": {
    aliases: ["spvgg greuther furth", "greuther furth", "fürth"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/270.png"
  },
  "دارمشتات": {
    aliases: ["sv darmstadt 98", "darmstadt"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/3565.png"
  },
  "آينتراخت براونشفايغ": {
    aliases: ["eintracht braunschweig", "braunschweig"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/265.png"
  },
  "إلفرسبيرغ": {
    aliases: ["sv 07 elversberg", "elversberg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7063.png"
  },
  "برويسن مونستر": {
    aliases: ["sc preussen munster", "preussen munster"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7064.png"
  },
  "أولم": {
    aliases: ["ssv ulm 1846", "ssv ulm", "ulm"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/273.png"
  },
  "يان ريغنسبورغ": {
    aliases: ["ssv jahn regensburg", "jahn regensburg", "regensburg"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7062.png"
  },

  // Gulf Club Champions League Clubs
  "القادسية الكويتي": {
    aliases: ["al qadsia kuwait", "qadsia sc", "al qadsia sc", "القادسية"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/a/a2/Qadsia_SC_Logo.png"
  },
  "العربي الكويتي": {
    aliases: ["al arabi kuwait", "al arabi sc kuwait", "العربي"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/d/d4/Al-Arabi_SC_logo.png"
  },
  "الكويت الكويتي": {
    aliases: ["kuwait sc", "al kuwait sc", "al kuwait", "نادي الكويت"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/f/fe/Kuwait_SC_Logo.png"
  },
  "كاظمة الكويتي": {
    aliases: ["kazma", "kazma sc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/8/87/KazmaSC.png"
  },
  "السالمية الكويتي": {
    aliases: ["al salmiya", "al salmiya sc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/d/dd/Al-Salmiya_SC_logo.png"
  },
  "الرفاع البحريني": {
    aliases: ["al riffa", "riffa sc", "al-riffa", "الرفاع"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/30/Al-Riffa_SC_logo.png"
  },
  "المحرق البحريني": {
    aliases: ["al muharraq", "muharraq sc", "al-muharraq", "المحرق"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/33/Muharraq_Club_logo.png"
  },
  "الخالدية البحريني": {
    aliases: ["al khaldiya", "khaldiya sc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/6/6f/Al-Khaldiya_SC_logo.png"
  },
  "النصر الإماراتي": {
    aliases: ["al nasr uae", "al nasr dubai", "al-nasr sc"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7130.png"
  },
  "بني ياس": {
    aliases: ["baniyas", "baniyas club"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/7131.png"
  },
  "خورفكان": {
    aliases: ["khorfakkan", "khor fakkan"],
    logo: "https://a.espncdn.com/i/teamlogos/soccer/500/21831.png"
  },
  "دهوك العراقي": {
    aliases: ["duhok", "duhok sc", "دهوك"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/3/37/Duhok_SC_logo.png"
  },
  "زاخو العراقي": {
    aliases: ["zakho", "zakho sc", "زاخو"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/6/69/Zakho_SC_logo.png"
  },
  "الزوراء": {
    aliases: ["al zawraa", "al zawra'a"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/5/52/Al-Zawraa_SC_logo.png"
  },
  "أربيل": {
    aliases: ["erbil", "erbil sc"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/c/c8/Erbil_SC_logo.png"
  },
  "ظفار العماني": {
    aliases: ["dhofar", "dhofar club", "ظفار"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/c/c2/Dhofar_Club_logo.png"
  },
  "النصر العماني": {
    aliases: ["al nasr oman", "al-nasr salalah"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/7/7b/Al-Nasr_S.C._%28Salalah%29_logo.png"
  },
  "السيب العماني": {
    aliases: ["al seeb", "seeb club", "السيب"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/4/4c/Al-Seeb_Club_logo.png"
  },
  "النهضة العماني": {
    aliases: ["al nahda oman", "al nahda"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/0/05/Al-Nahda_Club_logo.png"
  },
  "أهلي صنعاء": {
    aliases: ["ahli sanaa", "al ahly sanaa"],
    logo: "https://upload.wikimedia.org/wikipedia/ar/4/4b/Ahli_Sana%27a_logo.png"
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

  // 4. Fallback for untranslated English: translate words and clean up prefixes
  const WORD_MAP = {
    'fc': 'إف سي', 'sc': 'سبورتينغ', 'united': 'يونايتد', 'city': 'سيتي',
    'real': 'ريال', 'atletico': 'أتلتيكو', 'athletic': 'أتلتيك', 'sporting': 'سبورتينغ',
    'inter': 'إنتر', 'dynamo': 'دينامو', 'borussia': 'بوروسيا', 'bayer': 'باير',
    'bayern': 'بايرن', 'red bull': 'ريد بول', 'rb': 'آر بي', 'union': 'يونيون',
    'olympic': 'أولمبيك', 'olympique': 'أولمبيك', 'racing': 'راسينغ', 'saint': 'سانت',
    'deportivo': 'ديبورتيفو', 'lokomotiv': 'لوكوموتيف', 'sparta': 'سبارتا', 'slavia': 'سلافيا'
  };

  let fallbackName = trimmed;
  let lower = fallbackName.toLowerCase();

  // Strip prefixes
  if (lower.startsWith("al-") || lower.startsWith("al ")) {
    fallbackName = "الـ " + fallbackName.slice(3).trim();
  }

  // Check if we can translate English words
  let words = fallbackName.split(/\s+/);
  let translatedWords = words.map(w => {
    const lw = w.toLowerCase().replace(/[^a-z]/g, '');
    return WORD_MAP[lw] || w;
  });
  fallbackName = translatedWords.join(' ');

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
