/**
 * AdminManager ユニットテスト
 * @file src/core/admin-manager.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminManager } from './admin-manager.js';
import { AdminConstants } from '../constants/admin-constants.js';

test('AdminManager - normalize legacy order record', () => {
  const manager = new AdminManager();
  const normalized = manager.normalizeOrderRecord({
    id: '#1234',
    customer: '山田太郎',
    email: 'taro@example.com',
    items: 'ほっこり陶器マグ(2)',
    price: '¥3,600',
    status: '準備中',
    date: '2026/04/01 10:00:00',
  });

  assert.equal(normalized.customerName, '山田太郎');
  assert.equal(normalized.email, 'taro@example.com');
  assert.equal(normalized.productCode, 'ほっこり陶器マグ(2)'.toUpperCase());
  assert.equal(normalized.totalPrice, 3600);
  assert.equal(normalized.status, AdminConstants.ORDER_STATUS.PROCESSING);
  assert.equal(normalized.quantity, 1);
});

test('AdminManager - normalize customerEmail fallback', () => {
  const manager = new AdminManager();
  const normalized = manager.normalizeOrderRecord({
    customer: '佐藤花子',
    customerEmail: 'hanako@example.com',
    price: '¥1,800',
  });

  assert.equal(normalized.email, 'hanako@example.com');
});

test('AdminManager - getStatistics sums normalized totalPrice', () => {
  const manager = new AdminManager();
  manager.orders = [
    manager.normalizeOrderRecord({ customer: 'A', price: '¥1,200', status: '準備中' }),
    manager.normalizeOrderRecord({ customer: 'B', price: '¥800', status: '配達完了' }),
  ];

  const stats = manager.getStatistics();
  assert.equal(stats.totalOrders, 2);
  assert.equal(stats.totalRevenue, 2000);
  assert.equal(stats.byStatus.processing, 1);
  assert.equal(stats.byStatus.delivered, 1);
});
