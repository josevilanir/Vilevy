import express from 'express';
import cors from 'cors';
import { env } from './env.js';
import { logger } from './logger.js';
import { R2_PUBLIC_URL } from './storage.js';
import albumsRouter from './routes/albums.js';
import photosRouter from './routes/photos.js';
import commentsRouter from './routes/comments.js';
import tagsRouter from './routes/tags.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middleware/errorHandler.js';

const PORT = env.PORT;

const app = express();

const frontendOrigin = env.FRONTEND_URL
  ? env.FRONTEND_URL.replace(/\/$/, '')
  : '*';

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

app.get('/uploads/:filename', (req, res) => {
  const { filename } = req.params;
  res.redirect(301, `${R2_PUBLIC_URL}/${filename}`);
});

app.use('/api/v1/albums', albumsRouter);
app.use('/api/v1/photos', photosRouter);
app.use('/api/v1/photos/:photoId/comments', commentsRouter);
app.use('/api/v1/tags', tagsRouter);
app.use('/api/v1/auth', authRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});
