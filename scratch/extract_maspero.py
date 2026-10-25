import urllib.request
import re
import ssl
import json

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request('https://www.maspero.eg/stream/19', headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
})

try:
    with urllib.request.urlopen(req, context=ctx, timeout=15) as resp:
        html = resp.read().decode('utf-8', errors='ignore')
    
    print("Page length:", len(html))
    
    # Check iframes
    iframes = re.findall(r'<iframe[^>]+src=["\']([^"\']+)["\'][^>]*>', html, re.I)
    print("\nIFRAME SRCs:")
    for ifr in iframes:
        print(" -", ifr)
        
    # Check dailymotion
    dm = re.findall(r'(https?://[^"\'\s<>]+dailymotion[^"\'\s<>]*)', html, re.I)
    print("\nDAILYMOTION URLs:")
    for d in set(dm):
        print(" -", d)

    # Check video ids (x8..., etc)
    vids = re.findall(r'video[:=]\s*["\']([a-zA-Z0-9]+)["\']', html)
    print("\nVideo IDs:", set(vids))
    
    # Check m3u8
    m3u8s = re.findall(r'(https?://[^"\'\s<>]+\.m3u8[^"\'\s<>]*)', html)
    print("\nM3U8s:")
    for m in set(m3u8s):
        print(" -", m)

    # Look for stream container or player section
    player_section = re.findall(r'(<div[^>]*class=["\'][^"\']*(?:player|stream|video)[^"\']*["\'][^>]*>[\s\S]*?</div>)', html, re.I)
    print(f"\nPlayer divs found: {len(player_section)}")
    for p in player_section[:3]:
        print("DIV:", p[:400])

except Exception as e:
    print("Error:", e)
