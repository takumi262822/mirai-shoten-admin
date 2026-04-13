// src/library/routes.ts
import { Router } from 'express';
import ordersRouter from '../routes/orders';
import customersRouter from '../routes/customers';
import authRouter from '../routes/auth';
import statsRouter from '../routes/stats';

const router = Router();

router.use('/orders', ordersRouter);
router.use('/customers', customersRouter);
router.use('/auth', authRouter);
router.use('/stats', statsRouter);

export default router;
