import express from 'express';
import multer from 'multer';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const UPLOAD_FOLDER = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER);

const storage = multer.diskStorage({
  destination: UPLOAD_FOLDER,
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

let db;

(async () => {
  db = await open({
    filename: './photos.db',
    driver: sqlite3.Database
  });

  await db.run(`CREATE TABLE IF NOT EXISTS photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT,
    description TEXT,
    name TEXT,
    taken_date TEXT,
    upload_date TEXT
  )`);

  await db.run(`CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    photo_id INTEGER,
    content TEXT,
    created_at TEXT,
    FOREIGN KEY (photo_id) REFERENCES photos(id)
  )`);
})();

app.get('/photos', async (req, res) => {
  const photos = await db.all('SELECT * FROM photos ORDER BY id DESC');
  res.json(photos);
});

app.post('/photos', upload.single('image'), async (req, res) => {
  const { name, date, description } = req.body;
  const file_path = req.file.filename;
  const upload_date = new Date().toISOString();

  await db.run(
    'INSERT INTO photos (file_path, name, taken_date, description, upload_date) VALUES (?, ?, ?, ?, ?)',
    file_path, name, date, description, upload_date
  );

  res.sendStatus(200);
});

app.delete('/photos/:id', async (req, res) => {
  const id = req.params.id;
  const photo = await db.get('SELECT * FROM photos WHERE id = ?', id);

  if (!photo) return res.sendStatus(404);

  await db.run('DELETE FROM photos WHERE id = ?', id);
  await db.run('DELETE FROM comments WHERE photo_id = ?', id);

  fs.unlink(path.join(UPLOAD_FOLDER, photo.file_path), () => {});
  res.sendStatus(200);
});

app.get('/photos/:photoId/comments', async (req, res) => {
  const { photoId } = req.params;
  const comments = await db.all(
    'SELECT * FROM comments WHERE photo_id = ? ORDER BY created_at DESC',
    photoId
  );
  res.json(comments);
});

app.post('/photos/:photoId/comments', async (req, res) => {
  const { photoId } = req.params;
  const { content } = req.body;
  const created_at = new Date().toISOString();

  await db.run(
    'INSERT INTO comments (photo_id, content, created_at) VALUES (?, ?, ?)',
    photoId, content, created_at
  );
  res.sendStatus(200);
});

app.delete('/photos/:photoId/comments/:commentId', async (req, res) => {
  const { commentId, photoId } = req.params;

  const comment = await db.get('SELECT * FROM comments WHERE id = ? AND photo_id = ?', commentId, photoId);
  if (!comment) return res.sendStatus(404);

  await db.run('DELETE FROM comments WHERE id = ?', commentId);
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
