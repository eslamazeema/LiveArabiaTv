import sqlite3
import urllib.request
import json
import ssl
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# 1. Check local DB
try:
    conn = sqlite3.connect('altv_database.db')
    c = conn.cursor()
    c.execute("SELECT id, name, category, stream_url FROM channels WHERE name LIKE '%نيل%' OR name LIKE '%دراما%' OR stream_url LIKE '%x8n6e3a%'")
    rows = c.fetchall()
    print("Local DB matches:")
    for r in rows:
        print("  ", r)
    c.execute("SELECT count(*) FROM channels")
    print("Total channels locally:", c.fetchone()[0])
    conn.close()
except Exception as e:
    print("Local DB error:", e)

# 2. Check production API
try:
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    req = urllib.request.Request("https://arabialivetv.com/api/channels", headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
        channels = json.loads(resp.read().decode('utf-8'))
        print(f"\nProduction total channels: {len(channels)}")
        prod_matches = [ch for ch in channels if 'نيل' in ch.get('name', '') or 'دراما' in ch.get('name', '') or 'x8n6e3a' in ch.get('stream_url', '')]
        print(f"Production matches found: {len(prod_matches)}")
        for ch in prod_matches:
            print("  ID:", ch.get('id'), "| Name:", ch.get('name'), "| URL:", ch.get('stream_url'))
except Exception as e:
    print("Production API error:", e)
