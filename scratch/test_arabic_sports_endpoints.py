import urllib.request
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

test_channels = [
    # Alkass
    {"name": "الكأس 1 الرياضية HD", "country": "قطر", "url": "https://shoof.alkass.net/live/ch1.m3u8"},
    {"name": "الكأس 2 الرياضية HD", "country": "قطر", "url": "https://shoof.alkass.net/live/ch2.m3u8"},
    {"name": "الكأس 4 الرياضية HD", "country": "قطر", "url": "https://shoof.alkass.net/live/ch4.m3u8"},

    # Dubai Sports
    {"name": "دبي الرياضية 1 HD", "country": "الإمارات", "url": "https://dmitvdai.cdn.mangomolo.com/dubaisports/smil:dubaisports.stream.smil/chunklist.m3u8"},
    {"name": "دبي الرياضية 2 HD", "country": "الإمارات", "url": "https://dmitvdai.cdn.mangomolo.com/dubaisportstwo/smil:dubaisportstwo.stream.smil/chunklist.m3u8"},
    {"name": "دبي الرياضية 3 HD", "country": "الإمارات", "url": "https://dmitvdai.cdn.mangomolo.com/dubaisportshd3/smil:dubaisportshd3.stream.smil/chunklist.m3u8"},
    {"name": "دبي ريسنج 1 (Racing 1)", "country": "الإمارات", "url": "https://dmitvdai.cdn.mangomolo.com/dubairacing/smil:dubairacing.stream.smil/chunklist.m3u8"},
    {"name": "دبي ريسنج 2 (Racing 2)", "country": "الإمارات", "url": "https://dmitvdai.cdn.mangomolo.com/dubairacingtwo/smil:dubairacingtwo.stream.smil/chunklist.m3u8"},
    {"name": "دبي ريسنج 3 (Racing 3)", "country": "الإمارات", "url": "https://dmitvdai.cdn.mangomolo.com/dubairacinghd3/smil:dubairacinghd3.stream.smil/chunklist.m3u8"},

    # Sharjah Sports
    {"name": "الشارقة الرياضية HD", "country": "الإمارات", "url": "https://live.kwikmotion.com/smc4live/smc4tv.smil/playlist.m3u8"},

    # Abu Dhabi Sports / Yass
    {"name": "أبوظبي الرياضية 1 HD", "country": "الإمارات", "url": "https://admdai1.cdn.mangomolo.com/adsports1/smil:adsports1.stream.smil/chunklist.m3u8"},
    {"name": "أبوظبي الرياضية 2 HD", "country": "الإمارات", "url": "https://admdai1.cdn.mangomolo.com/adsports2/smil:adsports2.stream.smil/chunklist.m3u8"},
    {"name": "قناة ياس الرياضية HD", "country": "الإمارات", "url": "https://admdai1.cdn.mangomolo.com/yass/smil:yass.stream.smil/chunklist.m3u8"},

    # Kuwait Sports
    {"name": "الكويت الرياضية HD", "country": "الكويت", "url": "https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8"},
    {"name": "الكويت سبورت بلس HD", "country": "الكويت", "url": "https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8"},

    # Oman Sports
    {"name": "عُمان الرياضية HD", "country": "عُمان", "url": "https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8"},

    # Jordan Sport
    {"name": "الأردن الرياضية HD", "country": "الأردن", "url": "https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8"},

    # Bahrain Sports
    {"name": "البحرين الرياضية 1 HD", "country": "البحرين", "url": "https://bhrlive.ercdn.net/bahrainsports1/bahrainsports1.m3u8"},
    {"name": "البحرين الرياضية 2 HD", "country": "البحرين", "url": "https://bhrlive.ercdn.net/bahrainsports2/bahrainsports2.m3u8"},

    # Arryadia Morocco
    {"name": "الرياضية المغربية (Arryadia TNT)", "country": "المغرب", "url": "https://snrtlive1.b-cdn.net/live/arryadia/index.m3u8"},
    {"name": "الرياضية المغربية 2 HD", "country": "المغرب", "url": "https://snrtlive1.b-cdn.net/live/arryadia-direct/index.m3u8"},

    # Iraq Sports
    {"name": "العراقية الرياضية HD", "country": "العراق", "url": "https://imn.ercdn.net/iraqiasports/iraqiasports.m3u8"},

    # KSA Sports
    {"name": "السعودية الرياضية 1 HD", "country": "السعودية", "url": "https://cdn-globecast.akamaized.net/live/eds/ksa_sports_1/hls_roku/index.m3u8"},
    {"name": "السعودية الرياضية 2 HD", "country": "السعودية", "url": "https://cdn-globecast.akamaized.net/live/eds/ksa_sports_2/hls_roku/index.m3u8"},

    # beIN Sports News
    {"name": "بي إن سبورتس الإخبارية (beIN News)", "country": "قطر", "url": "https://live-hls-web-aja-fa.thehlive.com/AJA/index.m3u8"}
]

tested = []
print(f"Testing {len(test_channels)} major Arabic sports channels...")

for ch in test_channels:
    u = ch["url"]
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=4) as r:
            if r.status == 200:
                print(f"✅ {ch['name']} ({ch['country']}) -> 200 OK")
                ch["quality"] = "Full HD"
                ch["type"] = "hls"
                tested.append(ch)
            else:
                print(f"❌ {ch['name']} -> {r.status}")
    except Exception as e:
        print(f"❌ {ch['name']} -> {e}")

print(f"\nTotal Confirmed Working Sports Channels: {len(tested)}")
with open("scratch/confirmed_arabic_sports.json", "w", encoding="utf-8") as f:
    json.dump(tested, f, ensure_ascii=False, indent=2)
