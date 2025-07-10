import express from 'express';
import { pool } from '../db.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// USE O DISCO PERSISTENTE!
const UPLOAD_FOLDER = '/data/uploads';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_FOLDER);
  },
  filename: function (req, file, cb) {
    // Salva a foto com timestamp para evitar conflitos
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });
const router = express.Router();

// lista todas as fotos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM photos ORDER BY id DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// upload de nova foto
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, date: taken_date, description } = req.body;
    const file_path = req.file.filename;

    const { rows } = await pool.query(
      `INSERT INTO photos
        (file_path, name, taken_date, description)
       VALUES ($1,$2,$3,$4)
       RETURNING *`,
      [file_path, name, taken_date || null, description || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// remove foto e seus comentários
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT file_path FROM photos WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.sendStatus(404);

    const file_path = rows[0].file_path;

    await pool.query('DELETE FROM photos WHERE id = $1', [id]);
    fs.unlink(path.join(UPLOAD_FOLDER, file_path), () => {});
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
