// test-db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

console.log('📋 .env values:');
console.log(`   DB_HOST: ${process.env.DB_HOST}`);
console.log(`   DB_PORT: ${process.env.DB_PORT}`);
console.log(`   DB_USER: ${process.env.DB_USER}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '****' : '(empty)'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME}`);
console.log('');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 1
});

const promisePool = pool.promise();

(async () => {
  try {
    const [rows] = await promisePool.query('SELECT 1+1 AS result');
    console.log('✅ Database connected successfully!');
    console.log('   Test query result:', rows[0].result);
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:');
    console.error(`   ${err.message}`);
    console.error('');
    console.error('Possible solutions:');
    console.error('1. Ensure XAMPP MySQL is running (check XAMPP control panel).');
    console.error('2. Verify .env file exists in the project root with correct values.');
    console.error('3. Create the database "athi_river_sda" if it does not exist.');
    console.error('   In phpMyAdmin, run: CREATE DATABASE athi_river_sda;');
    console.error('4. Check your MySQL root password (default is empty).');
    process.exit(1);
  }
})();