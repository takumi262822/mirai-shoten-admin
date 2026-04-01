/**
 * 管理者定数・設定管理
 * @class AdminConstants
 * @description 注文管理システムで使用する定数・設定値を一元管理
 * @author Takumi Harada
 * @date 2026-04-01
 */
/**
 * 定数概要:
 * - ORDER_STATUS は注文の進行状態を表す管理コード
 * - VALIDATION は顧客名、数量、金額など入力検証のしきい値
 * - STORAGE_KEYS、UI_MESSAGES、API、THEME は永続化、表示文言、拡張設定、外観設定を管理する
 */
export const AdminConstants = {
  // 注文ステータス定義
  ORDER_STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },

  // バリデーション規則
  VALIDATION: {
    MAX_CUSTOMER_NAME: 50,
    MIN_CUSTOMER_NAME: 1,
    MAX_QUANTITY: 999,
    MIN_QUANTITY: 1,
    MAX_PRICE: 999999,
    MIN_PRICE: 0,
  },

  // LocalStorage キー
  STORAGE_KEYS: {
    ADMIN_ORDERS: 'adminOrders',
    FUTURE_SHOP_CART: 'futureShopCart',
  },

  // UI テキスト
  UI_MESSAGES: {
    ORDER_ADDED: '注文を追加しました',
    ORDER_UPDATED: '注文を更新しました',
    ORDER_DELETED: '注文を削除しました',
    INVALID_EMAIL: '有効なメールアドレスを入力してください',
    INVALID_QUANTITY: '数量は1～999の整数です',
    INVALID_STATUS: '有効なステータスを選択してください',
    REQUIRED_FIELD: 'この項目は必須です',
    CONFIRM_DELETE: '本当に削除しますか？',
  },

  // API 設定（将来の拡張用）
  API: {
    TIMEOUT_MS: 5000,
    RETRY_COUNT: 3,
  },

  // UI テーマ設定
  THEME: {
    LIGHT: 'light',
    DARK: 'dark',
    DEFAULT: 'light',
  },
};

// 目的: EC 管理ダッシュボード全体で共通利用する定数を提供
// 入力: 外部設定ファイル（将来的には config.json）
// 処理: JavaScript オブジェクトリテラルで定数を集約
// 出力: 各モジュールで import AdminConstants で利用可能
// 補足: 定数の追加・変更はここのみで行う
