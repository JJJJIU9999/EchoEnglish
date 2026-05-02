import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import { query as dbQuery, get, run } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require auth
router.use(auth);

// POST /api/learning/records
router.post('/records', [
  body('corpus_id').isInt({ min: 1 }).withMessage('无效的语料ID'),
  body('total_sentences').isInt({ min: 1 }).withMessage('练习句数必须大于0'),
  body('correct_sentences').isInt({ min: 0 }).withMessage('正确句数不能为负数'),
  body('accuracy').isFloat({ min: 0, max: 100 }).withMessage('正确率必须在0-100之间'),
  body('duration_seconds').isInt({ min: 0 }).withMessage('练习时长无效'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(errors.array()[0].msg);
      err.statusCode = 400;
      throw err;
    }

    const { corpus_id, total_sentences, correct_sentences, accuracy, duration_seconds } = req.body;

    const { insertId } = await run(
      `INSERT INTO learning_records (user_id, corpus_id, total_sentences, correct_sentences, accuracy, duration_seconds)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, corpus_id, total_sentences, correct_sentences, accuracy, duration_seconds]
    );

    const record = await get('SELECT * FROM learning_records WHERE id = ?', [insertId]);

    res.status(201).json({ success: true, data: { record } });
  } catch (err) { next(err); }
});

// GET /api/learning/records
router.get('/records', async (req, res, next) => {
  try {
    const { corpus_id, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let where = 'WHERE lr.user_id = ?';
    const params = [req.user.id];

    if (corpus_id) {
      where += ' AND lr.corpus_id = ?';
      params.push(parseInt(corpus_id));
    }

    const [list, totalResult] = await Promise.all([
      dbQuery(
        `SELECT lr.*, c.title as corpus_title
         FROM learning_records lr
         LEFT JOIN corpus c ON c.id = lr.corpus_id
         ${where}
         ORDER BY lr.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      ),
      dbQuery(
        `SELECT COUNT(*) as total FROM learning_records lr ${where}`,
        params
      ),
    ]);

    res.json({
      success: true,
      data: { list, total: totalResult[0].total, page: pageNum, limit: limitNum },
    });
  } catch (err) { next(err); }
});

// GET /api/learning/stats
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await get(
      `SELECT
         COUNT(*) as total_sessions,
         COALESCE(SUM(duration_seconds), 0) as total_duration_seconds,
         COALESCE(AVG(accuracy), 0) as average_accuracy,
         COALESCE(SUM(total_sentences), 0) as total_sentences_attempted,
         COALESCE(SUM(correct_sentences), 0) as total_sentences_correct
       FROM learning_records
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({ success: true, data: stats });
  } catch (err) { next(err); }
});

export default router;
