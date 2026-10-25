import urllib.request

test_stations = [
    ("إذاعة القرآن الكريم من القاهرة", "http://n12.radiojar.com/8s5u5tpdtwzuv"),
    ("إذاعة القرآن الكريم (السعودية - MBC)", "https://quraanfm-radio.mbc.net/quraanfm-radio.m3u8"),
    ("راديو 9090 مصر", "http://9090streaming.mobtada.com/9090FMEGYPT"),
    ("أون سبورت إف إم (On Sport FM)", "https://carina.streamerr.co:2020/stream/OnSportFM"),
    ("مونت كارلو الدولية (Monte Carlo Doualiya)", "http://montecarlodoualiya128k.ice.infomaniak.ch/mc-doualiya.mp3"),
    ("العربية إف إم (Al Arabiya FM)", "https://fm.alarabiya.net/fm/myStream/playlist.m3u8"),
    ("إم بي سي إف إم (MBC FM)", "https://mbcfm-radio.mbc.net/mbcfm-radio.m3u8"),
    ("روتانا إف إم (Rotana FM)", "http://stream.radiojar.com/rotanafm"),
    ("راديو مارس الرياضي المغربي (Radio Mars)", "https://radiomars.ice.infomaniak.ch/radiomars-128.mp3"),
    ("إذاعة مشاري العفاسي", "https://qurango.net/radio/mishary_alafasi"),
    ("إذاعة محمود خليل الحصري", "https://qurango.net/radio/mahmoud_khalil_alhussary_warsh"),
    ("شام إف إم (Sham FM سوريا)", "https://radioshamfm.grtvstream.com:8400/stream"),
    ("ميدي 1 طرب (Medi 1 Tarab)", "http://live.medi1.com/Tarab"),
    ("راديو أصوات (Radio Aswat المغرب)", "http://broadcast.ice.infomaniak.ch/aswat-high.mp3?.mp3"),
    ("تسعينات إف إم (Tes3enat FM)", "http://178.33.135.244:20095/;"),
    ("هيت راديو (Hit Radio Maroc)", "https://stream.zeno.fm/une3a02mb"),
    ("فيروزيات (Fayroz Radio)", "https://stream.zeno.fm/zv3e5wykprhvv.mp3"),
    ("عمرو دياب إف إم (Amr Diab Radio)", "https://stream-40.zeno.fm/xa4yhh4k838uv")
]

results = []
for name, url in test_stations:
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as resp:
            code = resp.getcode()
            results.append((name, url, "ONLINE" if code in [200, 206] else f"HTTP {code}"))
    except Exception as e:
        results.append((name, url, f"OFFLINE: {e}"))

with open("scratch/verified_radios.txt", "w", encoding="utf-8") as f:
    for name, url, status in results:
        f.write(f"[{status}] {name}\nURL: {url}\n\n")

print("Verification complete.")
