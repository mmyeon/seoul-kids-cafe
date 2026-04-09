'use client';

import { useState, useEffect } from 'react';
import type { KidsCafe } from '../../types/index';

function resolveErrorMessage(status: number, serverMessage?: string): string {
  if (status >= 500) return serverMessage ?? '서울시 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.';
  if (status === 429) return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.';
  return serverMessage ?? '데이터를 불러오지 못했습니다.';
}

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
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => null) as { error?: string } | null;
          const message = resolveErrorMessage(res.status, body?.error);
          throw new Error(message);
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
