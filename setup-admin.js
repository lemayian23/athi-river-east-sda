// setup-admin.js
const bcrypt = require('bcrypt');
const db = require('./database/db');

(async () => {
  const username = 'admin';
  const plainPassword = 'Admin123!'; // Change this!
  const hashed = await bcrypt.hash(plainPassword, 10);

  try {
    // Check if user exists
    const [rows] = await db.query('SELECT * FROM users WHERE username = ?', [username]);
    if (rows.length > 0) {
      console.log('Admin user already exists. Updating password...');
      await db.query('UPDATE users SET password_hash = ? WHERE username = ?', [hashed, username]);
      console.log('Admin password updated.');
    } else {
      await db.query(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, hashed, 'admin']
      );
      console.log('Admin user created successfully.');
    }
  } catch (err) {
    console.error('Error setting up admin:', err);
  } finally {
    process.exit();
  }
})();