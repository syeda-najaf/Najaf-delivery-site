import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const FALLBACK_CENTER = [77.5946, 12.9716];

const token =
  process.env.REACT_APP_MAPBOX_ACCESS_TOKEN ||
  process.env.REACT_APP_MAPBOX_TOKEN ||
  '';

function makeMarker(className, label, inner) {
  const node = document.createElement('div');
  node.className = className;
  node.setAttribute('aria-label', label);
  if (inner) node.innerHTML = inner;
  return node;
}

async function geocode(text) {
  if (!token || !text) return null;
  try {
    const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${encodeURIComponent(
      text
    )}&country=IN&limit=1&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const coords = data.features?.[0]?.geometry?.coordinates;
    return coords || null;
  } catch {
    return null;
  }
}

async function route(origin, destination) {
  if (!token || !origin || !destination) return null;
  try {
    const coords = `${origin[0]},${origin[1]};${destination[0]},${destination[1]}`;
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving-traffic/${coords}?alternatives=false&overview=full&geometries=geojson&access_token=${token}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.routes?.[0] || null;
  } catch {
    return null;
  }
}

/**
 * RealDeliveryMap
 *
 * Props (all optional except map init):
 *   mode: 'tracking' | 'full'
 *   city: { center: { lat, lng }, name, short }
 *   order: Supabase order row (has rider_lat/lng, destination_lat/lng)
 *   userCoords: { lat, lng } | null      // customer's live GPS
 *   riderCoords: { lat, lng } | null     // rider's live GPS (from realtime)
 *   destination: { lat, lng }            // delivery address
 *   destinationText: string
 *   statusStep: 0..4
 */
