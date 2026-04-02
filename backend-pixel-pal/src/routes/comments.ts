import express from 'express';
import { pool } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { CommentRow } from '../types.js';

const router = express.Router({ mergeParams: true });

router.get('/', async (req, res, next) => {
  try {
    const { photoId } = req.params as { photoId: string };
    const { rows } = await pool.query<CommentRow>(
      'SELECT * FROM comments WHERE photo_id = $1 ORDER BY created_at DESC',
      [photoId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, async (req, res, next) => {
  try {
    const { photoId } = req.params as { photoId: string };
    const { content } = req.body as { content?: string };
    if (!content || !content.trim()) {
      return next(new AppError('Comment content is required.', 400));
    }

    const { rows } = await pool.query<CommentRow>(
      `INSERT INTO comments (photo_id, content) VALUES ($1, $2) RETURNING *`,
      [photoId, content.trim()]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:commentId', authenticate, async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { rows } = await pool.query<CommentRow>(
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
