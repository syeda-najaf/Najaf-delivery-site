import React, { useCallback, useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../lib/supabase";
import "./LiveLocation.css";

const TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || "";
const DEFAULT_CENTER = [77.5946, 12.9716]; // Bengaluru fallback only, not a claimed live location.

function numericPoint(lng, lat) {
  const x = Number(lng);
  const y = Number(lat);
  return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) <= 180 && Math.abs(y) <= 90
    ? [x, y]
    : null;
}

export default function RealDeliveryMap({
  mode = "tracking",
  order,
  destinationText = "",
  statusStep = 0,
}) {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const riderMarker = useRef(null);
  const customerMarker = useRef(null);
  const watchId = useRef(null);
  const lastWriteAt = useRef(0);
  const [currentOrder, setCurrentOrder] = useState(order || null);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState("Waiting for location");
  const [error, setError] = useState("");
  const [userId, setUserId] = useState(null);

  const orderId = order?.dbOrderId || order?.id;
  const riderPoint = numericPoint(currentOrder?.rider_lng, currentOrder?.rider_lat);
  const customerPoint = numericPoint(
    currentOrder?.customer_lng ?? currentOrder?.delivery_lng,
    currentOrder?.customer_lat ?? currentOrder?.delivery_lat
  );

  useEffect(() => {
    let alive = true;
    supabase?.auth.getUser().then(({ data }) => {
      if (alive) setUserId(data?.user?.id || null);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    setCurrentOrder(order || null);
  }, [order]);

  useEffect(() => {
    if (!supabase || !orderId) return undefined;
    let alive = true;

    const load = async () => {
      const { data, error: loadError } = await supabase
        .from("orders")
        .select("id,user_id,rider_id,rider_lat,rider_lng,rider_location_updated_at,customer_lat,customer_lng,delivery_lat,delivery_lng,status")
        .eq("id", orderId)
        .maybeSingle();

      if (!alive) return;
      if (loadError) {
        setError(loadError.message);
        return;
      }
      if (data) setCurrentOrder((old) => ({ ...(old || {}), ...data }));
    };

    load();
    const channel = supabase
      .channel(`najaf-live-order-${orderId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
        (payload) => {
          if (payload.new) setCurrentOrder((old) => ({ ...(old || {}), ...payload.new }));
        }
      )
      .subscribe();

    return () => {
      alive = false;
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return undefined;
    if (!TOKEN) {
      setError("Mapbox token missing. Add REACT_APP_MAPBOX_TOKEN to .env.local and Vercel.");
      return undefined;
    }

    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: mapNode.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: customerPoint || riderPoint || DEFAULT_CENTER,
      zoom: customerPoint || riderPoint ? 14 : 11,
      attributionControl: true,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserHeading: true,
    }), "top-right");
    map.on("load", () => setStatus("Map ready"));
    map.on("error", (event) => {
      if (event?.error?.message) setError(event.error.message);
    });
    mapRef.current = map;

    return () => {
      riderMarker.current?.remove();
      customerMarker.current?.remove();
      map.remove();
      mapRef.current = null;
    };
    // Map is initialized once. Marker updates are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (customerPoint) {
      if (!customerMarker.current) {
        customerMarker.current = new mapboxgl.Marker({ color: "#16a34a" })
          .setLngLat(customerPoint)
          .setPopup(new mapboxgl.Popup().setText("Delivery destination"))
          .addTo(map);
      } else customerMarker.current.setLngLat(customerPoint);
    }

    if (riderPoint) {
      if (!riderMarker.current) {
        riderMarker.current = new mapboxgl.Marker({ color: "#f97316" })
          .setLngLat(riderPoint)
          .setPopup(new mapboxgl.Popup().setText("Live rider position"))
          .addTo(map);
      } else riderMarker.current.setLngLat(riderPoint);
    }

    const points = [customerPoint, riderPoint].filter(Boolean);
    if (points.length === 2) {
      const bounds = new mapboxgl.LngLatBounds(points[0], points[0]);
      bounds.extend(points[1]);
      map.fitBounds(bounds, { padding: 70, maxZoom: 15, duration: 700 });
    } else if (points.length === 1) {
      map.easeTo({ center: points[0], zoom: 15, duration: 700 });
    }
  }, [customerPoint?.[0], customerPoint?.[1], riderPoint?.[0], riderPoint?.[1]]);

  const stopSharing = useCallback(() => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setSharing(false);
    setStatus("Location sharing stopped");
  }, []);

  const startSharing = useCallback(async () => {
    setError("");
    if (!orderId) {
      setError("Open a real order first. The demo route has no database order to update.");
      return;
    }
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    if (!navigator.geolocation) {
      setError("This browser does not support GPS.");
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setError("GPS sharing requires HTTPS.");
      return;
    }

    const { data, error: authError } = await supabase.auth.getUser();
    const currentUser = data?.user;
    if (authError || !currentUser) {
      setError("Sign in with the account assigned as this order's rider.");
      return;
    }

    // Never allow a customer to publish their location as a rider.
    const { data: row, error: orderError } = await supabase
      .from("orders")
      .select("id,rider_id")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      setError(orderError.message);
      return;
    }
    if (!row || row.rider_id !== currentUser.id) {
      setError("This account is not assigned as the rider for this order. Set orders.rider_id to this rider's Auth user ID.");
      return;
    }

    setUserId(currentUser.id);
    setSharing(true);
    setStatus("Requesting GPS permission…");

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setStatus(`GPS active · accuracy ${Math.round(accuracy || 0)} m`);
        const map = mapRef.current;
        if (map) {
          const point = [longitude, latitude];
          if (!riderMarker.current) {
            riderMarker.current = new mapboxgl.Marker({ color: "#f97316" })
              .setLngLat(point)
              .setPopup(new mapboxgl.Popup().setText("Live rider position"))
              .addTo(map);
          } else riderMarker.current.setLngLat(point);
        }

        // Throttle writes so a moving device does not flood the database.
        const now = Date.now();
        if (now - lastWriteAt.current < 5000) return;
        lastWriteAt.current = now;

        const { error: updateError } = await supabase.rpc("update_rider_location", {
          p_order_id: orderId,
          p_lat: latitude,
          p_lng: longitude,
        });

        if (updateError) {
          setError(`Could not publish rider GPS: ${updateError.message}`);
        }
      },
      (geoError) => {
        const messages = {
          1: "GPS permission denied. Allow location access in browser settings.",
          2: "Device location is unavailable. Turn on Location Services and retry.",
          3: "GPS request timed out. Retry in an area with a better signal.",
        };
        setError(messages[geoError.code] || geoError.message || "GPS error.");
        stopSharing();
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 20000 }
    );
  }, [orderId, stopSharing]);

  useEffect(() => () => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
    }
  }, []);

  const isAssignedRider = Boolean(userId && currentOrder?.rider_id === userId);

  return (
    <div className={`najaf-live-map ${mode === "full" ? "najaf-live-map-full" : ""}`}>
      <div className="najaf-map-topbar">
        <div>
          <span className="najaf-map-eyebrow">NAJAF NOVA · LIVE DELIVERY</span>
          <strong>{riderPoint ? "Rider signal received" : "Waiting for rider signal"}</strong>
          <small>{currentOrder?.rider_location_updated_at
            ? `Last update: ${new Date(currentOrder.rider_location_updated_at).toLocaleTimeString()}`
            : status}</small>
        </div>
        {isAssignedRider && (
          <button
            type="button"
            className={sharing ? "najaf-map-stop" : "najaf-map-share"}
            onClick={sharing ? stopSharing : startSharing}
          >
            {sharing ? "Stop sharing" : "Start rider GPS"}
          </button>
        )}
      </div>

      <div ref={mapNode} className="najaf-map-canvas" aria-label="Live delivery map" />

      <div className="najaf-map-legend">
        <span><i className="najaf-legend-customer" /> Delivery destination</span>
        <span><i className="najaf-legend-rider" /> Rider location</span>
        <span>{destinationText || "Destination appears after address is saved"}</span>
      </div>

      {error && <p className="najaf-map-error" role="alert">{error}</p>}
      {!orderId && <p className="najaf-map-note">Place an order to activate its live tracking channel.</p>}
      {orderId && !riderPoint && <p className="najaf-map-note">The rider must sign in, be assigned to this order, and tap “Start rider GPS”.</p>}
      {typeof statusStep === "number" && statusStep > 0 && (
        <span className="najaf-map-step">Delivery progress: step {statusStep + 1}</span>
      )}
    </div>
  );
}
