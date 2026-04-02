import express from 'express';
import { pool } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { TagRow, PhotoRow } from '../types.js';

const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const { rows } = await pool.query<TagRow>('SELECT * FROM tags ORDER BY name');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) return next(new AppError('Tag name is required.', 400));

    const result = await pool.query<TagRow>(
      'INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING *',
      [name.toLowerCase().trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { tag, search } = req.query as { tag?: string; search?: string };
    let query = 'SELECT * FROM photos';
    const params: string[] = [];

    if (tag) {
      params.push(tag.trim().toLowerCase());
      query = `
        SELECT p.* FROM photos p
        JOIN photo_tags pt ON pt.photo_id = p.id
        JOIN tags t       ON t.id = pt.tag_id
        WHERE t.name = $1
      `;
    } else if (search) {
      params.push(`%${search.toLowerCase()}%`);
      query = `
        SELECT * FROM photos
        WHERE LOWER(name)        LIKE $1
           OR LOWER(description) LIKE $1
      `;
    } else {
      query += ' ORDER BY id DESC';
    }

    const { rows } = await pool.query<PhotoRow>(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
