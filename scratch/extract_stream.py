import urllib.request
import re

url = 'https://www.elahmad.ru/tv/radiant.php?id=natgeo_1'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.elahmad.ru/'
})

try:
    with urllib.request.urlopen(req, timeout=15) as res:
        html = res.read().decode('utf-8', errors='ignore')
        with open('scratch/elahmad_page.html', 'w', encoding='utf-8') as f:
            f.write(html)
        print('Saved HTML length:', len(html))
        
        m3u8_matches = re.findall(r'https?://[^\s"\'<>]+\.m3u8[^\s"\'<>]*', html)
        print('Direct m3u8 matches:', m3u8_matches)
        
        for line in html.split('\n'):
            if any(k in line.lower() for k in ['src', 'file', 'hls', 'm3u8', 'radiant', 'rmp', 'source', 'player']):
                print(line.strip()[:150])
except Exception as e:
    print('Error:', e)
