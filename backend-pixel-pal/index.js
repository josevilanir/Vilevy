import express from 'express';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { initDb } from './initDb.js';
import albumsRouter from './routes/albums.js';
import photosRouter from './routes/photos.js';
import commentsRouter from './routes/comments.js';
import tagsRouter from './routes/tags.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Serve arquivos estáticos de upload (PERSISTENT DISK!)
const UPLOAD_FOLDER = '/data/uploads';
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER, { recursive: true });
app.use('/uploads', express.static(UPLOAD_FOLDER));

// Rotas da API (PRIMEIRO!)
app.use('/albums', albumsRouter);
app.use('/photos', photosRouter);
app.use('/photos/:photoId/comments', commentsRouter);
app.use('/tags', tagsRouter);

// Inicializa banco E só então sobe o servidor
(async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  }
})();
