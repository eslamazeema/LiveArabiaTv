import urllib.request
import re

url = 'http://www.niletc.tv/Page/1/Drama'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
html = urllib.request.urlopen(req, timeout=8).read().decode('utf-8', errors='ignore')

print("Page length:", len(html))
iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\']', html)
print("IFRAMES:", iframes)
m3u8 = re.findall(r'https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*', html)
print("M3U8:", m3u8)
videos = re.findall(r'<video[^>]+src=["\']([^"\']+)["\']', html)
print("VIDEOS:", videos)
youtube = re.findall(r'youtube\.com[^"\'\s<>]+', html)
print("YOUTUBE:", youtube)
dm = re.findall(r'dailymotion\.com[^"\'\s<>]+', html)
print("DAILYMOTION:", dm)
embeds = re.findall(r'<embed[^>]+src=["\']([^"\']+)["\']', html)
print("EMBEDS:", embeds)
