import express from 'express';
import { pool } from '../db.js';
import multer from 'multer';
import path from 'path';
import { uploadToR2, deleteFromR2 } from '../storage.js';
import { AppError } from '../middleware/errorHandler.js';
import { authenticate } from '../middleware/auth.js';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter(_, file, cb) {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError(`Unsupported file type: ${file.mimetype}. Use JPEG, PNG, GIF or WebP.`, 400));
    }
  },
});

const router = express.Router();

// Lista todas as fotos com paginação e busca
router.get('/', async (req, res, next) => {
  const search = req.query.q;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const offset = (page - 1) * limit;

  try {
    let countResult, dataResult;

    if (search) {
      const param = `%${search}%`;
      countResult = await pool.query(
        'SELECT count(*) FROM photos WHERE name ILIKE $1 OR description ILIKE $1',
        [param]
      );
      dataResult = await pool.query(
        'SELECT * FROM photos WHERE name ILIKE $1 OR description ILIKE $1 ORDER BY id DESC LIMIT $2 OFFSET $3',
        [param, limit, offset]
      );
    } else {
      countResult = await pool.query('SELECT count(*) FROM photos');
      dataResult = await pool.query(
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

// Upload de nova foto → vai direto pro Cloudflare R2
router.post('/', authenticate, upload.single('photo'), async (req, res, next) => {
  try {
    if (!req.file) return next(new AppError('No file uploaded.', 400));

    const { name, date: taken_date, description } = req.body;

    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;

    await uploadToR2(`uploads/${fileName}`, req.file.buffer, req.file.mimetype);

    const { rows } = await pool.query(
      `INSERT INTO photos (file_path, name, taken_date, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fileName, name || null, taken_date || null, description || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Remove foto do banco e do R2
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT file_path FROM photos WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return next(new AppError('Photo not found.', 404));

    const fileName = rows[0].file_path;

    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    deleteFromR2(`uploads/${fileName}`).catch((err) =>
      console.warn(`Aviso: falha ao deletar uploads/${fileName} do R2:`, err.message)
    );

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
});

// Atualizar dados de uma foto
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { rows } = await pool.query(
      `UPDATE photos SET name = $1, description = $2 WHERE id = $3 RETURNING *`,
      [name, description, id]
    );

    if (rows.length === 0) return next(new AppError('Photo not found.', 404));

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

export default router;
