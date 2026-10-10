import React, { useState } from "react";

/**
 * Drop into checkout with:
 * <CustomerLocationFetcher onLocation={setDeliveryLocation} />
 * State shape: { latitude, longitude, accuracy, address }
 */
export default function CustomerLocationFetcher({ onLocation, className = "" }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState(null);

  const fetchLocation = () => {
    if (!("geolocation" in navigator)) {
      setMessage("This browser does not support GPS location.");
      return;
    }
    if (!window.isSecureContext && window.location.hostname !== "localhost") {
      setMessage("GPS requires HTTPS. Open the secure website and try again.");
      return;
    }

    setBusy(true);
    setMessage("Waiting for your location permission…");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy || 0),
          address: "",
        };

        try {
          const token = process.env.REACT_APP_MAPBOX_TOKEN;
          if (token) {
            const url = new URL(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json`
            );
            url.searchParams.set("access_token", token);
            url.searchParams.set("limit", "1");
            const response = await fetch(url.toString());
            if (response.ok) {
              const data = await response.json();
              coords.address = data.features?.[0]?.place_name || "";
            }
          }
        } catch (error) {
          console.warn("Reverse geocoding unavailable:", error);
        }

        setLocation(coords);
        onLocation?.(coords);
        setMessage(
          `Location found · accuracy about ${coords.accuracy || "unknown"} m`
        );
        setBusy(false);
      },
      (error) => {
        const errors = {
          1: "Location permission was denied. Allow location access in your browser settings.",
          2: "Your device could not determine a location. Turn on device location and retry.",
          3: "Location request timed out. Please try again.",
        };
        setMessage(errors[error.code] || "Could not get your location.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 10000 }
    );
  };

  return (
    <section className={`najaf-gps-card ${className}`}>
      <div className="najaf-gps-copy">
        <span className="najaf-gps-kicker">DELIVERY LOCATION</span>
        <strong>Pin your doorstep</strong>
        <p>
          Use your device GPS to set a more accurate delivery location.
          Your browser will ask permission first.
        </p>
        {location && (
          <small>
            {location.address || `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
          </small>
        )}
        {message && <small role="status">{message}</small>}
      </div>
      <button type="button" onClick={fetchLocation} disabled={busy}>
        {busy ? "Finding location…" : location ? "Refresh my location" : "Use my current location"}
      </button>
    </section>
  );
}
