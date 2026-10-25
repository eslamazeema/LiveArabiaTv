import urllib.request
import re

url = 'https://shoof.alkass.net/live/ch1.m3u8'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req).read().decode('utf-8', errors='ignore')

m3u8s = re.findall(r'https?://[^\s\"\'<>]+\.m3u8[^\s\"\'<>]*', html)
print('Found M3U8s in Alkass page:', m3u8s)

# Also check for stream, live, hls, akamai, etc.
keywords = ['stream', 'shoof', 'hls', 'mp4', 'manifest']
for line in html.splitlines():
    if any(k in line.lower() for k in keywords) and ('http' in line or '.js' in line):
        print('  line:', line.strip()[:160])
