import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { api } from "../services/api";
import { subscribeToOrder } from "../services/liveOrder";
import { getDrivingRoute } from "../services/location";
import "./OrderTracking.css";

const statuses = [
  "placed",
  "accepted",
  "preparing",
  "ready",
  "assigned",
  "picked_up",
  "on_the_way",
  "delivered",
];

const statusLabels = {
  placed: "Order placed",
  accepted: "Restaurant accepted",
  preparing: "Preparing your food",
  ready: "Food ready",
  assigned: "Delivery partner assigned",
  picked_up: "Picked up",
  on_the_way: "Rider is on the way",
  delivered: "Delivered",
};

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const customerMarkerRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const routeRef = useRef(null);
  const [order, setOrder] = useState(null);
  const [riderLocation, setRiderLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [error, setError] = useState("");

  const orderId = id || localStorage.getItem("najaf_order_id");

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!orderId) {
        setError("No order selected.");
        return;
      }

      try {
        const response = await api.getOrder(orderId);
        if (!mounted) return;
        setOrder(response.order);
        setRiderLocation(
          response.order.riderLocation?.lat != null
            ? response.order.riderLocation
            : null
        );
      } catch (requestError) {
        if (mounted) setError(requestError.message || "Unable to load the order.");
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return undefined;

    return subscribeToOrder(orderId, {
      onStatus: (payload) => {
        if (payload?.order) setOrder(payload.order);
        if (payload?.status) {
          setOrder((current) => current ? { ...current, status: payload.status } : current);
        }
      },
      onLocation: (payload) => {
        if (payload?.lat != null && payload?.lng != null) {
          setRiderLocation({ lat: payload.lat, lng: payload.lng });
        }
      },
    });
  }, [orderId]);

  useEffect(() => {
    if (!mapNode.current || mapRef.current || !order?.address?.lat || !order?.address?.lng) {
      return;
    }

    const customer = [order.address.lat, order.address.lng];
    const map = L.map(mapNode.current).setView(customer, 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    customerMarkerRef.current = L.marker(customer).addTo(map).bindPopup("Delivery location");
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      customerMarkerRef.current = null;
    };
  }, [order]);

  useEffect(() => {
    if (!mapRef.current || !riderLocation) return;

    const rider = [riderLocation.lat, riderLocation.lng];
    if (riderMarkerRef.current) {
      riderMarkerRef.current.setLatLng(rider);
    } else {
      riderMarkerRef.current = L.marker(rider).addTo(mapRef.current).bindPopup("Delivery partner");
    }
  }, [riderLocation]);

  useEffect(() => {
    let cancelled = false;

    async function loadRoute() {
      if (!order?.address?.lat || !order?.address?.lng || !riderLocation) return;

      try {
        const route = await getDrivingRoute(
          { lat: riderLocation.lat, lng: riderLocation.lng },
          { lat: order.address.lat, lng: order.address.lng }
        );

        if (!cancelled) setRouteInfo(route);
      } catch {
        if (!cancelled) setRouteInfo(null);
      }
    }

    loadRoute();
    return () => {
      cancelled = true;
    };
  }, [order, riderLocation]);

  useEffect(() => {
    if (!mapRef.current || !routeInfo?.coordinates?.length) return;

    if (routeRef.current) {
      routeRef.current.remove();
    }

    routeRef.current = L.polyline(routeInfo.coordinates, {
      weight: 6,
      opacity: 0.85,
    }).addTo(mapRef.current);

    const points = [routeInfo.coordinates[0], routeInfo.coordinates[routeInfo.coordinates.length - 1]];
    mapRef.current.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [routeInfo]);

  const currentIndex = useMemo(() => {
    const index = statuses.indexOf(order?.status);
    return index < 0 ? 0 : index;
  }, [order?.status]);

  if (error) {
    return (
      <section className="tracking-page">
        <div className="tracking-card error-state">
          <h2>{error}</h2>
          <button onClick={() => navigate("/home")} type="button">Go Home</button>
        </div>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="tracking-page">
        <div className="tracking-card loading-state">Loading your live order...</div>
      </section>
    );
  }

  return (
    <section className="tracking-page">
      <div className="tracking-shell">
        <div className="tracking-head">
          <div>
            <span className="tracking-kicker">LIVE DELIVERY</span>
            <h1>Track your order</h1>
            <p>Order #{String(order._id).slice(-8)}</p>
          </div>
          <strong className="tracking-status">{statusLabels[order.status] || order.status}</strong>
        </div>

        <div className="tracking-map" ref={mapNode} />

        <div className="tracking-meta">
          <div><span>Delivery address</span><strong>{order.address?.line1}</strong><small>{order.address?.city} {order.address?.pincode}</small></div>
          <div><span>Total</span><strong>₹{Number(order.total || 0).toFixed(2)}</strong><small>Cash on Delivery</small></div>
          <div><span>Route</span><strong>{routeInfo ? `${(routeInfo.distanceMeters / 1000).toFixed(1)} km` : "Waiting for rider"}</strong><small>{routeInfo ? `${Math.ceil(routeInfo.durationSeconds / 60)} min by road` : "Rider GPS will appear here"}</small></div>
        </div>

        <div className="tracking-timeline">
          {statuses.map((status, index) => (
            <div key={status} className={index <= currentIndex ? "timeline-item done" : "timeline-item"}>
              <div className="timeline-dot" />
              <div><strong>{statusLabels[status]}</strong><small>{order.statusHistory?.find((item) => item.status === status)?.at ? new Date(order.statusHistory.find((item) => item.status === status).at).toLocaleString() : "Pending"}</small></div>
            </div>
          ))}
        </div>

        {!riderLocation ? (
          <div className="tracking-note">Your delivery partner has not started sharing GPS yet. The map will update automatically when they go online.</div>
        ) : null}
      </div>
    </section>
  );
};

export default OrderTracking;
