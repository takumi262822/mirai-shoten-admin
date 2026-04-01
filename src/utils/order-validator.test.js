import test from 'node:test';
import assert from 'node:assert/strict';

import { AdminConstants } from '../constants/admin-constants.js';
import { OrderValidator } from './order-validator.js';

// メールアドレス検証が正常値と異常値を判定できるかを確認する。
test('メールアドレス検証が正常値と異常値を判定できること', () => {
  const validEmail = OrderValidator.isValidEmail('test@example.com');
  const invalidEmail = OrderValidator.isValidEmail('invalid.email');
  const emptyEmail = OrderValidator.isValidEmail('');

  assert.equal(validEmail.valid, true);
  assert.equal(invalidEmail.valid, false);
  assert.equal(emptyEmail.valid, false);
});

// 顧客名検証が空文字と過剰長を拒否し、通常入力を受け付けるかを確認する。
test('顧客名検証が空文字と過剰長を拒否し通常入力を受け付けること', () => {
  const validName = OrderValidator.isValidCustomerName('山田太郎');
  const nameWithNumber = OrderValidator.isValidCustomerName('John123');
  const emptyName = OrderValidator.isValidCustomerName('');
  const tooLongName = OrderValidator.isValidCustomerName('a'.repeat(100));

  assert.equal(validName.valid, true);
  assert.equal(nameWithNumber.valid, true);
  assert.equal(emptyName.valid, false);
  assert.equal(tooLongName.valid, false);
});

// 数量検証が文字列数値も許容しつつ範囲外や非数値を拒否するかを確認する。
test('数量検証が文字列数値も許容しつつ範囲外や非数値を拒否できること', () => {
  const validQuantity = OrderValidator.isValidQuantity(5);
  const stringQuantity = OrderValidator.isValidQuantity('10');
  const zeroQuantity = OrderValidator.isValidQuantity(0);
  const tooHighQuantity = OrderValidator.isValidQuantity(1000);
  const invalidQuantity = OrderValidator.isValidQuantity('abc');

  assert.equal(validQuantity.valid, true);
  assert.equal(stringQuantity.valid, true);
  assert.equal(zeroQuantity.valid, false);
  assert.equal(tooHighQuantity.valid, false);
  assert.equal(invalidQuantity.valid, false);
});

// ステータス検証が許可済み値のみを受け付けるかを確認する。
test('ステータス検証が許可済み値のみを受け付けること', () => {
  const validStatus = OrderValidator.isValidStatus('pending');
  const invalidStatus = OrderValidator.isValidStatus('unknown');
  const emptyStatus = OrderValidator.isValidStatus('');

  assert.equal(validStatus.valid, true);
  assert.equal(invalidStatus.valid, false);
  assert.equal(emptyStatus.valid, false);
});

// 商品コード検証が英数字とハイフン構成を満たし、小文字入力も扱えるかを確認する。
test('商品コード検証が英数字とハイフン構成を満たすこと', () => {
  const validCode = OrderValidator.isValidProductCode('PROD-001');
  const lowerCaseCode = OrderValidator.isValidProductCode('prod-001');
  const invalidCode = OrderValidator.isValidProductCode('prod@001');
  const emptyCode = OrderValidator.isValidProductCode('');

  assert.equal(validCode.valid, true);
  assert.equal(lowerCaseCode.valid, true);
  assert.equal(invalidCode.valid, false);
  assert.equal(emptyCode.valid, false);
});

// 合計金額検証が負数や非数値を拒否できるかを確認する。
test('合計金額検証が負数や非数値を拒否できること', () => {
  const validPrice = OrderValidator.isValidTotalPrice(5000);
  const negativePrice = OrderValidator.isValidTotalPrice(-1);
  const invalidPrice = OrderValidator.isValidTotalPrice('abc');

  assert.equal(validPrice.valid, true);
  assert.equal(negativePrice.valid, false);
  assert.equal(invalidPrice.valid, false);
});

// 注文データ全体の総合検証が各必須項目の整合性をまとめて判定できるかを確認する。
test('有効な注文データを管理画面が受け入れられること', () => {
  const validOrder = {
    customerName: '山田太郎',
    email: 'yamada@example.com',
    productCode: 'MG-01',
    quantity: 2,
    totalPrice: 3600,
    status: AdminConstants.ORDER_STATUS.PENDING,
  };

  assert.equal(OrderValidator.isValidOrderData(validOrder), true);
});

// 不正なメールアドレスを含む注文データを登録前に拒否できるかを確認する。
test('不正なメールアドレスを含む注文データを拒否できること', () => {
  const invalidOrder = {
    customerName: '山田太郎',
    email: 'invalid-mail',
    productCode: 'MG-01',
    quantity: 2,
    totalPrice: 3600,
    status: AdminConstants.ORDER_STATUS.PENDING,
  };

  assert.equal(OrderValidator.isValidOrderData(invalidOrder), false);
});
