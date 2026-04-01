import test from 'node:test';
import assert from 'node:assert/strict';

import { AdminConstants } from '../constants/admin-constants.js';
import { AdminManager } from './admin-manager.js';

function createLocalStorageMock(initialValue = null) {
  const store = new Map();

  if (initialValue !== null) {
    store.set(AdminConstants.STORAGE_KEYS.ADMIN_ORDERS, initialValue);
  }

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
    clear() {
      store.clear();
    },
  };
}

function createManager(initialOrders = null) {
  globalThis.localStorage = createLocalStorageMock(initialOrders);
  return new AdminManager();
}

// 旧保存形式の注文データを管理画面で扱う標準形式へ正規化できるかを確認する。
test('旧保存形式の注文データを管理画面用の標準形式へ正規化できること', () => {
  const manager = createManager(JSON.stringify([
    {
      id: 'OLD-001',
      customer: '佐藤花子',
      mail: 'hanako@example.com',
      items: 'mg-01',
      quantity: 3,
      price: '5400',
      status: '発送済み',
      date: '2026-04-01T00:00:00.000Z',
    },
  ]));
  const [order] = manager.getAllOrders();

  assert.equal(order.customerName, '佐藤花子');
  assert.equal(order.email, 'hanako@example.com');
  assert.equal(order.productCode, 'MG-01');
  assert.equal(order.totalPrice, 5400);
  assert.equal(order.status, AdminConstants.ORDER_STATUS.SHIPPED);
  assert.equal(order.quantity, 3);
});

// customerEmail しか存在しない旧データからもメールアドレスを引き継げるかを確認する。
test('旧データの customerEmail からメールアドレスを引き継げること', () => {
  const manager = createManager();
  const normalized = manager.normalizeOrderRecord({
    customer: '佐藤花子',
    customerEmail: 'hanako@example.com',
    price: '¥1,800',
  });

  assert.equal(normalized.email, 'hanako@example.com');
  assert.equal(normalized.totalPrice, 1800);
});

// 新規注文追加後に保存データと集計結果が更新されるかを確認する。
test('新規注文追加後に保存データと集計結果が更新されること', () => {
  const manager = createManager();
  const result = manager.addOrder({
    customerName: '田中一郎',
    email: 'tanaka@example.com',
    productCode: 'CR-10',
    quantity: 2,
    totalPrice: 4800,
    status: AdminConstants.ORDER_STATUS.PROCESSING,
  });

  const stats = manager.getStatistics();
  const stored = JSON.parse(globalThis.localStorage.getItem(AdminConstants.STORAGE_KEYS.ADMIN_ORDERS));

  assert.equal(result.success, true);
  assert.equal(stats.totalOrders, 1);
  assert.equal(stats.totalRevenue, 4800);
  assert.equal(stats.byStatus[AdminConstants.ORDER_STATUS.PROCESSING], 1);
  assert.equal(Array.isArray(stored), true);
  assert.equal(stored.length, 1);
});

// 正規化済み注文一覧から件数と売上、ステータス別集計を計算できるかを確認する。
test('正規化済み注文一覧から件数と売上を集計できること', () => {
  const manager = createManager();
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
