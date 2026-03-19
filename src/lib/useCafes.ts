'use client';

import { useState, useEffect } from 'react';
import type { KidsCafe } from '../../types/index';

export type CafesStatus = 'loading' | 'success' | 'error';

export type CafesState = {
  status: CafesStatus;
  cafes: KidsCafe[];
  error: string | null;
};

export function useCafes(): CafesState {
  const [state, setState] = useState<CafesState>({
    status: 'loading',
    cafes: [],
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetch('/api/cafes')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`서버 오류: ${res.status}`);
        }
        return res.json() as Promise<KidsCafe[]>;
      })
      .then((cafes) => {
        if (!cancelled) {
          setState({ status: 'success', cafes, error: null });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
          setState({ status: 'error', cafes: [], error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
