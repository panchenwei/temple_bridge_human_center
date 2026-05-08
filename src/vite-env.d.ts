/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AMAP_KEY?: string;
  readonly VITE_AMAP_SECURITY_JS_CODE?: string;
}

interface Window {
  AMap?: AMapNamespace;
  _AMapSecurityConfig?: {
    securityJsCode?: string;
  };
}

interface AMapLngLat {
  getLng(): number;
  getLat(): number;
}

interface AMapMapEvent {
  lnglat?: AMapLngLat;
}

interface AMapMarkerEvent extends AMapMapEvent {
  target?: unknown;
}

interface AMapMapOptions {
  center?: [number, number];
  zoom?: number;
  viewMode?: '2D' | '3D';
  mapStyle?: string;
  resizeEnable?: boolean;
  doubleClickZoom?: boolean;
}

interface AMapMarkerOptions {
  position: [number, number];
  content?: HTMLElement | string;
  anchor?: string;
  zIndex?: number;
}

interface AMapPolylineOptions {
  path: [number, number][];
  strokeColor?: string;
  strokeOpacity?: number;
  strokeWeight?: number;
  strokeStyle?: 'solid' | 'dashed';
  strokeDasharray?: number[];
  lineJoin?: string;
  lineCap?: string;
  zIndex?: number;
}

interface AMapControlOptions {
  position?: string;
}

interface AMapMap {
  add(overlay: unknown | unknown[]): void;
  remove(overlay: unknown | unknown[]): void;
  destroy(): void;
  setFitView(overlays?: unknown[], immediately?: boolean, avoid?: number[], maxZoom?: number): void;
  on(eventName: string, handler: (event: AMapMapEvent) => void): void;
  off(eventName: string, handler: (event: AMapMapEvent) => void): void;
  addControl(control: unknown): void;
}

interface AMapMarker {
  on(eventName: string, handler: (event: AMapMarkerEvent) => void): void;
  off(eventName: string, handler: (event: AMapMarkerEvent) => void): void;
  setContent(content: HTMLElement | string): void;
}

interface AMapPolyline {}

interface AMapNamespace {
  Map: new (container: HTMLDivElement, options: AMapMapOptions) => AMapMap;
  Marker: new (options: AMapMarkerOptions) => AMapMarker;
  Polyline: new (options: AMapPolylineOptions) => AMapPolyline;
  Scale?: new (options?: AMapControlOptions) => unknown;
  ToolBar?: new (options?: AMapControlOptions) => unknown;
  Walking?: new () => AMapWalking;
}

interface AMapWalkingPath {
  lng: number;
  lat: number;
}

interface AMapWalkingStep {
  path?: AMapWalkingPath[];
}

interface AMapWalkingRoute {
  steps?: AMapWalkingStep[];
}

interface AMapWalkingResult {
  routes?: AMapWalkingRoute[];
}

interface AMapWalking {
  search(
    origin: [number, number],
    destination: [number, number],
    callback: (status: string, result: AMapWalkingResult | string) => void,
  ): void;
}
