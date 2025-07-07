import { pool } from './db.js';

export async function initDb() {
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
}
