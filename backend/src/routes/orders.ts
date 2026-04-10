import { Router, Request, Response } from 'express';
import { verifyToken } from '../middleware/auth';
import * as orderService from '../services/orderService';
import { ORDER_STATUSES, OrderFilter, OrderStatus } from '../types';

const router = Router();

// このルーター配下すべてに認証を要求
router.use(verifyToken);

// GET /api/orders
router.get('/', async (req: Request, res: Response) => {
  const { status, page = '1', limit = '20', sort = 'createdAt_desc' } = req.query as Record<string, string>;

  if (status && !ORDER_STATUSES.includes(status as OrderStatus)) {
    res.status(422).json({ error: '無効なステータスです' });
    return;
  }

  const filter: OrderFilter = {
    status: status as OrderStatus | undefined,
    page: Math.max(1, parseInt(page, 10) || 1),
    limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    sort: sort === 'createdAt_asc' ? 'createdAt_asc' : 'createdAt_desc',
  };

  const result = await orderService.findAll(filter);
  res.json(result);
});

// POST /api/orders
router.post('/', async (req: Request, res: Response) => {
  const body = req.body;

  if (!body.customer_name || !body.email) {
    res.status(422).json({
      error: 'バリデーションエラー',
      details: [
        ...(!body.customer_name ? [{ field: 'customer_name', message: '顧客名は必須です' }] : []),
        ...(!body.email ? [{ field: 'email', message: 'メールアドレスは必須です' }] : []),
      ],
    });
    return;
  }

  const order = await orderService.create(body);
  res.status(201).json(order);
});

// GET /api/orders/:id
router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const order = await orderService.findById(id);
  if (!order) {
    res.status(404).json({ error: '注文が見つかりません' });
    return;
  }
  res.json(order);
});

// PUT /api/orders/:id
router.put('/:id', async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await orderService.findById(id);
  if (!existing) {
    res.status(404).json({ error: '注文が見つかりません' });
    return;
  }

  const updated = await orderService.update(id, req.body);
  res.json(updated);
});

// DELETE /api/orders/:id
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const existing = await orderService.findById(id);
  if (!existing) {
    res.status(404).json({ error: '注文が見つかりません' });
    return;
  }

  await orderService.remove(id);
  res.json({ message: '削除しました' });
});

export default router;
