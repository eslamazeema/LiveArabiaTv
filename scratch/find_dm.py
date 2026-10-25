import re

with open('scratch/maspero_page.html', 'r', encoding='utf-8') as f:
    html = f.read()

dm_matches = re.findall(r'(?:dailymotion|video|xi5eg)[^"\']*', html, re.IGNORECASE)
for m in dm_matches:
    print("DM match:", m[:100])

scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
for s in scripts:
    if 'dailymotion' in s.lower() or 'xi5eg' in s:
        print("Inline script:", s)
