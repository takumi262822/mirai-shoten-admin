/**
 * AdminConstants ユニットテスト
 * @file tests/admin-constants.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AdminConstants } from '../src/constants/admin-constants.js';

// 管理画面で利用する主要な定数グループが公開されているかを確認する。
test('管理画面で利用する主要な定数グループが定義されていること', () => {
  assert.equal(typeof AdminConstants.ORDER_STATUS, 'object');
  assert.equal(typeof AdminConstants.VALIDATION, 'object');
  assert.equal(typeof AdminConstants.STORAGE_KEYS, 'object');
  assert.equal(typeof AdminConstants.UI_MESSAGES, 'object');
});

// 注文ステータス定数が期待した内部値で統一されているかを確認する。
test('注文ステータス定数が期待した内部値で統一されていること', () => {
  assert.equal(AdminConstants.ORDER_STATUS.PENDING, 'pending');
  assert.equal(AdminConstants.ORDER_STATUS.PROCESSING, 'processing');
  assert.equal(AdminConstants.ORDER_STATUS.SHIPPED, 'shipped');
  assert.equal(AdminConstants.ORDER_STATUS.DELIVERED, 'delivered');
  assert.equal(AdminConstants.ORDER_STATUS.CANCELLED, 'cancelled');
});

// 入力制約の最小値と最大値が仕様通りに定義されているかを確認する。
test('入力制約の最小値と最大値が仕様通りに定義されていること', () => {
  assert.equal(AdminConstants.VALIDATION.MIN_QUANTITY, 1);
  assert.equal(AdminConstants.VALIDATION.MAX_QUANTITY, 999);
  assert.equal(AdminConstants.VALIDATION.MIN_CUSTOMER_NAME, 1);
  assert.equal(AdminConstants.VALIDATION.MAX_CUSTOMER_NAME, 50);
});

// localStorage連携に使うキー名が期待値からずれていないかを確認する。
test('localStorage 連携に使うキー名が期待値からずれていないこと', () => {
  assert.equal(AdminConstants.STORAGE_KEYS.ADMIN_ORDERS, 'adminOrders');
  assert.equal(AdminConstants.STORAGE_KEYS.FUTURE_SHOP_CART, 'futureShopCart');
});

// UI表示メッセージ群が文字列として利用可能な形で定義されているかを確認する。
test('UI 表示メッセージ群が利用可能な形で定義されていること', () => {
  assert.equal(typeof AdminConstants.UI_MESSAGES.ORDER_ADDED, 'string');
  assert.equal(typeof AdminConstants.UI_MESSAGES.INVALID_EMAIL, 'string');
  assert.equal(typeof AdminConstants.UI_MESSAGES.CONFIRM_DELETE, 'string');
});

// テーマ切替定数が light/dark の既定値を含めて定義されているかを確認する。
test('テーマ切替定数が light と dark の既定値を含めて定義されていること', () => {
  assert.equal(AdminConstants.THEME.LIGHT, 'light');
  assert.equal(AdminConstants.THEME.DARK, 'dark');
  assert.equal(AdminConstants.THEME.DEFAULT, 'light');
});
