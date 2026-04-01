import express from 'express';
import { pool } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Lista comentários de uma foto
router.get('/', async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM comments WHERE photo_id = $1 ORDER BY created_at DESC',
      [photoId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Adiciona um comentário
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { photoId } = req.params;
    const { content } = req.body;
    if (!content || !content.trim()) {
      return next(new AppError('Comment content is required.', 400));
    }

    const { rows } = await pool.query(
      `INSERT INTO comments (photo_id, content) VALUES ($1, $2) RETURNING *`,
      [photoId, content.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Exclui um comentário
router.delete('/:commentId', authenticate, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM comments WHERE id = $1 RETURNING *',
      [commentId]
    );
    if (rows.length === 0) return next(new AppError('Comment not found.', 404));
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
