import sqlite3
import urllib.request
import json
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

# 1. Update local DB
print("--- 1. Updating Local DB ---")
try:
    conn = sqlite3.connect('altv_database.db')
    c = conn.cursor()
    c.execute("""
        UPDATE channels 
        SET stream_url = 'https://arabialivetv.com/api/stream/niledrama.m3u8',
            fallback_url = 'http://185.9.2.18/chid_352/index.m3u8',
            type = 'hls',
            quality = 'HD',
            logo = 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Nile_Drama.png'
        WHERE name LIKE '%النيل للدراما%'
    """)
    conn.commit()
    print("Local DB updated rows:", c.rowcount)
    conn.close()
except Exception as e:
    print("Local DB error:", e)

# 2. Update Production via API
print("\n--- 2. Updating Production via API ---")
try:
    login_payload = json.dumps({"username": "admin", "password": "admin"}).encode('utf-8')
    req = urllib.request.Request("https://arabialivetv.com/api/auth/login", data=login_payload, headers={
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    })
    with urllib.request.urlopen(req, context=ctx) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        token = res.get('token')

    # Get channels to find exact ID in production
    ch_req = urllib.request.Request("https://arabialivetv.com/api/channels", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(ch_req, context=ctx) as resp:
        ch_list = json.loads(resp.read().decode('utf-8')).get('data', [])
        nile_ch = next((c for c in ch_list if 'النيل للدراما' in c.get('name', '')), None)

    if nile_ch:
        cid = nile_ch['id']
        update_data = {
            **nile_ch,
            "streamUrl": "https://arabialivetv.com/api/stream/niledrama.m3u8",
            "fallbackUrl": "http://185.9.2.18/chid_352/index.m3u8",
            "type": "hls",
            "logo": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Nile_Drama.png"
        }
        put_req = urllib.request.Request(f"https://arabialivetv.com/api/channels/{cid}", data=json.dumps(update_data).encode('utf-8'), headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
            "User-Agent": "Mozilla/5.0"
        }, method="PUT")
        with urllib.request.urlopen(put_req, context=ctx) as resp:
            print("Production Update Response:", json.loads(resp.read().decode('utf-8')))
    else:
        print("Nile channel not found in production!")
except Exception as e:
    print("Production API update error:", e)
