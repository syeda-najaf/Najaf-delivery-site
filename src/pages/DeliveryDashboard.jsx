import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { joinRole, startDeliveryLocationSharing, getSessionUser } from "../services/liveOrder";
import { socket } from "../services/socket";
import "./RoleDashboards.css";

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const [online, setOnline] = useState(false);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const stopLocationRef = useRef(null);

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "delivery") {
      navigate("/login", { state: { from: "/delivery" } });
      return undefined;
    }

    joinRole("delivery");

    const handler = (assignedOrder) => setOrder(assignedOrder);
    socket.on("delivery-assignment", handler);

    return () => socket.off("delivery-assignment", handler);
  }, [navigate]);

  async function toggleOnline() {
    try {
      const next = !online;
      await api.setDeliveryOnline(next);
      setOnline(next);
      setMessage(next ? "You are online and can receive assignments." : "You are offline.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function startGps() {
    if (!order?._id) {
      setMessage("Wait for a delivery assignment first.");
      return;
    }

    try {
      if (stopLocationRef.current) stopLocationRef.current();
      stopLocationRef.current = await startDeliveryLocationSharing(order._id);
      setMessage("Live GPS sharing started.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => () => {
    if (stopLocationRef.current) stopLocationRef.current();
  }, []);

  return (
    <section className="role-page">
      <div className="role-shell">
        <span className="role-kicker">DELIVERY PARTNER</span>
        <h1>Live rider control</h1>
        <p>Go online, receive an order and share real browser GPS with the customer.</p>

        <button className={online ? "role-button danger" : "role-button"} onClick={toggleOnline} type="button">
          {online ? "Go offline" : "Go online"}
        </button>

        {order ? (
          <div className="role-card">
            <h2>Assigned order</h2>
            <p>Order #{String(order._id).slice(-8)}</p>
            <p>{order.address?.line1}</p>
            <button className="role-button" onClick={startGps} type="button">Start live GPS</button>
          </div>
        ) : (
          <div className="role-card">Waiting for a restaurant assignment...</div>
        )}

        {message ? <div className="role-message">{message}</div> : null}
      </div>
    </section>
  );
};

export default DeliveryDashboard;