export default function RealDeliveryMap({
  mode = 'tracking',
  destinationText = '7th Cross Road, Kodihalli, Bengaluru',
  order,
  city,
  userCoords: userCoordsProp,
  riderCoords: riderCoordsProp,
  destination: destinationProp,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const watchRef = useRef(null);
  const routeReadyRef = useRef(false);

  const [status, setStatus] = useState('Connecting to Mapbox…');
  const [userCoords, setUserCoords] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [distance, setDistance] = useState('--');

  /* ---------- normalize coords from any source ---------- */
  const normUser = userCoordsProp
    ? [userCoordsProp.lng, userCoordsProp.lat]
    : null;

  const normRider = riderCoordsProp
    ? [riderCoordsProp.lng, riderCoordsProp.lat]
    : order?.rider_lng != null && order?.rider_lat != null
    ? [Number(order.rider_lng), Number(order.rider_lat)]
    : null;

  const normDestination = destinationProp
    ? [destinationProp.lng, destinationProp.lat]
    : order?.destination_lng != null && order?.destination_lat != null
    ? [Number(order.destination_lng), Number(order.destination_lat)]
    : null;

  /* ---------- initialize map once ---------- */
  useEffect(() => {
    if (!token || !mapContainerRef.current) {
      setStatus('Add REACT_APP_MAPBOX_ACCESS_TOKEN to enable the real map.');
      return undefined;
    }

    mapboxgl.accessToken = token;

    const initialCenter =
      normDestination || normUser || (city?.center ? [city.center.lng, city.center.lat] : null) || FALLBACK_CENTER;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: initialCenter,
      zoom: mode === 'full' ? 12 : 13.2,
      pitch: mode === 'full' ? 0 : 40,
      attributionControl: true,
      cooperativeGestures: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      'bottom-right'
    );

    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true,
        showUserLocation: true,
      }),
      'top-right'
    );

    map.on('load', async () => {
      setStatus('Map online');

      /* --- destination marker --- */
      const dest = normDestination || (await geocode(destinationText));
      if (dest) {
        setDestination(dest);
        markersRef.current.destination = new mapboxgl.Marker({
          element: makeMarker('najaf-pin najaf-pin-destination', 'Delivery destination', '⌂'),
        })
          .setLngLat(dest)
          .setPopup(new mapboxgl.Popup({ offset: 20 }).setText(destinationText))
          .addTo(map);
      }

      /* --- rider marker (if we already have coords) --- */
      if (normRider) {
        markersRef.current.rider = new mapboxgl.Marker({
          element: makeMarker('najaf-pin najaf-pin-rider', 'Rider', '🚴'),
        })
          .setLngLat(normRider)
          .addTo(map);
      }

      /* --- user marker --- */
      if (normUser) {
        setUserCoords(normUser);
        markersRef.current.user = new mapboxgl.Marker({
          element: makeMarker('najaf-pin najaf-pin-user', 'You', '<span class="najaf-pin-dot"></span>'),
        })
          .setLngLat(normUser)
          .addTo(map);
      } else if ('geolocation' in navigator) {
        /* fall back to browser GPS */
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            setUserCoords(coords);
            if (!markersRef.current.user) {
              markersRef.current.user = new mapboxgl.Marker({
                element: makeMarker('najaf-pin najaf-pin-user', 'You', '<span class="najaf-pin-dot"></span>'),
              })
                .setLngLat(coords)
                .addTo(map);
            } else {
              markersRef.current.user.setLngLat(coords);
            }
          },
          () => setStatus('Map online • location permission not granted'),
          { enableHighAccuracy: true, timeout: 9000, maximumAge: 10000 }
        );

        watchRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = [pos.coords.longitude, pos.coords.latitude];
            setUserCoords(coords);
            markersRef.current.user?.setLngLat(coords);
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
        );
      }

      routeReadyRef.current = true;
    });

    mapRef.current = map;

    return () => {
      if (watchRef.current !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
      Object.values(markersRef.current).forEach((m) => m?.remove());
      markersRef.current = {};
      routeReadyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------- update user marker when prop changes ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !normUser) return;
    if (!markersRef.current.user) {
      markersRef.current.user = new mapboxgl.Marker({
        element: makeMarker('najaf-pin najaf-pin-user', 'You', '<span class="najaf-pin-dot"></span>'),
      })
        .setLngLat(normUser)
        .addTo(map);
    } else {
      markersRef.current.user.setLngLat(normUser);
    }
    setUserCoords(normUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCoordsProp?.lat, userCoordsProp?.lng]);

  /* ---------- update rider marker when prop changes (realtime) ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !normRider) return;

    if (!markersRef.current.rider) {
      markersRef.current.rider = new mapboxgl.Marker({
        element: makeMarker('najaf-pin najaf-pin-rider', 'Rider', '🚴'),
      })
        .setLngLat(normRider)
        .addTo(map);
    } else {
      markersRef.current.rider.setLngLat(normRider);
    }

    map.flyTo({
      center: normRider,
      zoom: mode === 'full' ? 12.5 : 14,
      duration: 1200,
      essential: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [riderCoordsProp?.lat, riderCoordsProp?.lng, order?.rider_lat, order?.rider_lng]);

  /* ---------- update destination marker when prop changes ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !normDestination) return;
    if (!markersRef.current.destination) {
      markersRef.current.destination = new mapboxgl.Marker({
        element: makeMarker('najaf-pin najaf-pin-destination', 'Delivery destination', '⌂'),
      })
        .setLngLat(normDestination)
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setText(destinationText))
        .addTo(map);
    } else {
      markersRef.current.destination.setLngLat(normDestination);
    }
    setDestination(normDestination);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destinationProp?.lat, destinationProp?.lng, order?.destination_lat, order?.destination_lng]);

  /* ---------- draw route ---------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !destination || !token || !routeReadyRef.current) return undefined;

    const origin = normRider || userCoords || normUser;
    if (!origin) return undefined;

    let cancelled = false;

    route(origin, destination).then((result) => {
      if (cancelled || !result || !mapRef.current) return;

      setRouteInfo(result);
      setDistance(`${(result.distance / 1000).toFixed(1)} km`);

      const feature = {
        type: 'Feature',
        geometry: result.geometry,
        properties: {},
      };

      const source = mapRef.current.getSource('najaf-route');

      if (source) {
        source.setData(feature);
      } else {
        mapRef.current.addSource('najaf-route', {
          type: 'geojson',
          data: feature,
        });

        mapRef.current.addLayer({
          id: 'najaf-route-glow',
          type: 'line',
          source: 'najaf-route',
          paint: {
            'line-color': '#b7ff3c',
            'line-width': 10,
            'line-opacity': 0.17,
            'line-blur': 3,
          },
        });

        mapRef.current.addLayer({
          id: 'najaf-route',
          type: 'line',
          source: 'najaf-route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: {
            'line-color': '#c7ff55',
            'line-width': 5,
            'line-opacity': 0.95,
          },
        });
      }

      if (mode === 'full') {
        const bounds = new mapboxgl.LngLatBounds();
        result.geometry.coordinates.forEach((pair) => bounds.extend(pair));
        mapRef.current.fitBounds(bounds, {
          padding: 80,
          duration: 850,
          maxZoom: 15.5,
        });
      }
    }).catch(() => {
      setStatus('Map online • route unavailable right now');
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination, normRider?.toString(), userCoords?.toString(), mode]);

  /* ---------- keep status fresh ---------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setStatus((value) =>
        value.startsWith('Map online') ? value : 'Map online'
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const etaMinutes = routeInfo
    ? Math.max(1, Math.round(routeInfo.duration / 60))
    : order?.eta_minutes || null;

  return (
    <div className={`real-map ${mode === 'full' ? 'real-map-full' : ''}`}>
      <div ref={mapContainerRef} className="leaflet-map" />

      {!token && (
        <div className="map-loading">
          <strong>Map connection not configured</strong>
          <small>
            Add REACT_APP_MAPBOX_ACCESS_TOKEN in .env and restart.
          </small>
        </div>
      )}

      <div className="map-hud">
        <div>
          <span className={`telemetry-dot ${normRider ? 'live' : ''}`} /> {status}
        </div>
        <strong>
          {distance}
          {etaMinutes ? ` · ${etaMinutes} min` : ''}
        </strong>
      </div>

      <div className="map-signal">
        NAJAF ROUTE <span /> LIVE
      </div>

      <div className="map-credit">
        © Mapbox · OpenStreetMap contributors
      </div>
    </div>
  );
}