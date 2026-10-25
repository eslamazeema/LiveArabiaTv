const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.join(__dirname, '..', 'altv_database.db');
const sqlite = new Database(dbPath);

sqlite.prepare("DELETE FROM channels WHERE stream_url LIKE '%shoof.alkass%'").run();
console.log('Cleaned broken shoof.alkass channels.');

const rows = sqlite.prepare("SELECT name, stream_url FROM channels WHERE category = 'sports'").all();
console.log('Active sports channels count:', rows.length);
rows.forEach(r => console.log('⚽', r.name, '->', r.stream_url));
