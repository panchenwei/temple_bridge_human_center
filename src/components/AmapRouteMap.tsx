import { useEffect, useRef, useState } from 'react';
import { Map as MapIcon } from 'lucide-react';
import type { RouteDetail, RouteMarker } from '../types';
import { loadAmap } from '../lib/amap';

interface AmapRouteMapProps {
  route: RouteDetail;
  selectedMarkerId: string | null;
  visitedSpotIds: string[];
  onSelectMarker: (marker: RouteMarker) => void;
}

interface UserPin {
  id: string;
  position: [number, number];
}

function vibrate(duration = 35) {
  if (window.navigator.vibrate) {
    window.navigator.vibrate(duration);
  }
}

function markerContent(index: number, selected: boolean, visited: boolean) {
  const marker = document.createElement('button');
  marker.type = 'button';
  marker.className = [
    'amap-route-marker',
    selected ? 'amap-route-marker-selected' : '',
    visited ? 'amap-route-marker-visited' : '',
  ].join(' ');
  marker.innerHTML = visited ? '<span aria-hidden="true">OK</span>' : `<span>${index + 1}</span>`;
  marker.setAttribute('aria-label', `Open route stop ${index + 1}`);
  return marker;
}

function userPinContent(removing: boolean) {
  const wrapper = document.createElement('div');
  wrapper.className = 'amap-user-pin-wrap';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'amap-user-pin';
  button.setAttribute('aria-label', 'Custom memory pin. Long press to remove.');
  button.innerHTML = '<span aria-hidden="true">+</span>';
  wrapper.appendChild(button);

  if (removing) {
    const menu = document.createElement('div');
    menu.className = 'amap-user-pin-menu';
    menu.innerHTML = `
      <p>Cancel marker?</p>
      <div>
        <button type="button" data-pin-action="remove">Remove</button>
        <button type="button" data-pin-action="keep">Keep</button>
      </div>
    `;
    wrapper.appendChild(menu);
  }

  return wrapper;
}

function createRouteLine(amap: AMapNamespace, path: [number, number][]) {
  return new amap.Polyline({
    path,
    strokeColor: '#b85c38',
    strokeOpacity: 0.82,
    strokeWeight: 7,
    strokeStyle: 'dashed',
    strokeDasharray: [12, 10],
    lineJoin: 'round',
    lineCap: 'round',
    zIndex: 40,
  });
}

function searchWalkingPath(amap: AMapNamespace, points: [number, number][]) {
  if (!amap.Walking || points.length < 2) {
    return Promise.resolve(points);
  }

  const walking = new amap.Walking();
  const segments = points.slice(0, -1).map((origin, index) => {
    const destination = points[index + 1];

    return new Promise<[number, number][]>((resolve) => {
      walking.search(origin, destination, (status, result) => {
        if (status !== 'complete' || typeof result === 'string') {
          resolve([origin, destination]);
          return;
        }

        const routePath = result.routes?.[0]?.steps?.flatMap((step) => step.path ?? [])
          .map((point) => [point.lng, point.lat] as [number, number]) ?? [];

        resolve(routePath.length > 1 ? routePath : [origin, destination]);
      });
    });
  });

  return Promise.all(segments).then((paths) => paths.flat());
}

