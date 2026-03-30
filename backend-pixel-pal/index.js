import express from 'express';
import cors from 'cors';
import { initDb } from './initDb.js';
import { R2_PUBLIC_URL } from './storage.js';
import albumsRouter from './routes/albums.js';
import photosRouter from './routes/photos.js';
import commentsRouter from './routes/comments.js';
import tagsRouter from './routes/tags.js';

const PORT = process.env.PORT || 4000;

const app = express();

// Permite requisições do frontend (configurar FRONTEND_URL em produção)
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

// Redirect /uploads/:filename → URL pública do Cloudflare R2
// Mantém compatibilidade total com o frontend sem alterar nenhuma linha dele
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  const r2Url = `${R2_PUBLIC_URL}/${filename}`;
  res.redirect(301, r2Url);
});

// Rotas da API
app.use('/albums', albumsRouter);
app.use('/photos', photosRouter);
app.use('/photos/:photoId/comments', commentsRouter);
app.use('/tags', tagsRouter);

// Inicializa banco e sobe o servidor
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
