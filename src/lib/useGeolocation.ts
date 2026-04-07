'use client';

import { useState, useCallback } from 'react';

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error' | 'unsupported';

export type GeolocationPosition = {
  lat: number;
  lng: number;
};

export type GeolocationState = {
  status: GeolocationStatus;
  position: GeolocationPosition | null;
  error: string | null;
};

export type GeolocationResult = GeolocationState & {
  requestPermission: () => void;
};

function getInitialStatus(): GeolocationStatus {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }
  return 'idle';
}

export function useGeolocation(): GeolocationResult {
  const [state, setState] = useState<GeolocationState>(() => ({
    status: getInitialStatus(),
    position: null,
    error: null,
  }));

  const requestPermission = useCallback(() => {
    if (!navigator.geolocation) return;

    setState((s) => ({ ...s, status: 'loading' }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState({
          status: 'granted',
          position: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          error: null,
        });
      },
      (err) => {
        const status: GeolocationStatus = err.code === 1 ? 'denied' : 'error';
        setState({ status, position: null, error: err.message });
      },
    );
  }, []);

  return { ...state, requestPermission };
}
