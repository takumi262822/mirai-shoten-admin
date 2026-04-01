/**
 * XSSProtectionAdmin ユニットテスト
 * @file src/utils/xss.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { XSSProtectionAdmin } from './xss.js';

test('XSSProtectionAdmin - escape()', () => {
  assert.equal(XSSProtectionAdmin.escape('<script>'), '&lt;script&gt;');
  assert.equal(XSSProtectionAdmin.escape('test & test'), 'test &amp; test');
  assert.equal(XSSProtectionAdmin.escape('"quote"'), '&quot;quote&quot;');
  assert.equal(XSSProtectionAdmin.escape("'quote'"), '&#x27;quote&#x27;');
});

test('XSSProtectionAdmin - sanitizeInput()', () => {
  assert.equal(XSSProtectionAdmin.sanitizeInput('  hello  '), 'hello');
  assert.equal(XSSProtectionAdmin.sanitizeInput('<script>alert(1)</script>'), '');
  assert.equal(XSSProtectionAdmin.sanitizeInput('javascript:alert(1)'), '');
  assert.equal(XSSProtectionAdmin.sanitizeInput(null), '');
  assert.equal(XSSProtectionAdmin.sanitizeInput(undefined), '');
});

test('XSSProtectionAdmin - isValidEmail()', () => {
  assert.equal(XSSProtectionAdmin.isValidEmail('test@example.com'), true);
  assert.equal(XSSProtectionAdmin.isValidEmail('invalid.email'), false);
  assert.equal(XSSProtectionAdmin.isValidEmail(''), false);
  assert.equal(XSSProtectionAdmin.isValidEmail(null), false);
});

test('XSSProtectionAdmin - isInRange()', () => {
  assert.equal(XSSProtectionAdmin.isInRange(5, 1, 10), true);
  assert.equal(XSSProtectionAdmin.isInRange(0, 1, 10), false);
  assert.equal(XSSProtectionAdmin.isInRange(11, 1, 10), false);
  assert.equal(XSSProtectionAdmin.isInRange(1, 1, 10), true);
  assert.equal(XSSProtectionAdmin.isInRange(10, 1, 10), true);
});

test('XSSProtectionAdmin - normalizeFullWidthAscii()', () => {
  // Note: Full-width ASCII characters would be converted
  assert.equal(XSSProtectionAdmin.normalizeFullWidthAscii('test'), 'test');
  assert.equal(XSSProtectionAdmin.normalizeFullWidthAscii(''), '');
  assert.equal(XSSProtectionAdmin.normalizeFullWidthAscii(null), '');
});
