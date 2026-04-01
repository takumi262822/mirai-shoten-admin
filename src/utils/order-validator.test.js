/**
 * OrderValidator ユニットテスト
 * @file src/utils/order-validator.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OrderValidator } from './order-validator.js';

test('OrderValidator - isValidEmail()', () => {
  const validEmail = OrderValidator.isValidEmail('test@example.com');
  assert.equal(validEmail.valid, true);

  const invalidEmail = OrderValidator.isValidEmail('invalid.email');
  assert.equal(invalidEmail.valid, false);

  const emptyEmail = OrderValidator.isValidEmail('');
  assert.equal(emptyEmail.valid, false);
});

test('OrderValidator - isValidCustomerName()', () => {
  const validName = OrderValidator.isValidCustomerName('山田太郎');
  assert.equal(validName.valid, true);

  const nameWithNumber = OrderValidator.isValidCustomerName('John123');
  assert.equal(nameWithNumber.valid, true);

  const emptyName = OrderValidator.isValidCustomerName('');
  assert.equal(emptyName.valid, false);

  const tooLongName = OrderValidator.isValidCustomerName('a'.repeat(100));
  assert.equal(tooLongName.valid, false);
});

test('OrderValidator - isValidQuantity()', () => {
  const validQuantity = OrderValidator.isValidQuantity(5);
  assert.equal(validQuantity.valid, true);

  const stringQuantity = OrderValidator.isValidQuantity('10');
  assert.equal(stringQuantity.valid, true);

  const zeroQuantity = OrderValidator.isValidQuantity(0);
  assert.equal(zeroQuantity.valid, false);

  const tooHighQuantity = OrderValidator.isValidQuantity(1000);
  assert.equal(tooHighQuantity.valid, false);

  const invalidQuantity = OrderValidator.isValidQuantity('abc');
  assert.equal(invalidQuantity.valid, false);
});

test('OrderValidator - isValidStatus()', () => {
  const validStatus = OrderValidator.isValidStatus('pending');
  assert.equal(validStatus.valid, true);

  const invalidStatus = OrderValidator.isValidStatus('unknown');
  assert.equal(invalidStatus.valid, false);

  const emptyStatus = OrderValidator.isValidStatus('');
  assert.equal(emptyStatus.valid, false);
});

test('OrderValidator - isValidProductCode()', () => {
  const validCode = OrderValidator.isValidProductCode('PROD-001');
  assert.equal(validCode.valid, true);

  const upperCaseConversion = OrderValidator.isValidProductCode('prod-001');
  assert.equal(upperCaseConversion.valid, true);

  const invalidCode = OrderValidator.isValidProductCode('prod@001');
  assert.equal(invalidCode.valid, false);

  const emptyCode = OrderValidator.isValidProductCode('');
  assert.equal(emptyCode.valid, false);
});

test('OrderValidator - isValidOrderData()', () => {
  const validOrder = {
    customerName: '山田太郎',
    email: 'test@example.com',
    productCode: 'PROD-001',
    quantity: 5,
    totalPrice: 5000,
    status: 'pending',
  };
  const result = OrderValidator.isValidOrderData(validOrder);
  assert.equal(typeof result, 'boolean');
  assert.equal(result, true);

  const invalidOrder = {
    customerName: '',
    email: 'invalid',
    productCode: '',
    quantity: 0,
    totalPrice: -1,
    status: 'unknown',
  };
  const badResult = OrderValidator.isValidOrderData(invalidOrder);
  assert.equal(typeof badResult, 'boolean');
  assert.equal(badResult, false);
});

test('OrderValidator - isValidTotalPrice()', () => {
  const validPrice = OrderValidator.isValidTotalPrice(5000);
  assert.equal(validPrice.valid, true);

  const negativePrice = OrderValidator.isValidTotalPrice(-1);
  assert.equal(negativePrice.valid, false);

  const invalidPrice = OrderValidator.isValidTotalPrice('abc');
  assert.equal(invalidPrice.valid, false);
});
