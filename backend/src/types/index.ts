// 注文ステータスの型
export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
];

// 注文明細の型
export interface OrderItem {
  id?: string;
  order_id?: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

// 注文（DBレコード）の型
export interface Order {
  id?: string;
  customer_name: string;
  customer_kana?: string;
  email: string;
  tel?: string;
  zip?: string;
  address?: string;
  total_price: number;
  status: OrderStatus;
  created_at?: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

// 注文一覧フィルターの型
export interface OrderFilter {
  status?: OrderStatus;
  page: number;
  limit: number;
  sort: 'createdAt_desc' | 'createdAt_asc';
}

// JWT ペイロードの型
export interface AuthPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

// Express Request に user を追加する型拡張
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}
