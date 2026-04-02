import bcrypt from 'bcryptjs';
import { pool } from './db.js';
import { env } from './env.js';
import { logger } from './logger.js';

async function seedUsers(): Promise<void> {
  try {
    const { rows: countRows } = await pool.query<{ count: string }>('SELECT count(*) FROM users');
    if (parseInt(countRows[0].count, 10) > 0) {
      logger.info('Seed: usuários já existem, nenhum criado.');
      return;
    }

    const candidates = [
      { username: env.USER1_USERNAME, password: env.USER1_PASSWORD },
      { username: env.USER2_USERNAME, password: env.USER2_PASSWORD },
    ].filter((u): u is { username: string; password: string } =>
      Boolean(u.username && u.password)
    );

    for (const user of candidates) {
      const hash = await bcrypt.hash(user.password, 10);
      await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
        [user.username, hash]
      );
    }

    if (candidates.length > 0) {
      logger.info(`Seed: ${candidates.length} usuário(s) criado(s)`);
    }
  } catch (err) {
    logger.error({ err }, 'Erro ao fazer seed de usuários');
    throw err;
  } finally {
    await pool.end();
  }
}

seedUsers();
