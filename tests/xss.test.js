/**
 * XSSProtectionAdmin ユニットテスト
 * @file tests/xss.test.js
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { XSSProtectionAdmin } from '../src/utils/xss.js';

// エスケープ処理がHTML記号を安全な実体参照へ変換できるかを確認する。
test('HTML 記号を安全な実体参照へエスケープできること', () => {
  assert.equal(XSSProtectionAdmin.escape('<script>'), '&lt;script&gt;');
  assert.equal(XSSProtectionAdmin.escape('test & test'), 'test &amp; test');
  assert.equal(XSSProtectionAdmin.escape('"quote"'), '&quot;quote&quot;');
  assert.equal(XSSProtectionAdmin.escape("'quote'"), '&#x27;quote&#x27;');
});

// 入力サニタイズ処理が前後空白除去と危険文字列の排除を行うかを確認する。
test('入力サニタイズで危険文字列と不要な前後空白を除去できること', () => {
  assert.equal(XSSProtectionAdmin.sanitizeInput('  hello  '), 'hello');
  assert.equal(XSSProtectionAdmin.sanitizeInput('<script>alert(1)</script>'), '');
  assert.equal(XSSProtectionAdmin.sanitizeInput('javascript:alert(1)'), '');
  assert.equal(XSSProtectionAdmin.sanitizeInput(null), '');
  assert.equal(XSSProtectionAdmin.sanitizeInput(undefined), '');
});

// メールアドレス判定が空値や不正形式を除外できるかを確認する。
test('メールアドレス形式の妥当性を判定できること', () => {
  assert.equal(XSSProtectionAdmin.isValidEmail('test@example.com'), true);
  assert.equal(XSSProtectionAdmin.isValidEmail('invalid.email'), false);
  assert.equal(XSSProtectionAdmin.isValidEmail(''), false);
  assert.equal(XSSProtectionAdmin.isValidEmail(null), false);
});

// 数値の範囲判定が境界値を含めて正しく動作するかを確認する。
test('数値の範囲判定が境界値を含めて正しく動作すること', () => {
  assert.equal(XSSProtectionAdmin.isInRange(5, 1, 10), true);
  assert.equal(XSSProtectionAdmin.isInRange(0, 1, 10), false);
  assert.equal(XSSProtectionAdmin.isInRange(11, 1, 10), false);
  assert.equal(XSSProtectionAdmin.isInRange(1, 1, 10), true);
  assert.equal(XSSProtectionAdmin.isInRange(10, 1, 10), true);
});

// 全角ASCII正規化が通常文字列や空値を安全に処理できるかを確認する。
test('全角 ASCII 正規化が通常文字列や空値を安全に処理できること', () => {
  // Note: Full-width ASCII characters would be converted
  assert.equal(XSSProtectionAdmin.normalizeFullWidthAscii('test'), 'test');
  assert.equal(XSSProtectionAdmin.normalizeFullWidthAscii(''), '');
  assert.equal(XSSProtectionAdmin.normalizeFullWidthAscii(null), '');
});
