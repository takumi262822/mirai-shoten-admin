/**
 * 注文データ検証ロジック
 * @class OrderValidator
 * @description 注文追加・編集時のフォーム入力値の妥当性を一元管理
 * @author Takumi Harada
 * @date 2026-04-01
 */
import { AdminConstants } from '../constants/admin-constants.js';
import { XSSProtectionAdmin } from './xss.js';

/**
 * 注文入力値の妥当性を検証するクラス。
 *
 * 目的: 管理画面の注文追加・編集で不正な入力を防ぐ。
 * 入力: 顧客名、メール、商品コード、数量、金額、ステータスなどの注文項目。
 * 処理: 項目ごとの形式・範囲・許可値を検証し、結果を返す。
 * 出力: 各項目の検証結果と、注文全体の妥当性判定を返す。
 * 補足: 詳細なエラーメッセージを返せるため、UI 側の表示にもそのまま利用できる。
 *
 * @author Takumi Harada
 * @date 2026-04-01
 */
export class OrderValidator {
  /**
   * 注文データ全体の妥当性検証
   *
   * 目的: 注文追加前に各フィールドが全て有効か一括チェック
   * 入力: orderData (object) - { customerName, email, productCode, quantity, totalPrice, status }
   * 処理: 各フィールドの個別検証メソッドを順次実行
  * 出力: boolean - 全て有効なら true、1つでも不正なら false
  * 補足: 各フィールドの詳細メッセージは個別メソッド側で管理する
   *
   * @param {object} orderData - 検証対象の注文オブジェクト
   * @returns {boolean} 有効なら true
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
   * 顧客名の検証
   *
   * 目的: 顧客名が名目上の要件を満たしているか確認
   * 入力: name (string) - 顧客名候補
   * 処理: null チェック → 長さチェック（1～50文字） → 有効文字チェック（英数・日本語・スペース）
   * 出力: { valid: boolean, message: string }
   * 補足: エラーメッセージは UI に直接表示可能型
   *
   * @param {string} name - 検証対象の顧客名
   * @returns {object} { valid: boolean, message: string }
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
   * メールアドレスの検証
   *
   * 目的: メール形式の妥当性をチェック
   * 入力: email (string) - メールアドレス候補
   * 処理: XSSProtectionAdmin.isValidEmail() を用いて RFC 5322 簡易形式確認
   * 出力: { valid: boolean, message: string }
   * 補足: 送達可能性の確認ではなく、形式チェックのみ
   *
   * @param {string} email - 検証対象のメールアドレス
   * @returns {object} { valid: boolean, message: string }
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
   * 商品コードの検証
   *
   * 目的: 商品コードが有効か確認
   * 入力: productCode (string) - 商品コード候補
   * 処理: null チェック → 長さチェック（1～3文字） → 英数字のみチェック
   * 出力: { valid: boolean, message: string }
   * 補足: 商品レジストリ自体の確認は後段で実施（今は形式チェックのみ）
   *
   * @param {string} productCode - 検証対象の商品コード
   * @returns {object} { valid: boolean, message: string }
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
   * 注文数量の検証
   *
   * 目的: 数量が有効な整数か確認
   * 入力: quantity (number | string) - 数量候補
   * 処理: 数値変換 → 整数判定 → 範囲チェック（1～999）
   * 出力: { valid: boolean, message: string }
   * 補足: フォームから来た値は文字列の可能性があるため、型チェック必須
   *
   * @param {number|string} quantity - 検証対象の数量
   * @returns {object} { valid: boolean, message: string }
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
   * 合計金額の検証
   *
   * 目的: 注文金額が 0 以上の範囲内に収まっているか確認
   * 入力: totalPrice (number | string) - 金額候補
   * 処理: 数値変換 → 有限数判定 → 範囲チェック
   * 出力: { valid: boolean, message: string }
   * 補足: 小数は許容するが、負数と上限超過は不正とする
   *
   * @param {number|string} totalPrice - 検証対象の合計金額
   * @returns {object} { valid: boolean, message: string }
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
   * 注文ステータスの検証
   *
   * 目的: ステータスが許可された値か確認
   * 入力: status (string) - ステータス候補
   * 処理: AdminConstants.ORDER_STATUS の値に含まれるか確認
   * 出力: { valid: boolean, message: string }
   * 補足: ステータス遷移ルール（例: pending → shipped） はここでは検証しない
   *
   * @param {string} status - 検証対象のステータス
   * @returns {object} { valid: boolean, message: string }
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

// クラス説明: 注文フォーム入力の妥当性を一元的に検証する責務を担当
// 責務: 各フィールド（顧客名・メール・数量・ステータス等）の個別検証 + 全体妥当性チェック
// 依存: AdminConstants, XSSProtectionAdmin
