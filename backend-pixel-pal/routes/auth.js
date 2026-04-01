import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return next(new AppError('Username and password are required.', 400));
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = rows[0];

    // Don't distinguish "user not found" from "wrong password"
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return next(new AppError('Invalid credentials.', 401));
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, username: user.username });
  } catch (err) {
    next(err);
  }
});

export default router;
