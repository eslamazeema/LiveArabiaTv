import urllib.request
import re

players = [
    'https://www.elahmad.ru/tv/jw8.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/bitmovin.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/clappr.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/cloudflare.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/embed_tv.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/embed.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/plyr.php?id=natgeo_1',
    'https://www.elahmad.ru/tv/shaka-player.php?id=natgeo_1'
]

for p in players:
    try:
        req = urllib.request.Request(p, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://www.elahmad.ru/'
        })
        html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')
        m3u8s = re.findall(r'https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*', html)
        if m3u8s:
            print(f'{p} -> m3u8 found: {m3u8s}')
        else:
            scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
            found_str = []
            for s in scripts:
                if 'http' in s:
                    found_str.extend(re.findall(r'https?://[^\s"\'<>]+', s))
            print(f'{p} -> scripts URLs: {found_str[:4]}')
    except Exception as e:
        print(f'{p} -> {e}')
