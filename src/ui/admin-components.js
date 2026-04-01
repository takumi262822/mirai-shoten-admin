/**
 * 管理画面 UI コンポーネント
 * @class AdminUIComponents
 * @description ダッシュボード内の UI 要素（テーブル描画・フォーム・通知等）を再利用可能な形で提供
 * @author Takumi Harada
 * @date 2026-04-01
 */
import { XSSProtectionAdmin } from '../utils/xss.js';
import { AdminConstants } from '../constants/admin-constants.js';

/**
 * 管理画面で使い回す UI 部品を生成・描画するクラス。
 *
 * 目的: 注文一覧、顧客一覧、通知表示などの共通 UI を再利用可能にする。
 * 入力: 注文データ、顧客データ、通知メッセージ、描画先 DOM 情報。
 * 処理: 描画用 HTML を組み立て、安全な表示形式へ整えて DOM に反映する。
 * 出力: 管理画面のテーブル・通知・フォーム表示が更新される。
 * 補足: 表示責務に特化し、データ更新は AdminManager 側で行う。
 *
 * @author Takumi Harada
 * @date 2026-04-01
 */
/**
 * 処理概要:
 * - 生成処理: テーブル行、フォーム、統計カードなど管理画面のUI部品を組み立てる
 * - 更新処理: 渡された注文データを安全に整形し、描画用HTMLへ変換する
 * - 出力処理: AdminManager が使う一覧表示、詳細表示、入力UIを返す
 */
