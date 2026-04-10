import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { getStats } from '../services/statsService';

const router = Router();

router.use(verifyToken);

// GET /api/stats
router.get('/', async (_req: Request, res: Response) => {
  const stats = await getStats();
  res.json(stats);
});

export default router;
