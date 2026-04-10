import type { KidsCafe, AgeFilter } from './index';

export interface KakaoMapProps {
  kidsCafes: KidsCafe[];
  selectedKidsCafeId?: string;
  selectedAges: AgeFilter[];
  onMarkerClick: (id: string) => void;
}

export interface KakaoCoords {
  getX: () => number;
  getY: () => number;
  equals: (coords: KakaoCoords) => boolean;
  toString: () => string;
}

export interface KakaoLatLng {
  getLat: () => number;
  getLng: () => number;
  equals: (latlng: KakaoLatLng) => boolean;
  toString: () => string;
  toCoords: () => KakaoCoords;
}

export type KakaoMapTypeId = 'ROADMAP' | 'SKYVIEW' | 'HYBRID';

export interface KakaoMapOptions {
  center: KakaoLatLng;
  level?: number;
  mapTypeId?: KakaoMapTypeId;
  draggable?: boolean;
  zoomable?: boolean;
}

export interface KakaoMapInstance {
  setCenter: (latlng: KakaoLatLng) => void;
  getCenter: () => KakaoLatLng;
  setLevel: (level: number) => void;
  getLevel: () => number;
  panTo: (latlng: KakaoLatLng) => void;
  setDraggable: (draggable: boolean) => void;
  setZoomable: (zoomable: boolean) => void;
  setMapTypeId: (mapTypeId: KakaoMapTypeId) => void;
  getMapTypeId: () => KakaoMapTypeId;
  relayout: () => void;
}

export interface KakaoSize {
  equals: (size: KakaoSize) => boolean;
  toString: () => string;
}

export interface KakaoPoint {
  equals: (point: KakaoPoint) => boolean;
  toString: () => string;
}

export interface KakaoMarkerImageOptions {
  offset?: KakaoPoint;
  alt?: string;
  shape?: 'poly' | 'rect' | 'circle';
  coords?: string;
  spriteOrigin?: KakaoPoint;
  spriteSize?: KakaoSize;
}

export interface KakaoMarkerImage {
  getOffset: () => KakaoPoint;
  getSize: () => KakaoSize;
  getAlt: () => string;
  setAlt: (alt: string) => void;
  getSpriteOrigin: () => KakaoPoint;
  getSpriteSize: () => KakaoSize;
}

export interface KakaoMarkerOptions {
  position: KakaoLatLng;
  map?: KakaoMapInstance;
  image?: KakaoMarkerImage;
  title?: string;
  draggable?: boolean;
  clickable?: boolean;
  zIndex?: number;
  opacity?: number;
  altitude?: number;
  range?: number;
}

export interface KakaoMarker {
  setMap: (map: KakaoMapInstance | null) => void;
  getMap: () => KakaoMapInstance | null;
  setPosition: (latlng: KakaoLatLng) => void;
  getPosition: () => KakaoLatLng;
  setImage: (image: KakaoMarkerImage) => void;
  getImage: () => KakaoMarkerImage;
  setZIndex: (zIndex: number) => void;
  getZIndex: () => number;
  setTitle: (title: string) => void;
  getTitle: () => string;
  setOpacity: (opacity: number) => void;
  getOpacity: () => number;
  setVisible: (visible: boolean) => void;
  getVisible: () => boolean;
  setDraggable: (draggable: boolean) => void;
  getDraggable: () => boolean;
  setClickable: (clickable: boolean) => void;
  getClickable: () => boolean;
  setAltitude: (altitude: number) => void;
  getAltitude: () => number;
  setRange: (range: number) => void;
  getRange: () => number;
}

declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void;
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMapInstance;
        LatLng: new (lat: number, lng: number) => KakaoLatLng;
        Marker: new (options: KakaoMarkerOptions) => KakaoMarker;
        MarkerImage: new (
          src: string,
          size: KakaoSize,
          options?: KakaoMarkerImageOptions
        ) => KakaoMarkerImage;
        Size: new (width: number, height: number) => KakaoSize;
        Point: new (x: number, y: number) => KakaoPoint;
        event: {
          addListener: (
            target: KakaoMarker | KakaoMapInstance,
            type: string,
            handler: (...args: unknown[]) => void
          ) => void;
          removeListener: (
            target: KakaoMarker | KakaoMapInstance,
            type: string,
            handler: (...args: unknown[]) => void
          ) => void;
          trigger: (
            target: KakaoMarker | KakaoMapInstance,
            type: string,
            data?: unknown
          ) => void;
        };
      };
    };
  }
}
