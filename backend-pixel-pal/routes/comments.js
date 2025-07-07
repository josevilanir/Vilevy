import express from 'express';
import { pool } from '../db.js';

const router = express.Router({ mergeParams: true });

// Lista comentários de uma foto
router.get('/', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM comments WHERE photo_id = $1 ORDER BY created_at DESC',
      [photoId]
    );
    console.log('rows:', rows);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// adiciona um comentário
router.post('/', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { content } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO comments (photo_id, content)
       VALUES ($1, $2)
       RETURNING *`,
      [photoId, content]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// exclui um comentário
router.delete('/:commentId', async (req, res) => {
  try {
    const { commentId } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [commentId]
    );
    if (rows.length === 0) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;