const express = require('express');
const { sql, getPool } = require('../db');

const router = express.Router();

// GET /api/categories - list all categories
router.get('/', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT CategoryId, Name, Slug, Description
      FROM Categories
      ORDER BY Name
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load categories' });
  }
});

module.exports = router;
