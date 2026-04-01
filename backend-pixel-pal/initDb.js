import bcrypt from 'bcryptjs';
import { pool } from './db.js';

export async function initDb() {
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

      -- -------- albums e tags --------
      CREATE TABLE IF NOT EXISTS albums (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        cover_photo_id INTEGER REFERENCES photos(id)
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

      -- -------- autenticação --------
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Tabelas criadas (ou já existiam)');

    // Seed inicial: cria 2 usuários se a tabela estiver vazia
    const { rows: countRows } = await pool.query('SELECT count(*) FROM users');
    if (parseInt(countRows[0].count, 10) === 0) {
      const users = [
        { username: process.env.USER1_USERNAME, password: process.env.USER1_PASSWORD },
        { username: process.env.USER2_USERNAME, password: process.env.USER2_PASSWORD },
      ].filter(u => u.username && u.password);

      for (const user of users) {
        const hash = await bcrypt.hash(user.password, 10);
        await pool.query(
          'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
          [user.username, hash]
        );
      }

      if (users.length > 0) {
        console.log(`Seed: ${users.length} usuário(s) criado(s)`);
      }
    }
  } catch (err) {
    console.error('Erro ao inicializar banco:', err);
    throw err;
  }
}
