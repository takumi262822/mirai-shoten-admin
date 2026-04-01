/**
 * 注文データ管理（CRUD）
 * @class AdminManager
 * @description LocalStorage を媒介として、注文の追加・編集・削除・取得を統括管理
 * @author Takumi Harada
 * @date 2026-04-01
 */
import { AdminConstants } from '../constants/admin-constants.js';
import { OrderValidator } from '../utils/order-validator.js';
import { XSSProtectionAdmin } from '../utils/xss.js';

/**
 * 管理画面で扱う注文データを一元管理するクラス。
 *
 * 目的: 注文データの追加・更新・削除・取得と永続化を統括する。
 * 入力: フォーム入力値、既存の localStorage 注文データ。
 * 処理: バリデーション、サニタイズ、標準形式への正規化、保存処理を行う。
 * 出力: 管理画面で扱える標準化済み注文データと更新結果を返す。
 * 補足: LocalStorage を永続化先とするシングルトン前提の管理クラス。
 *
 * @author Takumi Harada
 * @date 2026-04-01
 */
/**
 * 処理概要:
 * - 初期化処理: localStorage から注文一覧を読み込み、管理画面の初期状態を構築する
 * - 進行処理: 注文の追加、編集、削除、検索、並び替え、統計更新を統括する
 * - 出力処理: 正規化済みデータを UI コンポーネントへ渡し、画面表示と保存内容を同期する
 */
export class AdminManager {
  /**
   * コンストラクタ
   *
   * 目的: AdminManager インスタンスを初期化
   * 入力: なし
   * 処理: 内部キャッシュ orders を空配列で初期化、LocalStorage から既存データを読込
   * 出力: AdminManager インスタンス
   * 補足: getInstance() static メソッドで Singleton 化を奨励
   */
  constructor() {
    this.orders = [];
    this.storageKey = AdminConstants.STORAGE_KEYS.ADMIN_ORDERS;
    this.loadOrdersFromStorage();
  }

  /**
   * Singleton インスタンス取得
   *
   * 目的: AdminManager の単一インスタンスを返す
   * 入力: なし
   * 処理: 静的フィールド _instance を確認。なければ生成、あれば再利用
   * 出力: AdminManager インスタンス（全体で1つのみ）
   * 補足: グローバルスコープ汚染を防ぐため Singleton パターン採用
   *
   * @returns {AdminManager} シングルトンインスタンス
   */
  static getInstance() {
    if (!AdminManager._instance) {
      AdminManager._instance = new AdminManager();
    }
    return AdminManager._instance;
  }

