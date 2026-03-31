'use client';

import { useState, useEffect } from 'react';
import type { KidsCafe } from '../../types/index';

export type CafesStatus = 'loading' | 'success' | 'error';

export type CafesState = {
  status: CafesStatus;
  cafes: KidsCafe[];
  districts: string[];
  error: string | null;
};

export function useCafes(): CafesState {
  const [state, setState] = useState<CafesState>({
    status: 'loading',
    cafes: [],
    districts: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/cafes')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`서버 오류: ${res.status}`);
        }
        return res.json() as Promise<{ cafes: KidsCafe[]; districts: string[] }>;
      })
      .then(({ cafes, districts }) => {
        if (!cancelled) {
          setState({ status: 'success', cafes, districts, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
          setState({ status: 'error', cafes: [], error: message, districts: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
