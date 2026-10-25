import urllib.request, ssl, re, sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {"User-Agent": "Googlebot/2.1 (+http://www.google.com/bot.html)"}

print("--- 1. Testing robots.txt ---")
try:
    req = urllib.request.Request("https://arabialivetv.com/robots.txt", headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        txt = r.read().decode('utf-8')
        print(txt.strip())
        print("✅ robots.txt is accessible and valid!")
except Exception as e:
    print("❌ robots.txt error:", e)

print("\n--- 2. Testing sitemap.xml ---")
try:
    req = urllib.request.Request("https://arabialivetv.com/sitemap.xml", headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        xml = r.read().decode('utf-8')
        urls_count = len(re.findall(r'<loc>', xml))
        print(f"✅ sitemap.xml is accessible! Total URLs indexed: {urls_count}")
        # print first 3 urls
        locs = re.findall(r'<loc>(.*?)</loc>', xml)[:3]
        for l in locs:
            print("  -", l)
except Exception as e:
    print("❌ sitemap.xml error:", e)

print("\n--- 3. Testing Channel Dynamic SEO Pre-rendering (Nile Drama) ---")
try:
    test_url = "https://arabialivetv.com/?ch=ch-1792322157387&title=%D9%82%D9%86%D8%A7%D8%A9-%D8%A7%D9%84%D9%86%D9%8A%D9%84-%D9%84%D9%84%D8%AF%D8%B1%D8%A7%D9%85%D8%A7"
    req = urllib.request.Request(test_url, headers=headers)
    with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
        html = r.read().decode('utf-8')
        
        title_m = re.search(r'<title>(.*?)</title>', html)
        desc_m = re.search(r'<meta name="description" content="(.*?)"', html)
        canon_m = re.search(r'<link rel="canonical" href="(.*?)"', html)
        og_title_m = re.search(r'<meta property="og:title" content="(.*?)"', html)
        og_img_m = re.search(r'<meta property="og:image" content="(.*?)"', html)
        
        print("Title Tag:", title_m.group(1) if title_m else "NOT FOUND")
        print("Meta Description:", desc_m.group(1) if desc_m else "NOT FOUND")
        print("Canonical Link:", canon_m.group(1) if canon_m else "NOT FOUND")
        print("OG Title:", og_title_m.group(1) if og_title_m else "NOT FOUND")
        print("OG Image:", og_img_m.group(1) if og_img_m else "NOT FOUND")
        
        if "BroadcastEvent" in html or "VideoObject" in html:
            print("✅ Rich Schema.org JSON-LD found in raw HTML!")
        else:
            print("⚠️ Schema not found in raw HTML.")
except Exception as e:
    print("❌ SEO Page error:", e)
