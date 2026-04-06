/**
 * 注文追加・編集時の入力値の妥当性を検証するクラス。
 * @author Takumi Harada
 * @date 2026/3/31
 */
import { AdminConstants } from '../constants/admin-constants.js';
import { XSSProtectionAdmin } from './xss.js';

export class OrderValidator {
  /**
   * 注文データ全体の妥当性を一括検証する。
   * 1項目でも不正な場合は false を返す。
   *
   * @param {object} orderData - 検証対象の注文オブジェクト
   * @returns {boolean} 全て有効なら true
   */
  static isValidOrderData(orderData) {
    // nullまたはオブジェクト型以外の場合は即座に false を返す
    if (!orderData || typeof orderData !== 'object') {
      return false;
    }

    return this.isValidCustomerName(orderData.customerName).valid &&
      this.isValidEmail(orderData.email).valid &&
      this.isValidProductCode(orderData.productCode).valid &&
      this.isValidQuantity(orderData.quantity).valid &&
      this.isValidTotalPrice(orderData.totalPrice).valid &&
      this.isValidStatus(orderData.status).valid;
  }

  /**
   * 顧客名の入力値を検証する、1～50 文字で英数字・日本語・スペースのみ許容。
   *
   * @param {string} name - 検証対象の顧客名
   * @returns {{ valid: boolean, message: string }}
   */
  static isValidCustomerName(name) {
    // 顧客名が空または文字型以外の場合は必須エラーを返す
    if (!name || typeof name !== 'string') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = name.trim();
    // 顧客名が制限文字数（MIN～MAX）の範囲外の場合は長さエラーを返す
    if (trimmed.length < AdminConstants.VALIDATION.MIN_CUSTOMER_NAME ||
        trimmed.length > AdminConstants.VALIDATION.MAX_CUSTOMER_NAME) {
      return {
        valid: false,
        message: `顧客名は${AdminConstants.VALIDATION.MIN_CUSTOMER_NAME}～${AdminConstants.VALIDATION.MAX_CUSTOMER_NAME}文字です`,
      };
    }

    // 有効文字: 英数字、日本語、スペース
    const validNameRegex = /^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\s]*$/;
    // 使用不可能な文字種が含まれる場合は文字種エラーを返す
    if (!validNameRegex.test(trimmed)) {
      return { valid: false, message: '顧客名に使用できない文字があります' };
    }

    return { valid: true, message: '' };
  }

  /**
   * メールアドレスの形式を検証する。送達確認ではなく形式チェックのみ。
   *
   * @param {string} email - 検証対象のメールアドレス
   * @returns {{ valid: boolean, message: string }}
   */
  static isValidEmail(email) {
    // メールアドレスが空または文字型以外の場合は必須エラーを返す
    if (!email || typeof email !== 'string') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const isValid = XSSProtectionAdmin.isValidEmail(email);
    return isValid
      ? { valid: true, message: '' }
      : { valid: false, message: AdminConstants.UI_MESSAGES.INVALID_EMAIL };
  }

  /**
   * 商品コードの形式を検証する、1～10文字の英数字・ハイフンのみ許容。
   *
   * @param {string} productCode - 検証対象の商品コード
   * @returns {{ valid: boolean, message: string }}
   */
  static isValidProductCode(productCode) {
    // 商品コードが空または文字型以外の場合は必須エラーを返す
    if (!productCode || typeof productCode !== 'string') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = productCode.trim().toUpperCase();
    // 商品コードが制限文字数（1～10）の範囲外の場合は長さエラーを返す
    if (trimmed.length < 1 || trimmed.length > 10) {
      return { valid: false, message: '商品コードは1～10文字です' };
    }

    const codeRegex = /^[A-Z0-9-]*$/;
    // 商品コードに英数字・ハイフン以外の文字が含まれる場合は文字種エラーを返す
    if (!codeRegex.test(trimmed)) {
      return { valid: false, message: '商品コードは英数字とハイフンのみです' };
    }

    return { valid: true, message: '' };
  }

  /**
   * 注文数量が整数かつ有効範囲内（1～999）か検証する。
   *
   * @param {number|string} quantity - 検証対象の数量
   * @returns {{ valid: boolean, message: string }}
   */
  static isValidQuantity(quantity) {
    // 数量が null または空文字の場合は必須エラーを返す
    if (quantity === null || quantity === '') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const num = Number(quantity);
    // 数量が整数でない場合は型形式エラーを返す
    if (isNaN(num) || !Number.isInteger(num)) {
      return { valid: false, message: '数量は整数で入力してください' };
    }

    const min = AdminConstants.VALIDATION.MIN_QUANTITY;
    const max = AdminConstants.VALIDATION.MAX_QUANTITY;

    // 数量が有効範囲（1～999）外の場合は範囲エラーを返す
    if (!XSSProtectionAdmin.isInRange(num, min, max)) {
      return {
        valid: false,
        message: `数量は${min}～${max}の整数です`,
      };
    }

    return { valid: true, message: '' };
  }

  /**
   * 合計金額が 0 以上かつ上限以内か検証する。小数は許容するが負数は不正とする。
   *
   * @param {number|string} totalPrice - 検証対象の合計金額
   * @returns {{ valid: boolean, message: string }}
   */
  static isValidTotalPrice(totalPrice) {
    // 合計金額が null・空文字・ undefined の場合は必須エラーを返す
    if (totalPrice === null || totalPrice === '' || totalPrice === undefined) {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const price = Number(totalPrice);
    // 合計金額が有限数値でない場合は数値形式エラーを返す
    if (!Number.isFinite(price)) {
      return { valid: false, message: '合計金額は数値で入力してください' };
    }

    const min = AdminConstants.VALIDATION.MIN_PRICE;
    const max = AdminConstants.VALIDATION.MAX_PRICE;
    // 合計金額が有効範囲（0～999999）外の場合は範囲エラーを返す
    if (!XSSProtectionAdmin.isInRange(price, min, max)) {
      return { valid: false, message: `合計金額は${min}～${max}の範囲で入力してください` };
    }

    return { valid: true, message: '' };
  }

  /**
   * ステータスが AdminConstants.ORDER_STATUS の許可値に含まれるか検証する。
   *
   * @param {string} status - 検証対象のステータス
   * @returns {{ valid: boolean, message: string }}
   */
  static isValidStatus(status) {
    // ステータスが空または文字型以外の場合は必須エラーを返す
    if (!status || typeof status !== 'string') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const validStatuses = Object.values(AdminConstants.ORDER_STATUS);
    const isValid = validStatuses.includes(status);

    return isValid
      ? { valid: true, message: '' }
      : { valid: false, message: AdminConstants.UI_MESSAGES.INVALID_STATUS };
  }
}


