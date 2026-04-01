import type { KidsCafe, AgeFilter } from './index';

export interface KakaoMapProps {
  kidsCafes: KidsCafe[];
  selectedKidsCafeId?: string;
  selectedAges: AgeFilter[];
  onMarkerClick: (id: string) => void;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
}

export interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  setLevel: (level: number) => void;
}

export interface KakaoMarkerImage {}

export interface KakaoSize {
  width: number;
  height: number;
}

export interface KakaoPoint {
  x: number;
  y: number;
}

export interface KakaoMarker {
  setMap: (map: KakaoMapInstance | null) => void;
  setZIndex: (zIndex: number) => void;
  setImage: (image: KakaoMarkerImage) => void;
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
          image?: KakaoMarkerImage;
        }) => KakaoMarker;
        MarkerImage: new (
          src: string,
          size: KakaoSize,
          options?: { offset?: KakaoPoint }
        ) => KakaoMarkerImage;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        event: {
          addListener: (target: KakaoMarker, type: string, handler: () => void) => void;
        };
      };
    };
  }
}
