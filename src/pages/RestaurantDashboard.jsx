import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { joinRole, getSessionUser } from "../services/liveOrder";
import { socket } from "../services/socket";
import "./RoleDashboards.css";

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const [orderResponse, riderResponse] = await Promise.all([
        api.getOrders(),
        api.getAvailableDeliveryPartners(),
      ]);
      setOrders(orderResponse.orders || []);
      setRiders(riderResponse.partners || []);
    } catch (error) {
      setMessage(error.message);
    }
  }

  useEffect(() => {
    const user = getSessionUser();
    if (!user || user.role !== "restaurant") {
      navigate("/login", { state: { from: "/restaurant" } });
      return undefined;
    }

    joinRole("restaurant");
    load();

    const handler = (createdOrder) => {
      setOrders((current) => [createdOrder, ...current]);
    };

    socket.on("order-created", handler);
    return () => socket.off("order-created", handler);
  }, [navigate]);

  async function updateStatus(id, status) {
    try {
      const response = await api.updateOrderStatus(id, status);
      setOrders((current) => current.map((order) => order._id === id ? response.order : order));
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function assign(id, riderId) {
    if (!riderId) return;
    try {
      const response = await api.assignDelivery(id, riderId);
      setOrders((current) => current.map((order) => order._id === id ? response.order : order));
      setMessage("Delivery partner assigned.");
    } catch (error) {
      setMessage(error.message);
    }
  }

  return (
    <section className="role-page">
      <div className="role-shell wide">
        <span className="role-kicker">RESTAURANT</span>
        <h1>Order control center</h1>
        <p>Accept orders, move them through kitchen status and assign a live rider.</p>

        {message ? <div className="role-message">{message}</div> : null}

        <div className="role-list">
          {orders.map((order) => (
            <div className="role-card" key={order._id}>
              <div className="role-card-top">
                <div>
                  <h2>#{String(order._id).slice(-8)}</h2>
                  <p>{order.address?.line1}, {order.address?.city}</p>
                </div>
                <strong>{order.status}</strong>
              </div>

              <div className="role-items">
                {(order.items || []).map((item, index) => (
                  <span key={`${item.productId}-${index}`}>{item.name} × {item.quantity}</span>
                ))}
              </div>

              <div className="role-actions">
                <button onClick={() => updateStatus(order._id, "accepted")} type="button">Accept</button>
                <button onClick={() => updateStatus(order._id, "preparing")} type="button">Preparing</button>
                <button onClick={() => updateStatus(order._id, "ready")} type="button">Ready</button>

                <select defaultValue="" onChange={(event) => assign(order._id, event.target.value)}>
                  <option value="">Assign rider</option>
                  {riders.map((rider) => (
                    <option key={rider._id} value={rider._id}>{rider.name}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}

          {!orders.length ? <div className="role-card">No orders yet.</div> : null}
        </div>
      </div>
    </section>
  );
};

export default RestaurantDashboard;
