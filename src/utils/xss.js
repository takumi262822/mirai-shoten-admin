/**
 * 管理画面で使用するユーザー入力をエスケープ・サニタイズし、XSS を防ぐクラス。
 * @author Takumi Harada
 */
export class XSSProtectionAdmin {
  /**
   * ＆, <, >, ", ' を HTML エンティティに変換する。
   * @param {string} str
   * @returns {string}
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
   * null チェック・トリム・スクリプト文字列除去・エスケープを展適する。
   * @param {string} input
   * @returns {string}
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
   * 全角 ASCII 文字を半角に正規化する。
   * 全角スペースは半角スペースに置換する。
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
   * メールアドレスの形式を簡易検証する。
   * 送達確認ではなく形式チェックのみ。
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
   * value が min 以上 max 以下の範囲内か検証する。
   *
   * @param {number} value - 検査対象値
   * @param {number} min - 最小値
   * @param {number} max - 最大値
   * @returns {boolean} 範囲内なら true
   */
  static isInRange(value, min, max) {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max;
  }
}