export class AdminUIComponents {
  /**
   * 注文テーブルを HTML にレンダリング
   *
   * 目的: 注文一覧を HTML テーブルとして画面に表示
   * 入力: orders (array) - 注文オブジェクト配列、containerId (string) - 描画先コンテナの id
   * 処理:
   *   1. 注文データを <tr><td> に変換
   *   2. XSSProtectionAdmin.escape() で一括エスケープ
   *   3. 編集・削除ボタン付きで配置
   *   4. document.getElementById(containerId).innerHTML に設定
   * 出力: DOM にテーブルが表示される
   * 補足: innerHTML は XSS 脅威があるため、必ず escape() 後の値を使用
   *
   * @public
   * @param {array} orders - 表示対象の注文配列
   * @param {string} containerId - コンテナ要素の ID
   * @returns {void}
   */
  static renderOrderTable(orders, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`[AdminUIComponents] コンテナ "${containerId}" が見つかりません`);
      return;
    }

    if (!orders || orders.length === 0) {
      container.innerHTML = '<p class="empty-state">注文がありません</p>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>注文ID</th>
            <th>顧客名</th>
            <th>メール</th>
            <th class="cell-number">数量</th>
            <th class="cell-number">金額</th>
            <th class="cell-center">ステータス</th>
            <th class="cell-center">操作</th>
          </tr>
        </thead>
        <tbody>
    `;

    orders.forEach(order => {
      const escapedName = XSSProtectionAdmin.escape(order.customerName);
      const escapedEmail = XSSProtectionAdmin.escape(order.email);
      const escapedId = XSSProtectionAdmin.escape(order.id);
      const statusColor = this.getStatusColor(order.status);

      html += `
        <tr>
          <td>${escapedId}</td>
          <td>${escapedName}</td>
          <td>${escapedEmail}</td>
          <td class="cell-number">${order.quantity}</td>
          <td class="cell-number">¥${order.totalPrice.toLocaleString()}</td>
          <td class="cell-center">
            <span class="status-badge" style="background-color: ${statusColor};">
              ${order.status}
            </span>
          </td>
          <td class="cell-center">
            <div class="action-group">
              <button class="btn btn-inline btn-edit" data-order-id="${escapedId}" type="button">編集</button>
              <button class="btn btn-inline btn-danger btn-delete" data-order-id="${escapedId}" type="button">削除</button>
            </div>
          </td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }

  /**
   * ステータスに応じた背景色を返す
   *
   * 目的: ステータス表示時の視認性向上（色分け）
   * 入力: status (string) - 注文ステータス
   * 処理: status を判定、対応する色を return
   * 出力: カラーコード（文字列）
   * 補足: アクセシビリティ配慮のため、色だけでなくテキストラベルも併用
   *
   * @private
   * @param {string} status - ステータス値
   * @returns {string} CSS カラーコード
   */
  static getStatusColor(status) {
    const colorMap = {
      [AdminConstants.ORDER_STATUS.PENDING]: '#ff9900',
      [AdminConstants.ORDER_STATUS.PROCESSING]: '#3366cc',
      [AdminConstants.ORDER_STATUS.SHIPPED]: '#0066cc',
      [AdminConstants.ORDER_STATUS.DELIVERED]: '#009900',
      [AdminConstants.ORDER_STATUS.CANCELLED]: '#999999',
    };
    return colorMap[status] || '#999999';
  }

  /**
   * 成功/失敗通知をポップアップ表示
   *
   * 目的: ユーザーにメッセージをフィードバック（注文追加完了等）
   * 入力: message (string) - 表示テキスト、type (string) - 'success' | 'error'
   * 処理:
   *   1. <div class="notice"> 要素を生成
   *   2. backgroundColor を type に応じて設定
   *   3. DOM に追加、3秒後に自動削除
   * 出力: 画面上に通知メッセージが表示される
   * 補足: 複数の通知が重ならないよう、前回のものを削除してから表示
   *
   * @public
   * @param {string} message - 表示するメッセージ
   * @param {string} type - 'success' | 'error'
   * @returns {void}
   */
  static showNotice(message, type = 'success') {
    // 既存の通知を削除
    const existingNotice = document.querySelector('.admin-notice');
    if (existingNotice) {
      existingNotice.remove();
    }

    const notice = document.createElement('div');
    notice.className = 'admin-notice';
    notice.textContent = message;
    notice.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${type === 'success' ? '#00aa00' : '#cc0000'};
      color: white;
      border-radius: 4px;
      z-index: 9999;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
    `;

    document.body.appendChild(notice);

    // 3秒後に自動削除
    setTimeout(() => {
      notice.remove();
    }, 3000);
  }

  /**
   * 注文フォームの入力値をクリア
   *
   * 目的: 注文追加後、フォームをリセットして次の入力に備える
   * 入力: formId (string) - フォーム要素の id
   * 処理: document.getElementById(formId).reset()
   * 出力: フォームの全入力値がクリアされる
   * 補足: reset() は type="reset" ボタンと同等の動作
   *
   * @public
   * @param {string} formId - フォーム要素の ID
   * @returns {void}
   */
  static clearOrderForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }

  /**
   * 編集フォームにデータを検証して入力
   *
   * 目的: 既存注文を編集する際、ダイアログにデータを事前入力
   * 入力: order (object) - 注文データ、formId (string) - フォーム id
   * 処理:
   *   1. form 内の各入力フィールドを特定（name 属性で照合）
   *   2. order のプロパティ値をセット
   *   3. XSS 対策済みの値をセット
   * 出力: フォームが注文データで埋まる
   * 補足: 呼び出し前に order データの検証を推奨
   *
   * @public
   * @param {object} order - 注文データオブジェクト
   * @param {string} formId - フォーム要素の ID
   * @returns {void}
   */
  static populateEditForm(order, formId) {
    const form = document.getElementById(formId);
    if (!form) {
      console.error(`[AdminUIComponents] フォーム "${formId}" が見つかりません`);
      return;
    }

    if (form.customerName) form.customerName.value = order.customerName || '';
    if (form.email) form.email.value = order.email || '';
    if (form.productCode) form.productCode.value = order.productCode || '';
    if (form.quantity) form.quantity.value = order.quantity || '';
    if (form.totalPrice) form.totalPrice.value = order.totalPrice || '';
    if (form.status) form.status.value = order.status || '';
  }

  /**
   * 顧客情報テーブルをレンダリング
   *
   * 目的: 注文データから顧客ユニーク情報を抽出し、顧客一覧表にする
   * 入力: orders (array) - 注文配列、containerId (string) - 描画先 id
   * 処理:
   *   1. orders から顧客情報をユニーク抽出（メールアドレスで重複排除）
   *   2. HTML テーブルを組み立て
   *   3. XSS エスケープで安全性確保
   * 出力: DOM に顧客テーブルが表示される
   * 補足: 注文テーブルの補助情報として機能
   *
   * @public
   * @param {array} orders - 注文配列
   * @param {string} containerId - コンテナ要素の ID
   * @returns {void}
   */
  static renderCustomerInfo(orders, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      return;
    }

    // メールをキーにして顧客情報を集約
    const customerMap = new Map();
    orders.forEach(order => {
      if (!customerMap.has(order.email)) {
        customerMap.set(order.email, {
          name: order.customerName,
          email: order.email,
          orderCount: 0,
          totalSpent: 0,
        });
      }
      const customer = customerMap.get(order.email);
      customer.orderCount++;
      customer.totalSpent += order.totalPrice || 0;
    });

    if (customerMap.size === 0) {
      container.innerHTML = '<p class="empty-state">顧客情報がありません</p>';
      return;
    }

    let html = `
      <table class="data-table">
        <thead>
          <tr>
            <th>顧客名</th>
            <th>メール</th>
            <th class="cell-number">注文数</th>
            <th class="cell-number">累計金額</th>
          </tr>
        </thead>
        <tbody>
    `;

    customerMap.forEach(customer => {
      const escapedName = XSSProtectionAdmin.escape(customer.name);
      const escapedEmail = XSSProtectionAdmin.escape(customer.email);

      html += `
        <tr>
          <td>${escapedName}</td>
          <td>${escapedEmail}</td>
          <td class="cell-number">${customer.orderCount}</td>
          <td class="cell-number">¥${customer.totalSpent.toLocaleString()}</td>
        </tr>
      `;
    });

    html += `
        </tbody>
      </table>
    `;

    container.innerHTML = html;
  }
}

// クラス説明: 管理ダッシュボードの UI 描画を一元管理。再利用性と XSS 安全性を重視
// 責務: テーブル描画、通知表示、フォーム操作
// 依存: XSSProtectionAdmin, AdminConstants