  /**
   * LocalStorage から注文データを読込
   *
   * 目的: アプリケーション起動時に前回保存されたデータを復元
   * 入力: なし（LocalStorage[adminOrders] から自動読込）
   * 処理: JSON.parse() で文字列をオブジェクト配列に変換、エラー時は空配列
   * 出力: this.orders に格納
   * 補足: 読込失敗時は警告をコンソール出力、処理は継続
   *
   * @private
   * @returns {void}
   */
  loadOrdersFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const parsed = data ? JSON.parse(data) : [];
      this.orders = Array.isArray(parsed)
        ? parsed.map((order) => this.normalizeOrderRecord(order)).filter(Boolean)
        : [];
    } catch (e) {
      console.warn(`[AdminManager] LocalStorage 読込失敗: ${e.message}`);
      this.orders = [];
    }
  }

  /**
   * 旧保存形式を含む注文データを管理画面用の標準形式へ正規化
   *
   * 目的: 既存の localStorage データも新管理画面で扱える形に統一
   * 入力: rawOrder (object) - 新旧どちらかの注文オブジェクト
   * 処理: 顧客名・金額・ステータスなどのキーを吸収して標準形式へ変換
   * 出力: 標準化された注文オブジェクト
   * 補足: 未来商店商材の旧 `customer / price / date` 形式にも対応
   *
   * @private
   * @param {object} rawOrder - 正規化対象の注文データ
   * @returns {object|null} 標準化済み注文データ
   */
  normalizeOrderRecord(rawOrder) {
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
   * LocalStorage へ注文データを保存
   *
   * 目的: メモリ内の this.orders を永続化
   * 入力: なし（this.orders を自動 serialize）
   * 処理: JSON.stringify() で配列を文字列化、localStorage に設定
   * 出力: LocalStorage[adminOrders] が更新される
   * 補足: 保存失敗時はコンソール警告、UI 表示は行わない（ユーザー混乱防止）
   *
   * @private
   * @returns {void}
   */
  saveOrdersToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.orders));
    } catch (e) {
      console.error(`[AdminManager] localStorage 保存失敗: ${e.message}`);
    }
  }

  /**
   * 新規注文を追加
   *
   * 目的: バリデーション後、新規注文をシステムに登録
   * 入力: orderData (object) - { customerName, email, productCode, quantity, totalPrice, status }
   * 処理:
   *   1. OrderValidator.isValidOrderData() で妥当性確認
   *   2. XSSProtectionAdmin.sanitizeInput() で各フィールドをサニタイズ
   *   3. UUID 形式で order.id を自動生成
   *   4. this.orders.push() で メモリに追加
   *   5. saveOrdersToStorage() で 永続化
   * 出力: { success: boolean, orderId: string | null, message: string }
   * 補足: id は "ORD-{timestamp}-{random}" 形式
   *
   * @param {object} orderData - 新規注文データ
   * @returns {object} { success: boolean, orderId: string, message: string }
   */
  addOrder(orderData) {
    // バリデーション
    if (!OrderValidator.isValidOrderData(orderData)) {
      return { success: false, orderId: null, message: '入力値が不正です' };
    }

    // サニタイズ
    const sanitized = {
      customerName: XSSProtectionAdmin.sanitizeInput(orderData.customerName),
      email: XSSProtectionAdmin.sanitizeInput(orderData.email),
      productCode: XSSProtectionAdmin.sanitizeInput(orderData.productCode).toUpperCase(),
      quantity: Number(orderData.quantity),
      totalPrice: Number(orderData.totalPrice),
      status: orderData.status || AdminConstants.ORDER_STATUS.PENDING,
    };

    // ID 自動生成
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
   * 既存注文をID指定で取得
   *
   * 目的: 特定の注文データを取得（編集フォーム表示等に利用）
   * 入力: orderId (string) - 対象注文の ID
   * 処理: this.orders.find(o => o.id === orderId)
   * 出力: 注文オブジェクト | undefined
   * 補足: 見つからない場合は undefined を返す（呼び出し側で null チェック必須）
   *
   * @param {string} orderId - 検索対象の注文ID
   * @returns {object|undefined} 注文オブジェクト
   */
  getOrderById(orderId) {
    return this.orders.find(o => o.id === orderId);
  }

  /**
   * 全注文を取得
   *
   * 目的: ダッシュボード一覧表示用に全注文データを提供
   * 入力: なし
   * 処理: this.orders を返す（実装上は浅いコピーを推奨）
   * 出力: 注文オブジェクト配列
   * 補足: 配列は副作用で this.orders が変更されないよう注意
   *
   * @returns {array} 全注文配列
   */
  getAllOrders() {
    return [...this.orders];
  }

  /**
   * 注文データを更新
   *
   * 目的: 既存注文の内容を変更（主にステータス更新）
   * 入力: orderId (string) - 対象注文ID、updates (object) - 更新内容
   * 処理:
   *   1. getOrderById() で既存注文を検索
   *   2. OrderValidator.isValidOrderData() で新データをチェック
   *   3. 更新内容をマージ、updatedAt を現在時刻に更新
   *   4. saveOrdersToStorage() で保存
   * 出力: { success: boolean, message: string }
   * 補足: 存在しない orderId の場合は失敗を返す
   *
   * @param {string} orderId - 更新対象の注文ID
   * @param {object} updates - 更新内容
   * @returns {object} { success: boolean, message: string }
   */
  editOrder(orderId, updates) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
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

    // バリデーション
    if (!OrderValidator.isValidOrderData(updated)) {
      return { success: false, message: '更新内容が不正です' };
    }

    updated.updatedAt = new Date().toISOString();
    this.orders[orderIndex] = updated;
    this.saveOrdersToStorage();

    return { success: true, message: AdminConstants.UI_MESSAGES.ORDER_UPDATED };
  }

  /**
   * 注文をIDで削除
   *
   * 目的: 特定の注文をシステムから削除
   * 入力: orderId (string) - 削除対象の注文ID
   * 処理:
   *   1. 注文ID に該当するインデックスを特定
   *   2. splice() で配列から削除
   *   3. saveOrdersToStorage() で永続化
   * 出力: { success: boolean, message: string }
   * 補足: 削除後の undo 機能は実装しない（ログ機能で対応）
   *
   * @param {string} orderId - 削除対象の注文ID
   * @returns {object} { success: boolean, message: string }
   */
  deleteOrder(orderId) {
    const orderIndex = this.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return { success: false, message: '注文が見つかりません' };
    }

    this.orders.splice(orderIndex, 1);
    this.saveOrdersToStorage();

    return { success: true, message: AdminConstants.UI_MESSAGES.ORDER_DELETED };
  }

  /**
   * ステータスで注文をフィルタリング
   *
   * 目的: 特定のステータスの注文だけを取得（集計・リポート生成等）
   * 入力: status (string) - フォルタ対象のステータス
   * 処理: this.orders.filter(o => o.status === status)
   * 出力: マッチした注文配列
   * 補足: マッチするものがなければ空配列を返す
   *
   * @param {string} status - フィルタ対象のステータス
   * @returns {array} マッチした注文配列
   */
  getOrdersByStatus(status) {
    return this.orders.filter(o => o.status === status);
  }

  /**
   * 注文統計を取得（売上合計等）
   *
   * 目的: ダッシュボード統計表示用に集計データを提供
   * 入力: なし
   * 処理:
   *   - 総注文数
   *   - 合計売上（totalPrice の sum）
   *   - ステータス別カウント
   * 出力: 統計オブジェクト { totalOrders, totalRevenue, byStatus: {...} }
   * 補足: 空の orders の場合は 0 を返す
   *
   * @returns {object} 統計情報オブジェクト
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
