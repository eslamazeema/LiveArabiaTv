import ftplib, io

HOST = "82.198.228.113"
USER = "u161125044.arabialivetv.com"
PASS = "Azeema_2020_Smsm"

ftp = ftplib.FTP(HOST, timeout=60)
ftp.login(USER, PASS)

for target in ["/public_html", "/hbuilds/current/nodejs"]:
    try:
        ftp.cwd(target)
        files = ftp.nlst()
        print(target, "contains .htaccess:", ".htaccess" in files)
        if ".htaccess" in files:
            buf = io.BytesIO()
            ftp.retrbinary("RETR .htaccess", buf.write)
            print(f"Content of {target}/.htaccess:\n", buf.getvalue().decode('utf-8', errors='ignore'))
    except Exception as e:
        print("Error in", target, e)

ftp.quit()