export default function AmapRouteMap({
  route,
  selectedMarkerId,
  visitedSpotIds,
  onSelectMarker,
}: AmapRouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMapMap | null>(null);
  const routeMarkersRef = useRef<AMapMarker[]>([]);
  const routeMarkerHandlersRef = useRef<Array<(event: AMapMarkerEvent) => void>>([]);
  const userMarkersRef = useRef<Record<string, AMapMarker>>({});
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pinPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [amap, setAmap] = useState<AMapNamespace | null>(null);
  const [loadError, setLoadError] = useState('');
  const [userPins, setUserPins] = useState<UserPin[]>([]);
  const [pinToRemove, setPinToRemove] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadAmap()
      .then((api) => {
        if (!cancelled) setAmap(api);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Failed to load AMap');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!amap || !containerRef.current) return;
    let cancelled = false;

    const center = route.mapCenter ?? route.markers[0]?.lnglat ?? [120.573, 31.312];
    const map = new amap.Map(containerRef.current, {
      center,
      zoom: route.mapZoom ?? 16,
      viewMode: '2D',
      mapStyle: 'amap://styles/whitesmoke',
      resizeEnable: true,
      doubleClickZoom: false,
    });

    mapRef.current = map;

    if (amap.Scale) map.addControl(new amap.Scale({ position: 'LB' }));
    if (amap.ToolBar) map.addControl(new amap.ToolBar({ position: 'RB' }));

    const fallbackPath = route.markers.map((marker) => marker.lnglat);
    let polyline = createRouteLine(amap, fallbackPath);

    map.add(polyline);

    routeMarkersRef.current = route.markers.map((marker, index) => {
      const routeMarker = new amap.Marker({
        position: marker.lnglat,
        content: markerContent(index, false, visitedSpotIds.includes(marker.id)),
        anchor: 'center',
        zIndex: 80 + index,
      });
      const handler = () => onSelectMarker(marker);
      routeMarker.on('click', handler);
      routeMarkerHandlersRef.current[index] = handler;
      return routeMarker;
    });

    map.add(routeMarkersRef.current);
    map.setFitView([polyline, ...routeMarkersRef.current], false, [72, 42, 72, 42], 17);

    searchWalkingPath(amap, fallbackPath).then((walkingPath) => {
      if (cancelled || walkingPath.length < 2) return;
      map.remove(polyline);
      polyline = createRouteLine(amap, walkingPath);
      map.add(polyline);
      map.setFitView([polyline, ...routeMarkersRef.current], false, [72, 42, 72, 42], 17);
    });

    const startPress = (event: AMapMapEvent) => {
      if (!event.lnglat) return;
      setPinToRemove(null);
      const lng = event.lnglat.getLng();
      const lat = event.lnglat.getLat();

      pressTimer.current = setTimeout(() => {
        setUserPins((current) => [
          ...current,
          {
            id: Math.random().toString(36).slice(2, 10),
            position: [lng, lat],
          },
        ]);
        vibrate(50);
      }, 600);
    };

    const clearPress = () => {
      if (pressTimer.current) {
        clearTimeout(pressTimer.current);
        pressTimer.current = null;
      }
    };

    map.on('mousedown', startPress);
    map.on('mouseup', clearPress);
    map.on('dragstart', clearPress);
    map.on('zoomstart', clearPress);

    return () => {
      cancelled = true;
      clearPress();
      routeMarkersRef.current.forEach((marker, index) => {
        const handler = routeMarkerHandlersRef.current[index];
        if (handler) marker.off('click', handler);
      });
      map.off('mousedown', startPress);
      map.off('mouseup', clearPress);
      map.off('dragstart', clearPress);
      map.off('zoomstart', clearPress);
      map.destroy();
      mapRef.current = null;
      routeMarkersRef.current = [];
      routeMarkerHandlersRef.current = [];
      userMarkersRef.current = {};
    };
  }, [amap, onSelectMarker, route]);

  useEffect(() => {
    routeMarkersRef.current.forEach((marker, index) => {
      const routeMarker = route.markers[index];
      marker.setContent(markerContent(index, selectedMarkerId === routeMarker.id, visitedSpotIds.includes(routeMarker.id)));
    });
  }, [route.markers, selectedMarkerId, visitedSpotIds]);

  useEffect(() => {
    if (!amap || !mapRef.current) return;

    const existingIds = new Set(Object.keys(userMarkersRef.current));
    const nextIds = new Set(userPins.map((pin) => pin.id));

    existingIds.forEach((id) => {
      if (!nextIds.has(id)) {
        mapRef.current?.remove(userMarkersRef.current[id]);
        delete userMarkersRef.current[id];
      }
    });

    userPins.forEach((pin) => {
      const existingMarker = userMarkersRef.current[pin.id];
      if (existingMarker) {
        existingMarker.setContent(userPinContent(pinToRemove === pin.id));
        return;
      }

      const userMarker = new amap.Marker({
        position: pin.position,
        content: userPinContent(pinToRemove === pin.id),
        anchor: 'center',
        zIndex: 120,
      });

      const startPinPress = () => {
        if (pressTimer.current) {
          clearTimeout(pressTimer.current);
          pressTimer.current = null;
        }

        pinPressTimer.current = setTimeout(() => {
          setPinToRemove(pin.id);
          vibrate(50);
        }, 450);
      };
      const clearPinPress = () => {
        if (pinPressTimer.current) {
          clearTimeout(pinPressTimer.current);
          pinPressTimer.current = null;
        }
      };
      const handleClick = (event: AMapMarkerEvent) => {
        const nativeEvent = event as AMapMarkerEvent & { originEvent?: Event };
        const target = nativeEvent.originEvent?.target as HTMLElement | undefined;
        const actionTarget = target?.closest?.('[data-pin-action]') as HTMLElement | null;
        const action = actionTarget?.dataset.pinAction;

        if (action === 'remove') {
          setUserPins((current) => current.filter((currentPin) => currentPin.id !== pin.id));
          setPinToRemove(null);
        }

        if (action === 'keep') {
          setPinToRemove(null);
        }
      };

      userMarker.on('mousedown', startPinPress);
      userMarker.on('mouseup', clearPinPress);
      userMarker.on('click', handleClick);
      userMarkersRef.current[pin.id] = userMarker;
      mapRef.current?.add(userMarker);
    });
  }, [amap, pinToRemove, userPins]);

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-stone-100 p-8 text-center">
        <div>
          <MapIcon className="mx-auto mb-3 h-8 w-8 text-heritage-olive" />
          <p className="font-serif text-2xl font-bold text-stone-900">Map key needed</p>
          <p className="mt-2 font-sans text-xs leading-6 text-stone-500">
            Add <span className="font-bold">VITE_AMAP_KEY</span> to .env.local, then restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" aria-label={`${route.title} Gaode map`} />;
}
