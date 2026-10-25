import sqlite3
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

conn = sqlite3.connect('altv_database.db')
c = conn.cursor()
c.execute("SELECT DISTINCT type FROM channels")
print("Types:", c.fetchall())

c.execute("SELECT id, name, category, type, stream_url FROM channels LIMIT 5")
for row in c.fetchall():
    print(row)
conn.close()
