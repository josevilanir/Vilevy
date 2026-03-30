import express from 'express';
import { pool } from '../db.js';
import multer from 'multer';
import path from 'path';
import { uploadToR2, deleteFromR2 } from '../storage.js';

// Multer com memória: o arquivo fica em req.file.buffer (não grava no disco)
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// lista todas as fotos, agora com busca!
router.get('/', async (req, res) => {
  const search = req.query.q;
  try {
    let rows;
    if (search) {
      const { rows: searchRows } = await pool.query(
        `SELECT * FROM photos
         WHERE name ILIKE $1 OR description ILIKE $1
         ORDER BY id DESC`,
        [`%${search}%`]
      );
      rows = searchRows;
    } else {
      const { rows: allRows } = await pool.query(
        'SELECT * FROM photos ORDER BY id DESC'
      );
      rows = allRows;
    }
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// upload de nova foto → vai direto pro Cloudflare R2
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { name, date: taken_date, description } = req.body;

    // Gera nome único para o arquivo
    const ext = path.extname(req.file.originalname);
    const baseName = path.basename(req.file.originalname, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;

    // Faz upload para o Cloudflare R2
    await uploadToR2(fileName, req.file.buffer, req.file.mimetype);

    // Salva só o nome do arquivo no banco
    const { rows } = await pool.query(
      `INSERT INTO photos (file_path, name, taken_date, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [fileName, name, taken_date || null, description || null]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// remove foto do banco e do R2
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'SELECT file_path FROM photos WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.sendStatus(404);

    const fileName = rows[0].file_path;

    // Deleta do banco primeiro
    await pool.query('DELETE FROM photos WHERE id = $1', [id]);

    // Depois tenta deletar do R2 (não falha o request se o R2 der erro)
    deleteFromR2(fileName).catch((err) =>
      console.warn(`Aviso: falha ao deletar ${fileName} do R2:`, err.message)
    );

    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// atualizar dados de uma foto
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { rows } = await pool.query(
      `UPDATE photos
       SET name = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );

    if (rows.length === 0) return res.sendStatus(404);

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

export default router;
