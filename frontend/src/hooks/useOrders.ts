import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../utils/api';
import { OrderListResponse, OrderStatus } from '../types/index';

interface UseOrdersOptions {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

/** 注文一覧を取得するカスタムフック */
export function useOrders(options: UseOrdersOptions = {}) {
  const { status, page = 1, limit = 20 } = options;

  const [data, setData] = useState<OrderListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (status) params.set('status', status);

      const result = await apiFetch<OrderListResponse>(`/api/orders?${params}`);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [status, page, limit]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return { orders: data?.orders ?? [], total: data?.total ?? 0, loading, error, refetch: fetchOrders };
}
