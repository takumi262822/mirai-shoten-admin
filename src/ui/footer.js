/**
 * Footer copyright year display class
 * @author Takumi Harada
 * @date 2026/3/31
 */
export class Footer {
  /**
   * [data-current-year] 属性を持つ要素に現在の西暦年をセットする
   * @param {string} selector - 対象セレクタ（デフォルト: [data-current-year]）
   */
  setYear(selector = "[data-current-year]") {
    const target = document.querySelector(selector);
    if (!target) return;
    target.textContent = String(new Date().getFullYear());
  }
}
