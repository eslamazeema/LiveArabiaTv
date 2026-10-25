const bcrypt = require('bcryptjs');
const db = require('./database.js');

async function updatePassword() {
  const hash = await bcrypt.hash('admin', 10);
  if (db.db && db.db.prepare) {
    db.db.prepare('UPDATE admin_users SET password_hash = ? WHERE username = "admin"').run(hash);
    console.log('✅ Admin password updated to "admin" in SQLite!');
  }
}

updatePassword();
