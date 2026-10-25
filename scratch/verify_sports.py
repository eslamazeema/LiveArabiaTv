import urllib.request
import sys
sys.stdout.reconfigure(encoding='utf-8')

urls = [
    ('الكأس 1 الرياضية HD', 'https://shoof.alkass.net/live/ch1.m3u8'),
    ('الكأس 2 الرياضية HD', 'https://shoof.alkass.net/live/ch2.m3u8'),
    ('الكأس 4 الرياضية HD', 'https://shoof.alkass.net/live/ch4.m3u8'),
    ('الشارقة الرياضية HD', 'https://live.kwikmotion.com/smc4live/smc4tv.smil/playlist.m3u8'),
    ('الكويت الرياضية HD', 'https://kwtspta.cdn.mangomolo.com/sp/smil:sp.stream.smil/chunklist.m3u8'),
    ('الكويت سبورت بلس HD', 'https://kwtsplta.cdn.mangomolo.com/spl/smil:spl.stream.smil/chunklist.m3u8'),
    ('عُمان الرياضية HD', 'https://partneta.cdn.mgmlcdn.com/omsport/smil:omsport.stream.smil/chunklist.m3u8'),
    ('الأردن الرياضية HD', 'https://jrtv-live.ercdn.net/jordansporthd/jordansporthd.m3u8'),
    ('العراقية الرياضية HD', 'https://imn-live.esite-lab.com/hls/iraqia-sports-1.m3u8'),
    ('البحرين الرياضية 1 HD', 'https://5c7b683162943.streamlock.net/live/ngrp:sportsone_all/playlist.m3u8'),
    ('البحرين الرياضية 2 HD', 'https://5c7b683162943.streamlock.net/live/ngrp:bahrainsportstwo_all/playlist.m3u8'),
    ('beIN SPORTS XTRA HD', 'https://bein-xtra-bein.amagi.tv/playlist.m3u8'),
    ('الهداف الرياضية HD', 'https://live.elheddaftv.com:8081/elheddaftv/index.m3u8')
]

working = []
for name, u in urls:
    try:
        req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as r:
            first = r.read(150).decode('utf-8', errors='ignore')
            if "#EXTM3U" in first:
                print(f"✅ {name}: 200 OK (EXTM3U Verified)")
                working.append((name, u))
            else:
                print(f"⚠️ {name}: 200 OK but missing EXTM3U")
    except Exception as e:
        print(f"❌ {name}: {e}")

print(f"\nTotal verified working Arabic sports streams: {len(working)} / {len(urls)}")
