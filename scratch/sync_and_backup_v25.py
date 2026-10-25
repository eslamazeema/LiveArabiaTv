import urllib.request
import json
import ssl
import sys
import os
import sqlite3

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

base_url = "https://arabialivetv.com/api"

print("1. Fetching all live data from arabialivetv.com...")
endpoints = ['channels', 'radios', 'matches', 'news']
live_data = {}

for ep in endpoints:
    url = f"{base_url}/{ep}"
    req = urllib.request.urlopen(url, context=ctx, timeout=20)
    data = json.loads(req.read().decode('utf-8'))
    live_data[ep] = data.get('data', [])
    print(f"   -> Fetched {len(live_data[ep])} {ep}")

channels = live_data['channels']
radios = live_data['radios']
matches = live_data['matches']
news = live_data['news']

# Save channels_backup.json
print("\n2. Writing channels_backup.json and snapshot files...")
repo_dir = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv"

with open(os.path.join(repo_dir, "channels_backup.json"), "w", encoding="utf-8") as f:
    json.dump(channels, f, ensure_ascii=False, indent=2)
print("   -> Updated channels_backup.json (58 channels)")

with open(os.path.join(repo_dir, "channels_backup_v2.5.json"), "w", encoding="utf-8") as f:
    json.dump({
        "version": "2.5",
        "timestamp": "2026-10-13",
        "channelsCount": len(channels),
        "channels": channels
    }, f, ensure_ascii=False, indent=2)
print("   -> Created channels_backup_v2.5.json")

with open(os.path.join(repo_dir, "full_site_backup_v2.5.json"), "w", encoding="utf-8") as f:
    json.dump({
        "version": "2.5",
        "timestamp": "2026-10-13",
        "channels": channels,
        "radios": radios,
        "matches": matches,
        "news": news
    }, f, ensure_ascii=False, indent=2)
print("   -> Created full_site_backup_v2.5.json")

# 3. Synchronize local SQLite altv_database.db
print("\n3. Synchronizing local SQLite database (altv_database.db)...")
db_path = os.path.join(repo_dir, "altv_database.db")
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Update channels in SQLite
cur.execute("DELETE FROM channels;")
for ch in channels:
    cur.execute("""
        INSERT INTO channels (id, name, category, country, quality, logo, stream_url, fallback_url, description, is_featured, is_default, viewers_count, sort_order)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ch.get('id'),
        ch.get('name'),
        ch.get('category'),
        ch.get('country') or 'عربي',
        ch.get('quality') or 'Full HD',
        ch.get('logo') or '',
        ch.get('streamUrl') or '',
        ch.get('fallbackUrl') or ch.get('streamUrl') or '',
        ch.get('description') or '',
        1 if ch.get('isFeatured') else 0,
        1 if ch.get('isDefault') else 0,
        ch.get('viewersCount') or 15000,
        ch.get('sortOrder') or 0
    ))
conn.commit()
cur.execute("SELECT COUNT(*) FROM channels;")
count = cur.fetchone()[0]
print(f"   -> Local SQLite now has {count} channels!")

conn.close()
print("\nSnapshot and local DB sync complete!")
