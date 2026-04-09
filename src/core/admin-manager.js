/**
 * localStorage を介して注文データの CRUD・検索・統計更新を統括するシングルトンクラス。
 * @author Takumi Harada
 * @date 2026/3/31
 */
import { AdminConstants } from '../constants/admin-constants.js';
import { OrderValidator } from '../utils/order-validator.js';
import { XSSProtectionAdmin } from '../utils/xss.js';
export class AdminManager {
  /**
   * orders を空配列で初期化し、localStorage から既存データを読み込む。
   */
  constructor() {
    this.orders = [];
    this.storageKey = AdminConstants.STORAGE_KEYS.ADMIN_ORDERS;
    this.loadOrdersFromStorage();
  }

  /**
   * 単一インスタンスを返す。未展開時は自動生成する。
   * @returns {AdminManager}
   */
  static getInstance() {
    // インスタンスが未生成の場合にのみ新規作成する（シングルトン保証）
    if (!AdminManager._instance) {
      AdminManager._instance = new AdminManager();
    }
    return AdminManager._instance;
  }

  /**
   * localStorage[adminOrders] から注文一覧を読み込んで this.orders に格納する。
   * 読込み失敗時は空配列にフォールバックする。
   * @private
   */
  loadOrdersFromStorage() {
    try {
      const data   = localStorage.getItem(this.storageKey);
      const parsed = data ? JSON.parse(data) : [];
      // 平文 JSON だけでなく、旧フォーマットのデータも normalizeOrderRecord で吸索する
      this.orders = Array.isArray(parsed)
        ? parsed.map((order) => this.normalizeOrderRecord(order)).filter(Boolean)
        : [];
    } catch (e) {
      // JSON.parse 失敗時は空配列にフォールバック。データ欺損より起動不能の方が困る
      console.warn(`[AdminManager] LocalStorage 読込失敗: ${e.message}`);
      this.orders = [];
    }
  }

