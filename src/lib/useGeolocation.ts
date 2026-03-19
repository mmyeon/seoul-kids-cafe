'use client';

import { useState, useEffect } from 'react';

export type GeolocationStatus = 'loading' | 'granted' | 'denied' | 'error' | 'unsupported';

export type GeolocationPosition = {
  lat: number;
  lng: number;
};

export type GeolocationState = {
  status: GeolocationStatus;
  position: GeolocationPosition | null;
  error: string | null;
};

function getInitialStatus(): GeolocationStatus {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return 'unsupported';
  }
  return 'loading';
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>(() => ({
    status: getInitialStatus(),
    position: null,
    error: null,
  }));

  useEffect(() => {
    if (!navigator.geolocation) return;

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

  return state;
}
