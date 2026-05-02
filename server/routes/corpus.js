import { Router } from 'express';
import { query, get } from '../db.js';

const router = Router();

// GET /api/corpus — list with optional filters
router.get('/', async (req, res, next) => {
  try {
    const { scenario, difficulty, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (scenario) {
      conditions.push('scenario = ?');
      params.push(scenario);
    }
    if (difficulty) {
      conditions.push('difficulty = ?');
      params.push(parseInt(difficulty));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const [list, totalResult] = await Promise.all([
      query(
        `SELECT c.*, COUNT(s.id) as sentence_count
         FROM corpus c
         LEFT JOIN sentences s ON s.corpus_id = c.id
         ${where}
         GROUP BY c.id
         ORDER BY c.created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      ),
      query(
        `SELECT COUNT(*) as total FROM corpus ${where}`,
        params
      ),
    ]);

    // GROUP BY makes sentence_count a string; ensure it's number
    for (const row of list) {
      row.sentence_count = Number(row.sentence_count);
    }

    res.json({
      success: true,
      data: {
        list,
        total: totalResult[0].total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (err) { next(err); }
});

// GET /api/corpus/:id — detail with sentences
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);

    const corpus = await get('SELECT * FROM corpus WHERE id = ?', [id]);
    if (!corpus) {
      const err = new Error('语料未找到');
      err.statusCode = 404;
      throw err;
    }

    const sentences = await query(
      'SELECT * FROM sentences WHERE corpus_id = ? ORDER BY sentence_index ASC',
      [id]
    );

    res.json({
      success: true,
      data: { corpus, sentences },
    });
  } catch (err) { next(err); }
});

export default router;
