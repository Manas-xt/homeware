require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { getPool } = require('../db');

function splitSql(sql) {
  // split on lines that contain only GO (case-insensitive)
  return sql
    .split(/^GO$/gim)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function runFile(filePath) {
  const abs = path.resolve(__dirname, '..', '..', filePath);
  if (!fs.existsSync(abs)) {
    throw new Error(`SQL file not found: ${abs}`);
  }
  const sql = fs.readFileSync(abs, 'utf8');
  const parts = splitSql(sql);
  const pool = await getPool();
  for (const stmt of parts) {
    console.log('Executing statement chunk (chars):', stmt.length);
    try {
      // use batch to allow GO-less batches
      await pool.request().batch(stmt);
    } catch (err) {
      console.error('Statement failed:', err.message || err);
      throw err;
    }
  }
}

(async () => {
  try {
    console.log('Running schema.sql...');
    await runFile('database/schema.sql');
    console.log('Schema applied. Running seed.sql...');
    await runFile('database/seed.sql');
    console.log('Seed applied. Done.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to run SQL scripts:', err.message || err);
    process.exit(1);
  }
})();
