/**
 * AdminConstants ユニットテスト
 * @file src/constants/admin-constants.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminConstants } from './admin-constants.js';

test('AdminConstants - 定数が定義されている', () => {
  assert.equal(typeof AdminConstants.ORDER_STATUS, 'object');
  assert.equal(typeof AdminConstants.VALIDATION, 'object');
  assert.equal(typeof AdminConstants.STORAGE_KEYS, 'object');
  assert.equal(typeof AdminConstants.UI_MESSAGES, 'object');
});

test('AdminConstants - ORDER_STATUS', () => {
  assert.equal(AdminConstants.ORDER_STATUS.PENDING, 'pending');
  assert.equal(AdminConstants.ORDER_STATUS.PROCESSING, 'processing');
  assert.equal(AdminConstants.ORDER_STATUS.SHIPPED, 'shipped');
  assert.equal(AdminConstants.ORDER_STATUS.DELIVERED, 'delivered');
  assert.equal(AdminConstants.ORDER_STATUS.CANCELLED, 'cancelled');
});

test('AdminConstants - VALIDATION 範囲', () => {
  assert.equal(AdminConstants.VALIDATION.MIN_QUANTITY, 1);
  assert.equal(AdminConstants.VALIDATION.MAX_QUANTITY, 999);
  assert.equal(AdminConstants.VALIDATION.MIN_CUSTOMER_NAME, 1);
  assert.equal(AdminConstants.VALIDATION.MAX_CUSTOMER_NAME, 50);
});

test('AdminConstants - STORAGE_KEYS', () => {
  assert.equal(AdminConstants.STORAGE_KEYS.ADMIN_ORDERS, 'adminOrders');
  assert.equal(AdminConstants.STORAGE_KEYS.FUTURE_SHOP_CART, 'futureShopCart');
});

test('AdminConstants - UI_MESSAGES', () => {
  assert.equal(typeof AdminConstants.UI_MESSAGES.ORDER_ADDED, 'string');
  assert.equal(typeof AdminConstants.UI_MESSAGES.INVALID_EMAIL, 'string');
  assert.equal(typeof AdminConstants.UI_MESSAGES.CONFIRM_DELETE, 'string');
});

test('AdminConstants - THEME', () => {
  assert.equal(AdminConstants.THEME.LIGHT, 'light');
  assert.equal(AdminConstants.THEME.DARK, 'dark');
  assert.equal(AdminConstants.THEME.DEFAULT, 'light');
});
