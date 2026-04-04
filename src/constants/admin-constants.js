/**
 * 注文管理システム全体で共通利用する定数定義。
 * @author Takumi Harada
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

