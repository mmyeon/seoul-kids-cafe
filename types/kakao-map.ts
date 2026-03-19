import type { KidsCafe } from './index';

export interface KakaoMapProps {
  kidsCafes: KidsCafe[];
  selectedKidsCafeId?: string;
  onMarkerClick: (id: string) => void;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
}

export interface KakaoMarker {
  setMap: (map: KakaoMapInstance | null) => void;
  setZIndex: (zIndex: number) => void;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (
          container: HTMLElement,
          options: { center: KakaoLatLng; level: number }
        ) => KakaoMapInstance;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: {
          position: KakaoLatLng;
          map?: KakaoMapInstance;
          zIndex?: number;
        }) => KakaoMarker;
        event: {
          addListener: (target: KakaoMarker, type: string, handler: () => void) => void;
        };
      };
    };
  }
}
