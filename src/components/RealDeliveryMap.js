import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const FALLBACK_CENTER = [77.5946, 12.9716];
const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function makeMarker(className, label) {
  const node = document.createElement('div');
  node.className = className;
  node.setAttribute('aria-label', label);
  return node;
}

async function geocode(text) {
  if (!token || !text) return null;
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(text)}&country=IN&limit=1&access_token=${token}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to geocode delivery address.');
  const data = await response.json();
  const coords = data.features?.[0]?.geometry?.coordinates;
  return coords ? coords : null;
}

async function route(origin, destination) {
  if (!token || !origin || !destination) return null;
  const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?alternatives=false&overview=full&geometries=geojson&access_token=${token}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Unable to load route.');
  const data = await response.json();
  return data.routes?.[0] || null;
}

export default function RealDeliveryMap({ mode = 'tracking', destinationText = '7th Cross Road, Kodihalli, Bengaluru', order }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const watchRef = useRef(null);
  const [status, setStatus] = useState('Connecting to Mapbox…');
  const [userCoords, setUserCoords] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [distance, setDistance] = useState('--');

  useEffect(() => {
    if (!token || !mapContainerRef.current) {
      setStatus('Add REACT_APP_MAPBOX_ACCESS_TOKEN to enable the real map.');
      return undefined;
    }

    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/standard',
      center: FALLBACK_CENTER,
      zoom: 13.2,
      attributionControl: true,
      cooperativeGestures: true,
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
      showUserLocation: true,
    }), 'top-right');

    map.on('load', async () => {
      setStatus('Map online');
      const destinationCoords = order?.destination_lng && order?.destination_lat
        ? [Number(order.destination_lng), Number(order.destination_lat)]
        : await geocode(destinationText).catch(() => null);
      if (destinationCoords) {
        setDestination(destinationCoords);
        const marker = new mapboxgl.Marker({ element: makeMarker('mapbox-pin destination-pin', 'Delivery destination') })
          .setLngLat(destinationCoords)
          .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(destinationText))
          .addTo(map);
        markersRef.current.destination = marker;
      }

      const riderCoords = order?.rider_lng && order?.rider_lat ? [Number(order.rider_lng), Number(order.rider_lat)] : null;
      if (riderCoords) {
        markersRef.current.rider = new mapboxgl.Marker({ element: makeMarker('mapbox-pin rider-pin', 'Rider') })
          .setLngLat(riderCoords)
          .setPopup(new mapboxgl.Popup({ offset: 18 }).setText(`${order?.rider_name || 'Rider'} • live location`))
          .addTo(map);
      }

      try {
        const pos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }));
        const coords = [pos.coords.longitude, pos.coords.latitude];
        setUserCoords(coords);
        markersRef.current.user = new mapboxgl.Marker({ element: makeMarker('mapbox-pin user-pin', 'Your device') }).setLngLat(coords).addTo(map);
        map.flyTo({ center: coords, zoom: 15.2, essential: true });
      } catch {
        setStatus('Map online • location permission not granted');
      }

      if ('geolocation' in navigator) {
        watchRef.current = navigator.geolocation.watchPosition((pos) => {
          const coords = [pos.coords.longitude, pos.coords.latitude];
          setUserCoords(coords);
          markersRef.current.user?.setLngLat(coords);
        }, () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 });
      }
    });

    mapRef.current = map;
    return () => {
      if (watchRef.current !== null && 'geolocation' in navigator) navigator.geolocation.clearWatch(watchRef.current);
      Object.values(markersRef.current).forEach((marker) => marker?.remove());
      markersRef.current = {};
      map.remove();
      mapRef.current = null;
    };
    // Deliberately initialize once; order updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !destination || !token) return undefined;
    const riderCoords = order?.rider_lng && order?.rider_lat ? [Number(order.rider_lng), Number(order.rider_lat)] : null;
    if (riderCoords) {
      if (!markersRef.current.rider) {
        markersRef.current.rider = new mapboxgl.Marker({ element: makeMarker('mapbox-pin rider-pin', 'Rider') }).setLngLat(riderCoords).addTo(mapRef.current);
      } else {
        markersRef.current.rider.setLngLat(riderCoords);
      }
    }

    const origin = riderCoords || userCoords;
    if (!origin) return undefined;
    let cancelled = false;
    route(origin, destination).then((result) => {
      if (cancelled || !result || !mapRef.current) return;
      setRouteInfo(result);
      setDistance(`${(result.distance / 1000).toFixed(1)} km`);
      const source = mapRef.current.getSource('najaf-route');
      const feature = { type: 'Feature', geometry: result.geometry, properties: {} };
      if (source) source.setData(feature);
      else {
        mapRef.current.addSource('najaf-route', { type: 'geojson', data: feature });
        mapRef.current.addLayer({
          id: 'najaf-route-glow',
          type: 'line',
          source: 'najaf-route',
          paint: { 'line-color': '#b7ff3c', 'line-width': 10, 'line-opacity': 0.17, 'line-blur': 3 },
        });
        mapRef.current.addLayer({
          id: 'najaf-route',
          type: 'line',
          source: 'najaf-route',
          paint: { 'line-color': '#c7ff55', 'line-width': 5, 'line-opacity': 0.95 },
        });
      }
      if (mode === 'full') {
        const bounds = new mapboxgl.LngLatBounds();
        result.geometry.coordinates.forEach((pair) => bounds.extend(pair));
        mapRef.current.fitBounds(bounds, { padding: 80, duration: 850, maxZoom: 15.5 });
      }
    }).catch(() => setStatus('Map online • route unavailable right now'));
    return () => { cancelled = true; };
  }, [destination, order?.rider_lat, order?.rider_lng, userCoords, mode]);

  useEffect(() => {
    const timer = setInterval(() => {
      setStatus((value) => value.startsWith('Map online') ? value : 'Map online');
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const etaMinutes = routeInfo ? Math.max(1, Math.round(routeInfo.duration / 60)) : order?.eta_minutes || null;

  return (
    <div className={`real-map ${mode === 'full' ? 'real-map-full' : ''}`}>
      <div ref={mapContainerRef} className="leaflet-map" />
      {!token && <div className="map-loading"><strong>Map connection not configured</strong><small>Add your Mapbox public token in .env.</small></div>}
      <div className="map-hud">
        <div><span className="telemetry-dot"/> {status}</div>
        <strong>{distance}{etaMinutes ? ` · ${etaMinutes} min` : ''}</strong>
      </div>
      <div className="map-signal">NAJAF ROUTE <span/> LIVE</div>
      <div className="map-credit">© Mapbox · OpenStreetMap contributors</div>
    </div>
  );
}
