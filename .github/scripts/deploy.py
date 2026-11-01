import ftplib
import os
import io
import urllib.request
import json
import ssl
import sys
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

HOST = os.environ.get("FTP_HOST", "82.198.228.113")
USER = os.environ.get("FTP_USER", "u161125044.arabialivetv.com")
PASS = os.environ.get("FTP_PASS", "Azeema_2020_Smsm")

# Determine repository root
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

backend_files = [
    "server.js",
    "database.js",
    "channels_data.js",
    "clubs_catalog.js",
    "live_score_service.js",
    "package.json",
    "index.html",
    "admin.html",
    "style.css",
    "app.js",
    "admin.js"
]

frontend_files = [
    "index.html",
    "admin.html",
    "style.css",
    "app.js",
    "admin.js",
    "channels_data.js",
    "clubs_catalog.js",
    "live_score_service.js"
]

print(f"Connecting to Production FTP ({HOST})...")
ftp = ftplib.FTP(HOST, timeout=60)
ftp.login(USER, PASS)
print("✅ FTP logged in successfully!")

# Detect Node.js versions
targets = ["/hbuilds/current/nodejs"]
try:
    ftp.cwd("/hbuilds/versions")
    versions = [v for v in ftp.nlst() if v not in ['.', '..']]
    print("Detected version directories:", versions)
    for v in versions:
        targets.append(f"/hbuilds/versions/{v}/nodejs")
except Exception as e:
    print("Warning inspecting /hbuilds/versions:", e)

# Upload backend and app files to nodejs targets
for target in targets:
    print(f"\n==========================================")
    print(f"Uploading files to target: {target}")
    try:
        ftp.cwd(target)
    except Exception as e:
        print(f"Could not cwd to {target}: {e}")
        continue

    for fname in backend_files:
        fpath = os.path.join(repo_root, fname)
        if os.path.exists(fpath):
            with open(fpath, "rb") as f:
                ftp.storbinary(f"STOR {fname}", f)
            print(f"  -> Uploaded {fname} ({os.path.getsize(fpath)} bytes)")

    # Ensure tmp directory exists and touch restart.txt for Passenger reload
    try:
        try:
            ftp.mkd(f"{target}/tmp")
        except Exception:
            pass
        ftp.cwd(f"{target}/tmp")
        restart_payload = f"restart-{int(time.time())}".encode('utf-8')
        ftp.storbinary("STOR restart.txt", io.BytesIO(restart_payload))
        print(f"  -> ✅ Touched {target}/tmp/restart.txt")
    except Exception as e:
        print(f"  -> Notice touching restart in {target}: {e}")

# Upload static frontend files to /public_html
print("\n==========================================")
print("Uploading static frontend files to /public_html...")
try:
    ftp.cwd("/public_html")
    for fname in frontend_files:
        fpath = os.path.join(repo_root, fname)
        if os.path.exists(fpath):
            with open(fpath, "rb") as f:
                ftp.storbinary(f"STOR {fname}", f)
            print(f"  -> Uploaded {fname} to /public_html")
except Exception as e:
    print("Error uploading to public_html:", e)

# Upload assets if available
assets_dir = os.path.join(repo_root, "assets", "logos")
if os.path.exists(assets_dir):
    try:
        try:
            ftp.mkd("/public_html/assets")
        except Exception:
            pass
        try:
            ftp.mkd("/public_html/assets/logos")
        except Exception:
            pass
        ftp.cwd("/public_html/assets/logos")
        for logo_file in os.listdir(assets_dir):
            lpath = os.path.join(assets_dir, logo_file)
            if os.path.isfile(lpath):
                with open(lpath, "rb") as f:
                    ftp.storbinary(f"STOR {logo_file}", f)
        print("  -> ✅ Assets and logos synced to /public_html/assets/logos")
    except Exception as e:
        print("Notice uploading assets:", e)

ftp.quit()
print("\n🎉 Deployment completed. Waiting 5s for server reload...")
time.sleep(5)

# Verify Live Production Site
print("\n==========================================")
print("Verifying Live Production Site at https://arabialivetv.com/api/health ...")
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

success = False
for attempt in range(1, 5):
    try:
        print(f"Attempt {attempt}/4...")
        req = urllib.request.urlopen("https://arabialivetv.com/api/health", context=ctx, timeout=15)
        res = json.loads(req.read().decode('utf-8'))
        print("✅ Health Response:", json.dumps(res, indent=2))
        if res.get("status") == "online":
            success = True
            print("\n🚀 SUCCESS! Production server is ONLINE and verified.")
            break
    except Exception as e:
        print(f"Verification error (attempt {attempt}):", e)
    time.sleep(3)

if not success:
    print("⚠️ Warning: Health verification did not respond with online status yet.")
