/**
 * 管理画面の UI 描画ユーティリティ。
 * @author Takumi Harada
 * @date 2026/3/31
 */
import { XSSProtectionAdmin } from '../utils/xss.js';
import { AdminConstants } from '../constants/admin-constants.js';

/**
 * テーブル描画・通知・フォーム操作など、管理ダッシュボードの UI 部品を提供するクラス。
 * 描画責務に集中し、データ操作は AdminManager に委譲する。
 *
 * @author Takumi Harada
 */
export class AdminUIComponents {
  /**
   * 注文配列を HTML テーブルとしてコンテナ要素に描画する。
   * 表示値は XSSProtectionAdmin.escape() でエスケープ済み。
   *
   * @param {Array} orders - 表示対象の注文配列
   * @param {string} containerId - 描画先コンテナの ID
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
   * ステータス値に対応する背景色コードを返す。
   * テキストラベルと併用してアクセシビリティを確保する。
   *
   * @param {string} status - 注文ステータス値
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
   * 成功/失敗通知を画面右上にポップアップ表示し、3秒後に自動消去する。
   *
   * @param {string} message - 表示するメッセージ
   * @param {string} [type='success'] - 'success' | 'error'
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
   * 指定フォームの入力値を全てリセットする。
   *
   * @param {string} formId - フォーム要素の ID
   */
  static clearOrderForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
      form.reset();
    }
  }

  /**
   * 注文データをフォームに事前入力する（編集モード用）。
   *
   * @param {object} order - 注文データオブジェクト
   * @param {string} formId - フォーム要素の ID
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
   * 注文データから顧客情報をメールで一意に集約し、顧客一覧テーブルを描画する。
   *
   * @param {Array} orders - 注文配列
   * @param {string} containerId - 描画先コンテナの ID
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


