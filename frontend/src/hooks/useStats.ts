import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { Stats } from '../types/index';

/** ダッシュボード統計を取得するカスタムフック */
export function useStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Stats>('/api/stats')
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
