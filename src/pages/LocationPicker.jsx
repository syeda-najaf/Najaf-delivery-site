import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCurrentPosition, reverseGeocode, saveLocation, getSavedLocation } from "../services/location";
import "./LocationPicker.css";

const defaultCenter = { lat: 17.385044, lng: 78.486671 };

const LocationPicker = () => {
  const navigate = useNavigate();
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [position, setPosition] = useState(getSavedLocation());
  const [address, setAddress] = useState(getSavedLocation()?.displayName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;

    const saved = getSavedLocation();
    const center = saved ? [saved.lat, saved.lng] : [defaultCenter.lat, defaultCenter.lng];

    const map = L.map(mapNode.current, { zoomControl: true }).setView(center, saved ? 16 : 12);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !position) return;

    const latLng = [position.lat, position.lng];
    mapRef.current.setView(latLng, 17);

    if (markerRef.current) {
      markerRef.current.setLatLng(latLng);
    } else {
      markerRef.current = L.marker(latLng).addTo(mapRef.current);
    }
  }, [position]);

  async function useMyLocation() {
    try {
      setLoading(true);
      setError("");

      const current = await getCurrentPosition();
      const reverse = await reverseGeocode(current.lat, current.lng);
      const next = {
        ...current,
        displayName: reverse.displayName,
        address: reverse.address,
      };

      setPosition(next);
      setAddress(reverse.displayName);
    } catch (requestError) {
      setError(requestError.message || "Unable to get your location.");
    } finally {
      setLoading(false);
    }
  }

  function chooseLocation() {
    if (!position) {
      setError("Use your current location first.");
      return;
    }

    saveLocation({
      ...position,
      displayName: address || position.displayName,
    });

    navigate(-1);
  }

  return (
    <section className="location-page">
      <div className="location-card">
        <div className="location-copy">
          <span className="location-kicker">DELIVERY LOCATION</span>
          <h1>Where should we deliver?</h1>
          <p>Use your real GPS location to set the delivery point on the map.</p>
        </div>

        <div ref={mapNode} className="location-map" />

        <div className="location-actions">
          <button type="button" className="location-primary" onClick={useMyLocation} disabled={loading}>
            {loading ? "Finding you..." : "Use my current location"}
          </button>
          <button type="button" className="location-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
        </div>

        <div className="location-address">
          <strong>Selected address</strong>
          <p>{address || "Location not selected yet"}</p>
        </div>

        {error ? <div className="location-error">{error}</div> : null}

        <button type="button" className="location-save" onClick={chooseLocation}>
          Save this location
        </button>

        <small className="location-attribution">Map data © OpenStreetMap contributors</small>
      </div>
    </section>
  );
};

export default LocationPicker;
