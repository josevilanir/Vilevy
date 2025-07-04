// backend-pixel-pal/index.js

import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { Pool } from 'pg';

// —— configuração __dirname em ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// —— variáveis de ambiente do Docker Compose
const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_USER = 'postgres',
  DB_PASS = 'postgres',
  DB_NAME = 'pixelpal',
  PORT = 4000
} = process.env;

// —— pool de conexões Postgres
const pool = new Pool({
  host:     DB_HOST,
  port:     parseInt(DB_PORT, 10),
  user:     DB_USER,
  password: DB_PASS,
  database: DB_NAME,
});

const app = express();

app.use(cors());
app.use(express.json());
// serve arquivos estáticos de upload
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// garante que a pasta existe
const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER);

// configuração do multer
const storage = multer.diskStorage({
  destination: UPLOAD_FOLDER,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// —— inicialização das tabelas e start do servidor
(async () => {
  try {
    await pool.query(`
      -- -------- tabelas existentes --------
      CREATE TABLE IF NOT EXISTS photos (
        id SERIAL PRIMARY KEY,
        file_path TEXT NOT NULL,
        name TEXT,
        description TEXT,
        taken_date TIMESTAMPTZ,
        upload_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      -- -------- NOVAS TABELAS: albums e tags --------
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS photo_albums (
        photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
        album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
        PRIMARY KEY (photo_id, album_id)
      );

      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      );
      CREATE TABLE IF NOT EXISTS photo_tags (
        photo_id INTEGER REFERENCES photos(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (photo_id, tag_id)
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();

// ── ROTAS DE ÁLBUNS ──

// 1) Listar todos os álbuns
app.get('/albums', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM albums ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /albums error:', err);
    res.sendStatus(500);
  }
});

// 2) Criar um álbum novo
app.post('/albums', async (req, res) => {
  try {
    const { name, description } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO albums (name, description)
       VALUES ($1,$2)
       RETURNING *`,
      [name, description || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /albums error:', err);
    res.sendStatus(500);
  }
});

// 3) Listar fotos de um álbum
app.get('/albums/:albumId/photos', async (req, res) => {
  try {
    const { albumId } = req.params;
    const { rows } = await pool.query(
      `SELECT p.* FROM photos p
       JOIN photo_albums pa ON pa.photo_id = p.id
       WHERE pa.album_id = $1
       ORDER BY p.upload_date DESC`,
      [albumId]
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /albums/:albumId/photos error:', err);
    res.sendStatus(500);
  }
});

// 4) Deletar um álbum (remove só o álbum, não toca nas fotos)
app.delete('/albums/:albumId', async (req, res) => {
  try {
    const { albumId } = req.params;
    const { rowCount } = await pool.query(
      'DELETE FROM albums WHERE id = $1',
      [albumId]
    );
    if (rowCount === 0) return res.sendStatus(404);
    res.sendStatus(200);
  } catch (err) {
    console.error('DELETE /albums/:albumId error:', err);
    res.sendStatus(500);
  }
});

// 5) Associar uma foto a um álbum
app.post('/albums/:albumId/photos', async (req, res) => {
  try {
    const albumId = parseInt(req.params.albumId, 10);
    const photoId = parseInt(req.body.photo_id, 10);

    if (isNaN(albumId) || isNaN(photoId)) {
      return res.status(400).json({ error: 'albumId e photo_id devem ser números' });
    }

    await pool.query(
      `INSERT INTO photo_albums (album_id, photo_id)
       VALUES ($1, $2)
       ON CONFLICT (album_id, photo_id) DO NOTHING`,  // especifica o target do conflito
      [albumId, photoId]
    );

    // 201 ou 204 funciona bem aqui, já que não estamos retornando o corpo
    return res.sendStatus(201);
  } catch (err) {
    console.error('POST /albums/:albumId/photos error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// lista todas as fotos
app.get('/photos', async (req, res) => {
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
app.post('/photos', upload.single('image'), async (req, res) => {
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
app.delete('/photos/:id', async (req, res) => {
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

// lista comentários de uma foto
app.get('/photos/:photoId/comments', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { rows } = await pool.query(
      'SELECT * FROM comments WHERE photo_id = $1 ORDER BY created_at DESC',
      [photoId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// adiciona um comentário
app.post('/photos/:photoId/comments', async (req, res) => {
  try {
    const { photoId } = req.params;
    const { content } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO comments (photo_id, content)
       VALUES ($1,$2)
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
app.delete('/photos/:photoId/comments/:commentId', async (req, res) => {
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

// ── ROTAS DE TAGS ──

// 1) Listar todas as tags
app.get('/tags', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tags ORDER BY name'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /tags error:', err);
    res.sendStatus(500);
  }
});

// 2) Criar nova tag
app.post('/tags', async (req, res) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO tags (name)
       VALUES ($1)
       ON CONFLICT (name) DO NOTHING
       RETURNING *`,
      [name.trim().toLowerCase()]
    );
    // se já existia, rows pode vir vazio; retornamos o existente
    if (rows.length === 0) {
      const { rows: existing } = await pool.query(
        'SELECT * FROM tags WHERE name = $1',
        [name.trim().toLowerCase()]
      );
      return res.json(existing[0]);
    }
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /tags error:', err);
    res.sendStatus(500);
  }
});

// 3) Listar fotos por tag
app.get('/photos', async (req, res) => {
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
    console.error('GET /photos (filter) error:', err);
    res.sendStatus(500);
  }
});
