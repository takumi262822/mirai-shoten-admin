import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { CustomerSummary } from '../types/index';

/** 顧客一覧を取得するカスタムフック */
export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<{ customers: CustomerSummary[] }>('/customers')
      .then(res => setCustomers(res.customers))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { customers, loading, error };
}
