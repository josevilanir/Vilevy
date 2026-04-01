import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401));
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    next(new AppError('Invalid or expired token.', 401));
  }
}
