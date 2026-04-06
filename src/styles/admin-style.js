/**
 * テーマ切替・レスポンシブ・スクロール追従ヘッダーなどダッシュボードの表示スタイルを制御するクラス。
 * @author Takumi Harada
 * @date 2026/3/31
 */
import { AdminConstants } from '../constants/admin-constants.js';

export class AdminStyleManager {
  /** currentTheme を DEFAULT で初期化する。 */
  constructor() {
    this.currentTheme = AdminConstants.THEME.DEFAULT;
  }

  /**
   * localStorage から保存済みテーマを読み込み、applyTheme() で反映する。
   */
  initTheme() {
    const savedTheme = localStorage.getItem('adminTheme');
    this.currentTheme = savedTheme || AdminConstants.THEME.DEFAULT;
    this.applyTheme(this.currentTheme);
  }

  /**
   * テーマを data-theme 属性と localStorage に反映する。
   * @param {string} theme - 'light' | 'dark'
   */
  applyTheme(theme) {
    document.body.dataset.theme = theme;
    this.currentTheme = theme;
    localStorage.setItem('adminTheme', theme);
  }

  /** LIGHT ↔ DARK をトグルする。 */
  toggleDarkMode() {
    const newTheme = this.currentTheme === AdminConstants.THEME.LIGHT
      ? AdminConstants.THEME.DARK
      : AdminConstants.THEME.LIGHT;
    this.applyTheme(newTheme);
  }

  /** カーソル位置を CSS 変数に反映するグローエフェクトを初期化する。 */
  applyResponsiveCSS() {
    const glow = document.getElementById('cursor-glow');
    // カーソルグロー要素が DOM に存在しない場合はユーザーイベント登録をスキップする
    if (!glow) {
      return;
    }

    window.addEventListener('mousemove', (event) => {
      glow.style.setProperty('--x', `${event.clientX}px`);
      glow.style.setProperty('--y', `${event.clientY}px`);
    });
  }

  /**
   * スクロール量に応じてヘッダーに .scrolled クラスを付け外す。
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
   * prefers-reduced-motion 対応。false 時は reduce-motion クラスを付与する。
   * @param {boolean} enabled
   */
  setAnimationMode(enabled) {
    document.body.classList.toggle('reduce-motion', !enabled);
  }

  /**
   * CSS セレクタの要素に rules のプロパティを一括適用する。
   * @param {string} selector
   * @param {object} rules
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
