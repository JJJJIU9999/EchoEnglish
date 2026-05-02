import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { query, get, run } from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// All routes require auth
router.use(auth);

// POST /api/vocabulary
router.post('/', [
  body('word').trim().isLength({ min: 1, max: 100 }).withMessage('请输入单词'),
  body('definition').optional().trim(),
  body('sentence_id').optional().isInt(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(errors.array()[0].msg);
      err.statusCode = 400;
      throw err;
    }

    const { word, definition, sentence_id } = req.body;

    // Check duplicate
    const existing = await get(
      'SELECT id FROM vocabulary WHERE user_id = ? AND word = ?',
      [req.user.id, word.trim()]
    );
    if (existing) {
      const err = new Error('该词已在生词本中');
      err.statusCode = 409;
      throw err;
    }

    const { insertId } = await run(
      'INSERT INTO vocabulary (user_id, word, definition, sentence_id) VALUES (?, ?, ?, ?)',
      [req.user.id, word.trim(), definition || null, sentence_id || null]
    );

    const vocab = await get('SELECT * FROM vocabulary WHERE id = ?', [insertId]);

    res.status(201).json({ success: true, data: { vocabulary: vocab } });
  } catch (err) { next(err); }
});

// GET /api/vocabulary
router.get('/', async (req, res, next) => {
  try {
    const { mastery_level } = req.query;
    let sql = 'SELECT * FROM vocabulary WHERE user_id = ?';
    const params = [req.user.id];

    if (mastery_level !== undefined) {
      sql += ' AND mastery_level = ?';
      params.push(parseInt(mastery_level));
    }

    sql += ' ORDER BY created_at DESC';

    const list = await query(sql, params);

    res.json({ success: true, data: { list } });
  } catch (err) { next(err); }
});

// PATCH /api/vocabulary/:id
router.patch('/:id', [
  body('mastery_level').isInt({ min: 0, max: 3 }).withMessage('掌握度必须在0-3之间'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = new Error(errors.array()[0].msg);
      err.statusCode = 400;
      throw err;
    }

    const id = parseInt(req.params.id);
    const vocab = await get('SELECT * FROM vocabulary WHERE id = ?', [id]);

    if (!vocab) {
      const err = new Error('生词未找到');
      err.statusCode = 404;
      throw err;
    }
    if (vocab.user_id !== req.user.id) {
      const err = new Error('无权操作');
      err.statusCode = 403;
      throw err;
    }

    await run('UPDATE vocabulary SET mastery_level = ? WHERE id = ?', [req.body.mastery_level, id]);
    const updated = await get('SELECT * FROM vocabulary WHERE id = ?', [id]);

    res.json({ success: true, data: { vocabulary: updated } });
  } catch (err) { next(err); }
});

// DELETE /api/vocabulary/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const vocab = await get('SELECT * FROM vocabulary WHERE id = ?', [id]);

    if (!vocab) {
      const err = new Error('生词未找到');
      err.statusCode = 404;
      throw err;
    }
    if (vocab.user_id !== req.user.id) {
      const err = new Error('无权操作');
      err.statusCode = 403;
      throw err;
    }

    await run('DELETE FROM vocabulary WHERE id = ?', [id]);
    res.json({ success: true, message: '已删除' });
  } catch (err) { next(err); }
});

export default router;
