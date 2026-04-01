/**
 * 動的スタイル・テーマ管理
 * @class AdminStyleManager
 * @description 管理画面のテーマ切り替え、レスポンシブ対応、視覚効果を一元管理
 * @author Takumi Harada
 * @date 2026-04-01
 */
import { AdminConstants } from '../constants/admin-constants.js';

/**
 * 管理画面の見た目とテーマ状態を制御するクラス。
 *
 * 目的: テーマ切替、視覚効果、レスポンシブ表示を一元管理する。
 * 入力: テーマ状態、スクロール位置、ユーザー操作。
 * 処理: CSS 変数・DOM 状態・data 属性を更新して画面の見た目を整える。
 * 出力: 管理画面のスタイル状態が更新される。
 * 補足: 業務ロジックではなく、UI 表現と表示体験の責務を持つ。
 *
 * @author Takumi Harada
 * @date 2026-04-01
 */
/**
 * 処理概要:
 * - 初期化処理: 現在テーマと style タグの参照を準備する
 * - 更新処理: テーマ切替、レスポンシブ補助、管理画面専用の見た目調整を担当する
 * - 出力処理: ダッシュボード全体のスタイル状態を一貫して維持する
 */
export class AdminStyleManager {
  /**
   * コンストラクタ
   *
   * 目的: AdminStyleManager インスタンスを初期化
   * 入力: なし
   * 処理: currentTheme を DEFAULT に初期化、スタイルシートがなければ <style> タグを作成
   * 出力: AdminStyleManager インスタンス
   * 補足: DOM にアクセスするため、document.head が利用可能な環境が必須
   */
  constructor() {
    this.currentTheme = AdminConstants.THEME.DEFAULT;
  }

  /**
   * テーマを初期化
   *
   * 目的: ローカルストレージから保存済みテーマを読込、またはデフォルト設定
   * 入力: なし
   * 処理:
   *   1. localStorage['adminTheme'] を確認
   *   2. あれば読込、なければ DEFAULT を採用
   *   3. applyTheme() で実際に反映
   * 出力: this.currentTheme が更新される
   * 補足: 暗いテーマの場合、システム設定（prefers-color-scheme）にも対応
   *
   * @public
   * @returns {void}
   */
  initTheme() {
    const savedTheme = localStorage.getItem('adminTheme');
    this.currentTheme = savedTheme || AdminConstants.THEME.DEFAULT;
    this.applyTheme(this.currentTheme);
  }

  /**
   * テーマを適用
   *
   * 目的: 指定されたテーマの CSS ルールを <style> タグに追加
   * 入力: theme (string) - 'light' または 'dark'
   * 処理:
   *   1. theme に応じた CSS カラーパレットを生成
   *   2. this.styleElement.textContent に設定
   *   3. localStorage['adminTheme'] に保存
   * 出力: DOM と localStorage が更新される
   * 補足: 動的 CSS インジェクションで、ブラウザ再ロード不要
   *
   * @public
   * @param {string} theme - 適用するテーマ名（'light' | 'dark'）
   * @returns {void}
   */
  applyTheme(theme) {
    document.body.dataset.theme = theme;
    this.currentTheme = theme;
    localStorage.setItem('adminTheme', theme);
  }

  /**
   * ダークモード切り替え
   *
   * 目的: 現在のテーマを反対に切り替え（トグル操作）
   * 入力: なし
   * 処理: currentTheme を判定、反対のテーマを applyTheme() にパス
   * 出力: テーマが反転される
   * 補足: UI ボタンから呼び出されることを想定
   *
   * @public
   * @returns {void}
   */
  toggleDarkMode() {
    const newTheme = this.currentTheme === AdminConstants.THEME.LIGHT
      ? AdminConstants.THEME.DARK
      : AdminConstants.THEME.LIGHT;
    this.applyTheme(newTheme);
  }

  /**
   * レスポンシブ CSS を適用
   *
   * 目的: モバイル・タブレット・デスクトップ各解像度に対応した CSS を追加
   * 入力: なし
   * 処理:
   *   - @media (max-width: 768px) で モバイル対応
   *   - @media (max-width: 1024px) で タブレット対応
   *   - フォントサイズ・余白を解像度ごとに調整
   * 出力: this.styleElement に CSS ルールを追加
   * 補足: applyTheme() の後で呼び出すと、テーマカラーが上書きされないよう注意
   *
   * @public
   * @returns {void}
   */
  applyResponsiveCSS() {
    const glow = document.getElementById('cursor-glow');
    if (!glow) {
      return;
    }

    window.addEventListener('mousemove', (event) => {
      glow.style.setProperty('--x', `${event.clientX}px`);
      glow.style.setProperty('--y', `${event.clientY}px`);
    });
  }

  /**
   * ヘッダーのスクロール追従状態を制御
   *
   * 目的: スクロール時にヘッダーを縮小し、コンテンツへの被りを軽減する
   * 入力: なし
   * 処理: スクロール量を監視して `.scrolled` クラスを付け外しする
   * 出力: ヘッダーの見た目がスクロール位置に応じて更新される
   * 補足: sticky ヘッダーのまま圧迫感だけを抑える
   *
   * @public
   * @returns {void}
   */
  initHeaderScrollState() {
    const header = document.querySelector('.header');
    if (!header) {
      return;
    }

    const syncHeaderState = () => {
      header.classList.toggle('scrolled', window.scrollY > 24);
    };

    window.addEventListener('scroll', syncHeaderState, { passive: true });
    syncHeaderState();
  }

  /**
   * アニメーション有効/無効を切り替え
   *
   * 目的: パフォーマンス最適化のため、アニメーションを一括制御
   * 入力: enabled (boolean) - true でアニメーション有効、false で無効（prefers-reduced-motion 対応）
   * 処理: CSS prefersReducedMotion ルールで animation-duration を制御
   * 出力: DOM のアニメーション CSS が更新される
   * 補足: ユーザーのアクセシビリティ設定を尊重
   *
   * @public
   * @param {boolean} enabled - アニメーション有効フラグ
   * @returns {void}
   */
  setAnimationMode(enabled) {
    document.body.classList.toggle('reduce-motion', !enabled);
  }

  /**
   * カスタム CSS ルールを追加
   *
   * 目的: 動的に CSS ルールをスタイルシートに追加
   * 入力: selector (string) - CSS セレクタ、rules (object) - CSS プロパティ
   * 処理: CSS テキストを組み立て、this.styleElement に追記
   * 出力: DOM のスタイルシートが更新される
   * 補足: セレクタやプロパティの検証は呼び出し側で実施
   *
   * @public
   * @param {string} selector - CSS セレクタ
   * @param {object} rules - CSS プロパティ（key: value）
   * @returns {void}
   */
  addCustomRule(selector, rules) {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }

    Object.entries(rules).forEach(([key, value]) => {
      element.style.setProperty(key.replace(/([A-Z])/g, '-$1').toLowerCase(), value);
    });
  }
}

// クラス説明: 管理画面の視覚効果・テーマ・レスポンシブ対応を一元管理。動的 CSS 注入で再ロード不要
// 責務: テーマ適用、レスポンシブ CSS、アニメーション制御
// 依存: AdminConstants
