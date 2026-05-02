import jwt from 'jsonwebtoken';
import { get } from '../db.js';

export async function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const err = new Error('请先登录');
      err.statusCode = 401;
      throw err;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await get(
      'SELECT id, email, nickname FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      const err = new Error('用户不存在');
      err.statusCode = 401;
      throw err;
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      err.statusCode = 401;
      err.message = '登录已过期，请重新登录';
    }
    next(err);
  }
}
