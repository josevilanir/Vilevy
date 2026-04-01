import express from 'express';
import { pool } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// 1) Listar todos os álbuns
router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        p.file_path AS cover_photo_file_path
      FROM albums a
      LEFT JOIN photos p ON a.cover_photo_id = p.id
      ORDER BY a.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// 2) Criar um álbum novo
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) return next(new AppError('Album name is required.', 400));

    const { rows } = await pool.query(
      `INSERT INTO albums (name, description) VALUES ($1,$2) RETURNING *`,
      [name.trim(), description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// 3) Buscar um álbum
router.get('/:albumId', async (req, res, next) => {
  const { albumId } = req.params;
  try {
    const result = await pool.query(`
      SELECT
        a.*,
        p.file_path AS cover_photo_file_path
      FROM albums a
      LEFT JOIN photos p ON a.cover_photo_id = p.id
      WHERE a.id = $1
    `, [albumId]);
    if (result.rows.length === 0) return next(new AppError('Album not found.', 404));
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// 4) Definir capa do álbum
router.put('/:albumId/cover', authenticate, async (req, res, next) => {
  const { albumId } = req.params;
  const { photoId } = req.body;
  try {
    await pool.query(
      'UPDATE albums SET cover_photo_id = $1 WHERE id = $2',
      [photoId, albumId]
    );
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// 5) Listar fotos de um álbum (paginado)
router.get('/:albumId/photos', async (req, res, next) => {
  const { albumId } = req.params;
  const page  = parseInt(req.query.page, 10)  || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const offset = (page - 1) * limit;

  try {
    const cnt = await pool.query(
      'SELECT count(*) FROM photo_albums WHERE album_id = $1',
      [albumId]
    );
    const total = parseInt(cnt.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    const { rows: photos } = await pool.query(
      `SELECT p.id, p.name, p.description, p.file_path, p.taken_date, p.upload_date
       FROM photos p
       JOIN photo_albums pa ON pa.photo_id = p.id
       WHERE pa.album_id = $1
       ORDER BY p.id DESC
       LIMIT $2 OFFSET $3`,
      [albumId, limit, offset]
    );

    return res.json({ photos, page, totalPages, total });
  } catch (err) {
    next(err);
  }
});

// 6) Deletar um álbum
router.delete('/:albumId', authenticate, async (req, res, next) => {
  try {
    const { albumId } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM albums WHERE id = $1',
      [albumId]
    );
    if (rowCount === 0) return next(new AppError('Album not found.', 404));
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// 7) Associar uma foto a um álbum
router.post('/:albumId/photos', authenticate, async (req, res, next) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    const photoId = parseInt(req.body.photo_id, 10);

    if (isNaN(albumId) || isNaN(photoId)) {
      return next(new AppError('albumId e photo_id devem ser números.', 400));
    }

    await pool.query(
      `INSERT INTO photo_albums (album_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT (album_id, photo_id) DO NOTHING`,
      [albumId, photoId]
    );

    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

// 8) Desassociar uma foto de um álbum
router.delete('/:albumId/photos/:photoId', authenticate, async (req, res, next) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    const photoId = parseInt(req.params.photoId, 10);

    if (isNaN(albumId) || isNaN(photoId)) {
      return next(new AppError('albumId e photoId devem ser números.', 400));
    }

    await pool.query(
      `DELETE FROM photo_albums WHERE album_id = $1 AND photo_id = $2`,
      [albumId, photoId]
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

export default router;
