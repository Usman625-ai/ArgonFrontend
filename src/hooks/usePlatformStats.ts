import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { ApiResponse, PlatformStats } from '../types';

const FALLBACK: PlatformStats = {
  verifiedSellers: 0,
  totalCustomers: 0,
  totalProducts: 0,
  averageRating: null,
};

/**
 * Real, live counts for the "Verified sellers / Happy customers / Products
 * listed / Satisfaction rate" stat rows on the landing and About pages.
 * Backed by GET /api/public/stats — no more hardcoded numbers.
 */
export default function usePlatformStats() {
  const [stats, setStats] = useState<PlatformStats>(FALLBACK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get<ApiResponse<PlatformStats>>('/api/public/stats', { skipLoadingIndicator: true })
      .then((res) => { if (!cancelled) setStats(res.data.data); })
      .catch(() => { /* keep the zeroed fallback rather than showing an error on a public marketing page */ })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { stats, loading };
}