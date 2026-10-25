import ftplib
import os
import io
import urllib.request
import json
import ssl
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOST = "82.198.228.113"
USER = "u161125044.arabialivetv.com"
PASS = "Azeema_2020_Smsm"
local_dir = r"c:\Users\EEHC\.gemini\antigravity-ide\scratch\arabia-live-tv"

files_to_sync = [
    "index.html",
    "admin.html",
    "style.css",
    "app.js",
    "admin.js",
    "server.js",
    "database.js",
    "channels_data.js",
    "robots.txt",
    "sitemap.xml"
]

print("Connecting to FTP...")
ftp = ftplib.FTP(HOST, timeout=60)
ftp.login(USER, PASS)
print("FTP logged in successfully!")

for target in ["/hbuilds/current/nodejs", "/public_html"]:
    print(f"\n--- Uploading files to {target} ---")
    try:
        ftp.cwd(target)
    except Exception as e:
        print(f"Failed to cwd {target}: {e}")
        continue
    for fname in files_to_sync:
        fpath = os.path.join(local_dir, fname)
        if os.path.exists(fpath):
            with open(fpath, "rb") as f:
                ftp.storbinary(f"STOR {fname}", f)
            print(f"Uploaded {fname} to {target}")

# Restart Passenger
try:
    ftp.cwd("/hbuilds/current/nodejs/tmp")
    ftp.storbinary("STOR restart.txt", io.BytesIO(b"restart-matches-update-" + str(os.getpid()).encode()))
    print("\n✅ Touched restart.txt to reload Passenger!")
except Exception as e:
    print("Could not touch restart.txt:", e)

ftp.quit()
print("FTP upload completed!\n")

# Verify live site
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.urlopen("https://arabialivetv.com/api/matches", context=ctx, timeout=15)
    data = json.loads(req.read().decode())
    print("Live matches API test:", data.get("success"), "Count:", len(data.get("data", [])))
    print("✅ Live production site is up and running!")
except Exception as e:
    print("Warning: Live API test error:", e)
