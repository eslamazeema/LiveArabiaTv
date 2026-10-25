import urllib.request
import json
import ssl
import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

channel_data = {
    "name": "قناة النيل للدراما",
    "category": "drama",
    "country": "مصر",
    "quality": "HD",
    "logo": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nile_Drama.png",
    "streamUrl": "https://geo.dailymotion.com/player/xi5eg.html?video=x8n6e3a",
    "fallbackUrl": "https://www.dailymotion.com/embed/video/x8n6e3a?autoplay=1",
    "description": "بث مباشر لقناة النيل للدراما التابعة لقطاع قنوات النيل المتخصصة بماسبيرو",
    "isFeatured": False,
    "viewersCount": 18500
}

# 1. Add to Production via Admin API
print("--- 1. Adding to Production API ---")
try:
    login_payload = json.dumps({"username": "admin", "password": "admin"}).encode('utf-8')
    req = urllib.request.Request("https://arabialivetv.com/api/auth/login", data=login_payload, headers={
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    })
    with urllib.request.urlopen(req, context=ctx) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        token = res.get('token')
        print("Logged in to production successfully.")

    add_payload = json.dumps(channel_data).encode('utf-8')
    add_req = urllib.request.Request("https://arabialivetv.com/api/channels", data=add_payload, headers={
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "Mozilla/5.0"
    }, method="POST")
    with urllib.request.urlopen(add_req, context=ctx) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("Production Add Channel Response:", res)
        created_id = res.get('data', {}).get('id')
except Exception as e:
    print("Production Add Error:", e)
    created_id = None

# 2. Add to Local SQLite DB for sync
print("\n--- 2. Adding to Local Database ---")
try:
    conn = sqlite3.connect('altv_database.db')
    c = conn.cursor()
    # Check if already exists
    c.execute("SELECT id FROM channels WHERE name = ?", (channel_data['name'],))
    row = c.fetchone()
    if row:
        print("Channel already exists locally with id:", row[0])
    else:
        import time
        cid = created_id or f"ch-{int(time.time()*1000)}"
        c.execute("SELECT MAX(sort_order) FROM channels")
        max_sort = c.fetchone()[0] or 0
        c.execute("""
            INSERT INTO channels (id, name, category, country, quality, logo, type, stream_url, fallback_url, description, is_featured, is_default, viewers_count, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
        """, (
            cid,
            channel_data['name'],
            channel_data['category'],
            channel_data['country'],
            channel_data['quality'],
            channel_data['logo'],
            'iframe',
            channel_data['streamUrl'],
            channel_data['fallbackUrl'],
            channel_data['description'],
            0,
            channel_data['viewersCount'],
            max_sort + 1
        ))
        conn.commit()
        print(f"Added to local DB successfully with ID: {cid}")
    conn.close()
except Exception as e:
    print("Local DB Error:", e)

# 3. Verify Production State
print("\n--- 3. Verifying Production State ---")
verify_req = urllib.request.Request("https://arabialivetv.com/api/channels", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(verify_req, context=ctx) as resp:
    data = json.loads(resp.read().decode('utf-8'))
    ch_list = data.get('data', [])
    print(f"Total channels in production: {len(ch_list)}")
    matched = [c for c in ch_list if 'النيل للدراما' in c.get('name', '')]
    for m in matched:
        print("  Found:", m.get('id'), "|", m.get('name'), "| Category:", m.get('category'), "| Logo:", m.get('logo')[:60])

# Verify Radios are intact
rad_req = urllib.request.Request("https://arabialivetv.com/api/radios", headers={"User-Agent": "Mozilla/5.0"})
with urllib.request.urlopen(rad_req, context=ctx) as resp:
    rad_data = json.loads(resp.read().decode('utf-8'))
    rad_list = rad_data.get('data', [])
    print(f"Total radios in production (intact): {len(rad_list)}")
