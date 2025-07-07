import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// 1) Listar todas as tags
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tags ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('GET /tags error:', err);
    res.sendStatus(500);
  }
});

// 2) Criar tag (ou retornar existente)
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [name.toLowerCase().trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /tags error:', err);
    res.sendStatus(500);
  }
});

// 3) Listar fotos por tag ou busca textual (rota nova /search)
router.get('/search', async (req, res) => {
  try {
    const { tag, search } = req.query;
    let query = 'SELECT * FROM photos';
    const params = [];

    if (tag) {
      params.push(tag.toString().trim().toLowerCase());
      query = `
        SELECT p.* FROM photos p
        JOIN photo_tags pt ON pt.photo_id = p.id
        JOIN tags t       ON t.id = pt.tag_id
        WHERE t.name = $1
      `;
    } else if (search) {
      params.push(`%${search.toString().toLowerCase()}%`);
      query = `
        SELECT * FROM photos
        WHERE LOWER(name)        LIKE $1
           OR LOWER(description) LIKE $1
      `;
    } else {
      query += ' ORDER BY id DESC';
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /tags/search error:', err);
    res.sendStatus(500);
  }
});

export default router;
