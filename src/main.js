/**
 * 管理ダッシュボード初期化エントリー
 * @file src/main.js
 * @author Takumi Harada
 * @date 2026-04-01
 */
import { AdminManager } from './core/admin-manager.js';
import { AdminUIComponents } from './ui/admin-components.js';
import { AdminStyleManager } from './styles/admin-style.js';
import { AdminConstants } from './constants/admin-constants.js';

const adminManager = AdminManager.getInstance();
const styleManager = new AdminStyleManager();

const orderForm = document.getElementById('orderForm');
const submitButton = document.getElementById('submitOrderButton');
const cancelEditButton = document.getElementById('cancelEditButton');
const themeToggleButton = document.getElementById('themeToggle');

let editingOrderId = null;

function getThemeToggleLabel(theme) {
  return theme === AdminConstants.THEME.DARK
    ? '☀️ ライトモード'
    : '🌙 ダークモード';
}

function syncThemeButtonLabel() {
  themeToggleButton.textContent = getThemeToggleLabel(styleManager.currentTheme);
}

function resetFormState() {
  editingOrderId = null;
  submitButton.textContent = '✅ 注文を追加';
  cancelEditButton.classList.add('is-hidden');
  AdminUIComponents.clearOrderForm('orderForm');
}

function collectFormData() {
  return {
    customerName: document.getElementById('customerName').value,
    email: document.getElementById('email').value,
    productCode: document.getElementById('productCode').value,
    quantity: Number(document.getElementById('quantity').value),
    totalPrice: Number(document.getElementById('totalPrice').value),
    status: document.getElementById('status').value,
  };
}

function beginEdit(orderId) {
  const order = adminManager.getOrderById(orderId);
  if (!order) {
    AdminUIComponents.showNotice('編集対象の注文が見つかりません', 'error');
    return;
  }

  editingOrderId = orderId;
  submitButton.textContent = '💾 注文を更新';
  cancelEditButton.classList.remove('is-hidden');
  AdminUIComponents.populateEditForm(order, 'orderForm');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function attachTableEventListeners(updateDashboard) {
  document.querySelectorAll('.btn-delete').forEach((button) => {
    button.addEventListener('click', (event) => {
      const orderId = event.currentTarget.dataset.orderId;
      if (!window.confirm(AdminConstants.UI_MESSAGES.CONFIRM_DELETE)) {
        return;
      }

      const result = adminManager.deleteOrder(orderId);
      AdminUIComponents.showNotice(result.message, result.success ? 'success' : 'error');
      if (result.success && editingOrderId === orderId) {
        resetFormState();
      }
      updateDashboard();
    });
  });

  document.querySelectorAll('.btn-edit').forEach((button) => {
    button.addEventListener('click', (event) => {
      beginEdit(event.currentTarget.dataset.orderId);
    });
  });
}

function updateDashboard() {
  const orders = adminManager.getAllOrders();
  const stats = adminManager.getStatistics();

  document.getElementById('totalOrders').textContent = stats.totalOrders;
  document.getElementById('totalRevenue').textContent = `¥${stats.totalRevenue.toLocaleString()}`;
  document.getElementById('processingCount').textContent = stats.byStatus.processing || 0;
  document.getElementById('deliveredCount').textContent = stats.byStatus.delivered || 0;

  AdminUIComponents.renderOrderTable(orders, 'orderTableContainer');
  AdminUIComponents.renderCustomerInfo(orders, 'customerTableContainer');
  attachTableEventListeners(updateDashboard);
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formData = collectFormData();
  const result = editingOrderId
    ? adminManager.editOrder(editingOrderId, formData)
    : adminManager.addOrder(formData);

  if (!result.success) {
    AdminUIComponents.showNotice(result.message || '入力値を確認してください', 'error');
    return;
  }

  AdminUIComponents.showNotice(result.message, 'success');
  resetFormState();
  updateDashboard();
}

function initializeDashboard() {
  styleManager.initTheme();
  styleManager.applyResponsiveCSS();
  styleManager.initHeaderScrollState();
  syncThemeButtonLabel();

  orderForm.addEventListener('submit', handleFormSubmit);
  cancelEditButton.addEventListener('click', resetFormState);
  themeToggleButton.addEventListener('click', () => {
    styleManager.toggleDarkMode();
    syncThemeButtonLabel();
  });

  updateDashboard();
}

initializeDashboard();