  /**
   * 旧保存形式（customer/price/dateキー）を含む注文データを管理画面用の標準形式へ正規化する。
   * @private
   * @param {object} rawOrder - 正規化対象の注文データ
   * @returns {object|null} 標準化済み注文データ
   */
  normalizeOrderRecord(rawOrder) {
    // nullまたはオブジェクト型以外の場合は正規化不能としてnullを返す
    if (!rawOrder || typeof rawOrder !== 'object') {
      return null;
    }

    const customerName = this.normalizeTextField(rawOrder.customerName ?? rawOrder.customer ?? '未設定');
    const email = this.normalizeTextField(rawOrder.email ?? rawOrder.customerEmail ?? rawOrder.mail ?? '未設定');
    const productCode = this.normalizeTextField(rawOrder.productCode ?? rawOrder.items ?? 'UNSPECIFIED').toUpperCase();
    const quantity = this.normalizeQuantity(rawOrder.quantity);
    const totalPrice = this.normalizePrice(rawOrder.totalPrice ?? rawOrder.price);
    const status = this.normalizeStatus(rawOrder.status);
    const timestamp = rawOrder.updatedAt ?? rawOrder.createdAt ?? rawOrder.date ?? new Date().toISOString();

    return {
      id: this.normalizeTextField(rawOrder.id ?? `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
      customerName,
      email,
      productCode,
      quantity,
      totalPrice,
      status,
      createdAt: rawOrder.createdAt ?? timestamp,
      updatedAt: rawOrder.updatedAt ?? timestamp,
    };
  }

  /**
   * テキスト項目を管理画面向けに正規化
   * @private
   * @param {unknown} value - 正規化対象の値
   * @returns {string} 文字列化・サニタイズ済みの値
   */
  normalizeTextField(value) {
    return XSSProtectionAdmin.sanitizeInput(String(value ?? ''));
  }

  /**
   * 数量項目を正規化
   * @private
   * @param {unknown} value - 数量候補
   * @returns {number} 1以上の数量
   */
  normalizeQuantity(value) {
    const quantity = Number.parseInt(String(value ?? ''), 10);
    return Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  }

  /**
   * 金額項目を正規化
   * @private
   * @param {unknown} value - 金額候補
   * @returns {number} 数値化された金額
   */
  normalizePrice(value) {
    // 数値型かつ有限値の場合はそのまま使用する（不要な変換をスキップ）
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    const normalized = String(value ?? '').replace(/[^\d.-]/g, '');
    const price = Number(normalized);
    return Number.isFinite(price) && price >= 0 ? price : 0;
  }

  /**
   * 旧形式を含むステータス値を標準化
   * @private
   * @param {unknown} value - ステータス候補
   * @returns {string} 管理画面で扱う標準ステータス
   */
  normalizeStatus(value) {
    const status = String(value ?? '').trim();
    const statusMap = {
      pending: AdminConstants.ORDER_STATUS.PENDING,
      processing: AdminConstants.ORDER_STATUS.PROCESSING,
      shipped: AdminConstants.ORDER_STATUS.SHIPPED,
      delivered: AdminConstants.ORDER_STATUS.DELIVERED,
      cancelled: AdminConstants.ORDER_STATUS.CANCELLED,
      '受付中': AdminConstants.ORDER_STATUS.PENDING,
      '準備中': AdminConstants.ORDER_STATUS.PROCESSING,
      '処理中': AdminConstants.ORDER_STATUS.PROCESSING,
      '発送済み': AdminConstants.ORDER_STATUS.SHIPPED,
      '配達完了': AdminConstants.ORDER_STATUS.DELIVERED,
      'キャンセル': AdminConstants.ORDER_STATUS.CANCELLED,
    };

    return statusMap[status] || AdminConstants.ORDER_STATUS.PENDING;
  }

  /**
   * this.orders を JSON 化して localStorage に永続化する。
   * @private
   */
  saveOrdersToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    } catch (e) {
      console.error(`[AdminManager] localStorage 保存失敗: ${e.message}`);
    }
  }

  /**
   * バリデーション・サニタイズ後に新規注文を登録し、localStorage に保存する。
   * @param {object} orderData - { customerName, email, productCode, quantity, totalPrice, status }
   * @returns {{ success: boolean, orderId: string|null, message: string }}
   */
  addOrder(orderData) {
    // フィールド別バリデーション（最初のエラーメッセージをそのまま返す）
    if (!orderData || typeof orderData !== 'object') {
      return { success: false, orderId: null, message: '入力値が不正です' };
    }
    const fieldChecks = [
      OrderValidator.isValidCustomerName(orderData.customerName),
      OrderValidator.isValidEmail(orderData.email),
      OrderValidator.isValidProductCode(orderData.productCode),
      OrderValidator.isValidQuantity(orderData.quantity),
      OrderValidator.isValidTotalPrice(orderData.totalPrice),
      OrderValidator.isValidStatus(orderData.status),
    ];
    const firstError = fieldChecks.find(r => !r.valid);
    if (firstError) {
      return { success: false, orderId: null, message: firstError.message };
    }

    // 入力値は必ずサニタイズしてから DB に入れる
    const sanitized = {
      customerName: XSSProtectionAdmin.sanitizeInput(orderData.customerName),
      email:        XSSProtectionAdmin.sanitizeInput(orderData.email),
      productCode:  XSSProtectionAdmin.sanitizeInput(orderData.productCode).toUpperCase(),
      quantity:     Number(orderData.quantity),
      totalPrice:   Number(orderData.totalPrice),
      status:       orderData.status || AdminConstants.ORDER_STATUS.PENDING,
    };

    // Date.now() + 乱数で ID を作る。同時登録が起きても衝突しない程度の籏度
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    const order = {
      id: orderId,
      ...sanitized,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.orders.push(order);
    this.saveOrdersToStorage();

    return {
      success: true,
      orderId: orderId,
      message: AdminConstants.UI_MESSAGES.ORDER_ADDED,
    };
  }

  /**
   * ID で注文を一件取得する。該当なければ undefined を返す。
   * @param {string} orderId
   * @returns {object|undefined}
   */
  getOrderById(orderId) {
    return this.orders.find(o => o.id === orderId);
  }

  /**
   * 全注文の浅いコピーを返す。
   * @returns {object[]}
   */
  getAllOrders() {
    return [...this.orders];
  }

  /**
   * 注文を更新する。主にステータス変更に使用する。
   * @param {string} orderId - 更新対象の注文ID
   * @param {object} updates - 更新内容
   * @returns {{ success: boolean, message: string }}
   */
  editOrder(orderId, updates) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    // 指定 ID の注文が見つからない場合は失敗レスポンスを返す
    if (orderIndex === -1) {
      return { success: false, message: '注文が見つかりません' };
    }

    const updated = {
      ...this.orders[orderIndex],
      customerName: XSSProtectionAdmin.sanitizeInput(updates.customerName),
      email: XSSProtectionAdmin.sanitizeInput(updates.email),
      productCode: XSSProtectionAdmin.sanitizeInput(updates.productCode).toUpperCase(),
      quantity: Number(updates.quantity),
      totalPrice: Number(updates.totalPrice),
      status: updates.status,
    };

    // 更新内容がバリデーションを通過しない場合は失敗レスポンスを返す
    if (!OrderValidator.isValidOrderData(updated)) {
      return { success: false, message: '更新内容が不正です' };
    }

    updated.updatedAt = new Date().toISOString();
    this.orders[orderIndex] = updated;
    this.saveOrdersToStorage();

    return { success: true, message: AdminConstants.UI_MESSAGES.ORDER_UPDATED };
  }

  /**
   * 指定 ID の注文を削除し、localStorage を更新する。
   * @param {string} orderId
   * @returns {{ success: boolean, message: string }}
   */
  deleteOrder(orderId) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    // 指定 ID の注文が見つからない場合は失敗レスポンスを返す
    if (orderIndex === -1) {
      return { success: false, message: '注文が見つかりません' };
    }

    this.orders.splice(orderIndex, 1);
    this.saveOrdersToStorage();

    return { success: true, message: AdminConstants.UI_MESSAGES.ORDER_DELETED };
  }

  /**
   * 指定ステータスの注文配列を返す。
   * @param {string} status
   * @returns {object[]}
   */
  getOrdersByStatus(status) {
    return this.orders.filter(o => o.status === status);
  }

  /**
   * 総注文数・合計売上・ステータス別件数の集計データを返す。
   * @returns {{ totalOrders: number, totalRevenue: number, byStatus: object }}
   */
  getStatistics() {
    const stats = {
      totalOrders: this.orders.length,
      totalRevenue: 0,
      byStatus: {},
    };

    Object.values(AdminConstants.ORDER_STATUS).forEach(status => {
      stats.byStatus[status] = 0;
    });

    this.orders.forEach(order => {
      stats.totalRevenue += order.totalPrice || 0;
      // 定義済みステータスに該当する場合のみステータス別カウントをインクリメントする
      if (stats.byStatus[order.status] !== undefined) {
        stats.byStatus[order.status]++;
      }
    });

    return stats;
  }
}

// クラス説明: EC 注文管理の中核となる CRUD 機能を担当。LocalStorage との責務分離も実施
// 責務: 注文データの生成・保存・更新・削除、バリデーション、統計生成
// 依存: AdminConstants, OrderValidator, XSSProtectionAdmin
