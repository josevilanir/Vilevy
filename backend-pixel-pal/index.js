import express from 'express';
import cors from 'cors';
import { initDb } from './initDb.js';
import { R2_PUBLIC_URL } from './storage.js';
import albumsRouter from './routes/albums.js';
import photosRouter from './routes/photos.js';
import commentsRouter from './routes/comments.js';
import tagsRouter from './routes/tags.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const PORT = process.env.PORT || 4000;

const app = express();

const frontendOrigin = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, '')
  : '*';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

// Redirect /uploads/:filename → URL pública do Cloudflare R2 (compatibilidade dev)
app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  res.redirect(301, `${R2_PUBLIC_URL}/${filename}`);
});

// Rotas da API v1
app.use('/api/v1/albums', albumsRouter);
app.use('/api/v1/photos', photosRouter);
app.use('/api/v1/photos/:photoId/comments', commentsRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/auth', authRouter);

// Error handler centralizado (deve ser o último middleware)
app.use(errorHandler);

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
