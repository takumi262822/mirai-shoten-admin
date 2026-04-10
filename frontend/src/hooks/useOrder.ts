import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Order } from '../types';

/** 注文詳細を取得するカスタムフック */
export function useOrder(id: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    apiFetch<Order>(`/api/orders/${id}`)
      .then(setOrder)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  return { order, loading, error };
}
