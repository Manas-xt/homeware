const express = require('express');
const { sql, getPool } = require('../db');

const router = express.Router();

// GET /api/products?category=lighting&search=vase&page=1&pageSize=12
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, pageSize = 12 } = req.query;
    const pool = await getPool();
    const request = pool.request();

    let where = 'WHERE p.IsActive = 1';
    if (category) {
      where += ' AND c.Slug = @category';
      request.input('category', sql.NVarChar, category);
    }
    if (search) {
      where += ' AND (p.Name LIKE @search OR p.Description LIKE @search)';
      request.input('search', sql.NVarChar, `%${search}%`);
    }

    const offset = (Number(page) - 1) * Number(pageSize);
    request.input('offset', sql.Int, offset);
    request.input('pageSize', sql.Int, Number(pageSize));

    const result = await request.query(`
      SELECT
        p.ProductId, p.Sku, p.Name, p.Slug, p.Description,
        p.Price, p.Currency, p.Material, p.ImageUrl, p.StockQuantity,
        c.Name AS CategoryName, c.Slug AS CategorySlug,
        COUNT(*) OVER() AS TotalCount
      FROM Products p
      JOIN Categories c ON c.CategoryId = p.CategoryId
      ${where}
      ORDER BY p.Name
      OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
    `);

    const total = result.recordset[0]?.TotalCount || 0;
    res.json({
      items: result.recordset.map(({ TotalCount, ...rest }) => rest),
      page: Number(page),
      pageSize: Number(pageSize),
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load products' });
  }
});

// GET /api/products/:slug - single product detail
router.get('/:slug', async (req, res) => {
  try {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query(`
        SELECT
          p.ProductId, p.Sku, p.Name, p.Slug, p.Description,
          p.Price, p.Currency, p.Material, p.ImageUrl, p.StockQuantity,
          c.Name AS CategoryName, c.Slug AS CategorySlug
        FROM Products p
        JOIN Categories c ON c.CategoryId = p.CategoryId
        WHERE p.Slug = @slug AND p.IsActive = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load product' });
  }
});

module.exports = router;
