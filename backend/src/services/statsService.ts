import { supabase } from '../db/supabase';

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

/**
 * ダッシュボード用の統計情報を集計して返す。
 */
export async function getStats(): Promise<Stats> {
  const { data, error } = await supabase
    .from('orders')
    .select('status, total_price');

  if (error) throw new Error(error.message);

  const orders = data ?? [];

  const result: Stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.total_price ?? 0), 0),
    byStatus: {
      pending: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    },
  };

  for (const order of orders) {
    const s = order.status as keyof Stats['byStatus'];
    if (s in result.byStatus) {
      result.byStatus[s]++;
    }
  }

  return result;
}

export interface CustomerSummary {
  customer_name: string;
  email: string;
  orderCount: number;
  totalSpent: number;
}

/**
 * 注文データを email でグループ化した顧客一覧を返す。
 */
export async function getCustomers(): Promise<CustomerSummary[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('customer_name, email, total_price')
    .order('email');

  if (error) throw new Error(error.message);

  const map = new Map<string, CustomerSummary>();

  for (const row of data ?? []) {
    const existing = map.get(row.email);
    if (existing) {
      existing.orderCount++;
      existing.totalSpent += row.total_price ?? 0;
    } else {
      map.set(row.email, {
        customer_name: row.customer_name,
        email: row.email,
        orderCount: 1,
        totalSpent: row.total_price ?? 0,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
}
