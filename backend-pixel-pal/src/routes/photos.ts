import express from 'express';
import { pool } from '../db.js';
import multer from 'multer';
import path from 'path';
import { uploadToR2, deleteFromR2 } from '../storage.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';
import { PhotoRow, TagRow } from '../types.js';
import { logger } from '../logger.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, GIF or WebP.`, 400));
    }
  },
});

const router = express.Router();

router.get('/', async (req, res, next) => {
  const search = req.query['q'] as string | undefined;
  const page = Math.max(1, parseInt(req.query['page'] as string, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query['limit'] as string, 10) || 12));
  const offset = (page - 1) * limit;

  try {
    let countResult, dataResult;

    if (search) {
      const param = `%${search}%`;
      countResult = await pool.query<{ count: string }>(
        'SELECT count(*) FROM photos WHERE name ILIKE $1 OR description ILIKE $1',
        [param]
      );
      dataResult = await pool.query<PhotoRow>(
        'SELECT * FROM photos WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
        [param, limit, offset]
      );
    } else {
      countResult = await pool.query<{ count: string }>('SELECT count(*) FROM photos');
      dataResult = await pool.query<PhotoRow>(
        'SELECT * FROM photos ORDER BY id DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      );
    }

    const total = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(total / limit) || 1;

    res.json({ photos: dataResult.rows, page, totalPages, total });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));

    const { name, date: taken_date, description } = req.body as {
      name?: string;
      date?: string;
      description?: string;
    };

    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;

    await uploadToR2(`uploads/${fileName}`, req.file.buffer, req.file.mimetype);

    const { rows } = await pool.query<PhotoRow>(
      `INSERT INTO photos (file_path, name, taken_date, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fileName, name ?? null, taken_date ?? null, description ?? null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query<Pick<PhotoRow, 'file_path'>>(
      'SELECT file_path FROM photos WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return next(new AppError('Photo not found.', 404));

    const fileName = rows[0].file_path;

    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    deleteFromR2(`uploads/${fileName}`).catch((err: Error) =>
      logger.warn({ err, fileName }, 'Falha ao deletar arquivo do R2')
    );

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body as { name?: string; description?: string };

    const { rows } = await pool.query<PhotoRow>(
      `UPDATE photos SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, id]
    );

    if (rows.length === 0) return next(new AppError('Photo not found.', 404));

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Tags de uma foto
router.get('/:id/tags', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query<TagRow>(
      `SELECT t.* FROM tags t
       JOIN photo_tags pt ON pt.tag_id = t.id
       WHERE pt.photo_id = $1
       ORDER BY t.name`,
      [id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/:id/tags', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body as { name?: string };
    if (!name || !name.trim()) return next(new AppError('Tag name is required.', 400));

    const { rows: tagRows } = await pool.query<TagRow>(
      `INSERT INTO tags (name) VALUES ($1)
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING *`,
      [name.toLowerCase().trim()]
    );
    const tag = tagRows[0];

    await pool.query(
      `INSERT INTO photo_tags (photo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [id, tag.id]
    );

    res.status(201).json(tag);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id/tags/:tagId', authenticate, async (req, res, next) => {
  try {
    const { id, tagId } = req.params;
    await pool.query(
      'DELETE FROM photo_tags WHERE photo_id = $1 AND tag_id = $2',
      [id, tagId]
    );
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

export default router;
