import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import { getCustomers } from '../services/statsService';

const router = Router();

router.use(verifyToken);

// GET /api/customers
router.get('/', async (_req: Request, res: Response) => {
  const customers = await getCustomers();
  res.json({ customers });
});

export default router;
