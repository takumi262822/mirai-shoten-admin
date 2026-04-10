// 注文ステータスの型
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

// 注文明細の型
export interface OrderItem {
  id?: string;
  order_id?: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

// 注文の型
export interface Order {
  id: string;
  customer_name: string;
  customer_kana?: string;
  email: string;
  tel?: string;
  zip?: string;
  address?: string;
  total_price: number;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// 注文一覧レスポンスの型
export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

// 注文フォームの入力型（新規 / 編集）
export interface OrderFormData {
  customer_name: string;
  customer_kana: string;
  email: string;
  tel: string;
  zip: string;
  address: string;
  total_price: string;
  status: OrderStatus;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  product_code: string;
  product_name: string;
  quantity: string;
  unit_price: string;
}

// 顧客一覧の型
export interface CustomerSummary {
  customer_name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

// 統計の型
export interface Stats {
  totalOrders: number;
  totalRevenue: number;
  byStatus: {
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

// ステータスの日本語ラベルマップ
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '受付中',
  processing: '処理中',
  shipped: '発送済み',
  delivered: '配達完了',
  cancelled: 'キャンセル',
};

// ステータスの色マップ（CSS クラス名用）
export const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'status--pending',
  processing: 'status--processing',
  shipped: 'status--shipped',
  delivered: 'status--delivered',
  cancelled: 'status--cancelled',
};
