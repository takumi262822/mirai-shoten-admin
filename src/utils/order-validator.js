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
    if (!name || typeof name !== 'string') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = name.trim();
    if (trimmed.length < AdminConstants.VALIDATION.MIN_CUSTOMER_NAME ||
        trimmed.length > AdminConstants.VALIDATION.MAX_CUSTOMER_NAME) {
      return {
        valid: false,
        message: `顧客名は${AdminConstants.VALIDATION.MIN_CUSTOMER_NAME}～${AdminConstants.VALIDATION.MAX_CUSTOMER_NAME}文字です`,
      };
    }

    // 有効文字: 英数字、日本語、スペース
    const validNameRegex = /^[a-zA-Z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff\s]*$/;
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
    if (!productCode || typeof productCode !== 'string') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const trimmed = productCode.trim().toUpperCase();
    if (trimmed.length < 1 || trimmed.length > 10) {
      return { valid: false, message: '商品コードは1～10文字です' };
    }

    const codeRegex = /^[A-Z0-9-]*$/;
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
    if (quantity === null || quantity === '') {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const num = Number(quantity);
    if (isNaN(num) || !Number.isInteger(num)) {
      return { valid: false, message: '数量は整数で入力してください' };
    }

    const min = AdminConstants.VALIDATION.MIN_QUANTITY;
    const max = AdminConstants.VALIDATION.MAX_QUANTITY;

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
    if (totalPrice === null || totalPrice === '' || totalPrice === undefined) {
      return { valid: false, message: AdminConstants.UI_MESSAGES.REQUIRED_FIELD };
    }

    const price = Number(totalPrice);
    if (!Number.isFinite(price)) {
      return { valid: false, message: '合計金額は数値で入力してください' };
    }

    const min = AdminConstants.VALIDATION.MIN_PRICE;
    const max = AdminConstants.VALIDATION.MAX_PRICE;
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


