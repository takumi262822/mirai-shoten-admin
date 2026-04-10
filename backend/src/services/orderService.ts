import { supabase } from '../db/supabase';
import { Order, OrderFilter, OrderItem } from '../types';

/**
 * 注文一覧を取得する（フィルター・ページネーション対応）。
 */
export async function findAll(filter: OrderFilter): Promise<{ orders: Order[]; total: number }> {
  const { page, limit, status, sort } = filter;
  const offset = (page - 1) * limit;
  const ascending = sort === 'createdAt_asc';

  let query = supabase
    .from('orders')
    .select('*, order_items(*)', { count: 'exact' })
    .order('created_at', { ascending })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return { orders: (data as Order[]) ?? [], total: count ?? 0 };
}

/**
 * 注文1件を ID で取得する。
 */
export async function findById(id: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Order;
}

/**
 * 新規注文を登録する。
 */
export async function create(
  orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>,
): Promise<Order> {
  const { items, ...header } = orderData as Order & { items?: OrderItem[] };

  // 注文ヘッダーを挿入
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert(header)
    .select()
    .single();

  if (orderError || !order) throw new Error(orderError?.message ?? '注文の登録に失敗しました');

  // 注文明細を挿入
  if (items && items.length > 0) {
    const itemRows = items.map((item: OrderItem) => ({
      order_id: order.id,
      product_code: item.product_code,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemRows);
    if (itemsError) throw new Error(itemsError.message);
  }

  return findById(order.id) as Promise<Order>;
}

/**
 * 注文を更新する。
 */
export async function update(
  id: string,
  orderData: Partial<Order>,
): Promise<Order | null> {
  const { order_items: _, ...header } = orderData as Order;

  const { error } = await supabase
    .from('orders')
    .update(header)
    .eq('id', id);

  if (error) throw new Error(error.message);

  return findById(id);
}

/**
 * 注文を削除する（order_items は ON DELETE CASCADE で自動削除）。
 */
export async function remove(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
