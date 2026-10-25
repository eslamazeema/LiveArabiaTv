import sqlite3
conn = sqlite3.connect('altv_database.db')
c = conn.cursor()
c.execute("""
    UPDATE channels 
    SET stream_url = 'https://www.elahmad.ru/tv/ntnegypt.php?id=drama',
        fallback_url = 'https://www.elahmad.ru/tv/ntnegypt.php?id=drama',
        type = 'iframe'
    WHERE name LIKE '%النيل للدراما%'
""")
conn.commit()
print("Local DB successfully updated:", c.rowcount)
conn.close()
