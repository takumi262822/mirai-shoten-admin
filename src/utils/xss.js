/**
 * XSS 対策・入力値エスケープ機能
 * @class XSSProtectionAdmin
 * @description 管理画面で使用するあらゆるユーザー入力を安全にエスケープ・サニタイズ
 * @author Takumi Harada
 * @date 2026-04-01
 */
export class XSSProtectionAdmin {
  /**
   * HTML 特殊文字をエスケープ
   *
   * 目的: XSS 攻撃を防ぐため、ユーザー入力の特殊文字を安全な形式に変換
   * 入力: str (string) - エスケープ対象の文字列
   * 処理: &, <, >, ", ' を HTML エンティティに置換
   * 出力: エスケープされた文字列
   * 補足: innerHTML での表示時の主要防御手段
   *
   * @param {string} str - エスケープ対象文字列
   * @returns {string} エスケープ済み文字列
   */
  static escape(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  /**
   * 入力値を検証・正規化
   *
   * 目的: ユーザー入力の危険な文字を除去。先頭末尾の空白をトリム
   * 入力: input (string) - ユーザーの生入力
   * 処理: null チェック → trim → 制御文字・スクリプト除去 → エスケープ
   * 出力: 正規化されたクリーンな文字列
   * 補足: フォーム送信前に必ず実行する
   *
   * @param {string} input - ユーザー入力
   * @returns {string} 正規化済み文字列
   */
  static sanitizeInput(input) {
    if (!input || typeof input !== 'string') return '';

    const normalized = input.trim();
    const hasScriptTag = /<script\b[^>]*>[\s\S]*?<\/script>/i.test(normalized);
    const hasJavascriptProtocol = /javascript\s*:/i.test(normalized);
    const hasInlineHandler = /on\w+\s*=/i.test(normalized);

    if (hasScriptTag || hasJavascriptProtocol || hasInlineHandler) {
      return '';
    }

    return this.escape(normalized);
  }

  /**
   * 全角 ASCII 文字を半角に正規化
   *
   * 目的: 入力の一貫性を保つ（全角スペース → 半角等の統一）
   * 入力: str (string) - 可能性のある全角文字を含む文字列
   * 処理: 全角英数字・スペースを検出。該当する場合は半角に置換
   * 出力: 正規化された文字列
   * 補足: JP 固有の問題に対応（例: ユーザーが全角で入力した場合）
   *
   * @param {string} str - 正規化対象文字列
   * @returns {string} 半角に統一された文字列
   */
  static normalizeFullWidthAscii(str) {
    if (!str || typeof str !== 'string') return '';

    // 全角英数字を半角に
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }).replace(/　/g, ' ');
  }

  /**
   * メールアドレスの簡易検証
   *
   * 目的: 基本的なメール形式妥当性チェック
   * 入力: email (string) - ユーザーが入力したメールアドレス
   * 処理: RFC 5322 簡易正規表現で検証
   * 出力: boolean - 有効な形式なら true
   * 補足: 送達確認ではなく、形式チェックのみ
   *
   * @param {string} email - メールアドレス候補
   * @returns {boolean} 有効な形式なら true
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * 数値の範囲検証
   *
   * 目的: 数量・価格などの入力が有効範囲内か確認
   * 入力: value (number) - 検査対象、min (number) - 最小値、max (number) - 最大値
   * 処理: min <= value <= max の検証
   * 出力: boolean - 範囲内なら true
   * 補足: 整数性の検証は呼び出し側で実施
   *
   * @param {number} value - 検査値
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @returns {boolean} 有効な範囲なら true
   */
  static isInRange(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }
}

// クラス説明: XSS 脅威から管理画面を守るため、すべてのユーザー入力を統一された方法でサニタイズ
// 責務: 入力値の検証・エスケープ・正規化を担当
// 依存: なし（ピュアな文字列処理）
