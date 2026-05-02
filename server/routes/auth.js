import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { get, run } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码长度不能少于6位'),
  body('nickname').trim().isLength({ min: 1, max: 100 }).withMessage('请输入昵称'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(errors.array()[0].msg);
      err.statusCode = 400;
      throw err;
    }

    const { email, password, nickname } = req.body;

    // Check duplicate email
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      const err = new Error('该邮箱已被注册');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { insertId } = await run(
      'INSERT INTO users (email, password_hash, nickname) VALUES (?, ?, ?)',
      [email, passwordHash, nickname.trim()]
    );

    const user = { id: insertId, email, nickname: nickname.trim() };
    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, data: { token, user } });
  } catch (err) { next(err); }
});

// POST /api/auth/login
router.post('/login', [
  body('email').notEmpty().withMessage('请输入邮箱'),
  body('password').notEmpty().withMessage('请输入密码'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(errors.array()[0].msg);
      err.statusCode = 400;
      throw err;
    }

    const { email, password } = req.body;

    const user = await get(
      'SELECT id, email, password_hash, nickname FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      const err = new Error('邮箱或密码错误');
      err.statusCode = 401;
      throw err;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      const err = new Error('邮箱或密码错误');
      err.statusCode = 401;
      throw err;
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      data: { token, user: { id: user.id, email: user.email, nickname: user.nickname } },
    });
  } catch (err) { next(err); }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        nickname: req.user.nickname,
      },
    },
  });
});

export default router;
