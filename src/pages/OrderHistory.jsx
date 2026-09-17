import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiClock, FiMapPin, FiPackage, FiRepeat, FiShoppingBag } from "react-icons/fi";
import { api } from "../services/api";
import { getSessionUser } from "../services/liveOrder";
import "./OrderHistory.css";

const statusLabels = { placed: "Order placed", accepted: "Accepted", preparing: "Preparing", ready: "Ready", assigned: "Rider assigned", picked_up: "Picked up", on_the_way: "On the way", delivered: "Delivered", cancelled: "Cancelled" };

const OrderHistory = () => {
  const navigate = useNavigate();
  const user = getSessionUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    if (!user) { setLoading(false); return () => { mounted = false; }; }
    api.getOrders().then((result) => { if (mounted) setOrders(result.orders || []); }).catch((requestError) => { if (mounted) setError(requestError.message || "Unable to load orders."); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [user]);

  const sorted = useMemo(() => [...orders].sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)), [orders]);
  const active = sorted.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const past = sorted.filter((order) => ["delivered", "cancelled"].includes(order.status));

  if (!user) return <section className="history-page"><div className="history-empty"><div className="empty-icon"><FiPackage/></div><h1>Sign in to see your orders</h1><p>Your live deliveries and previous orders will appear here.</p><Link to="/login" className="history-button">Login</Link></div></section>;
  if (loading) return <section className="history-page"><div className="history-loading">Loading your orders...</div></section>;
  if (error) return <section className="history-page"><div className="history-empty"><h1>Something went wrong</h1><p>{error}</p></div></section>;

  const renderOrder = (order) => <article className="history-card" key={order._id}>
    <div className="history-card-top"><div><span className="history-order-id">ORDER #{String(order._id).slice(-8)}</span><h3>{statusLabels[order.status] || order.status}</h3><p><FiClock/> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent order"}</p></div><span className={`history-status ${order.status}`}>{String(order.status || "").replace(/_/g, " ")}</span></div>
    <div className="history-items">{(order.items || []).slice(0,4).map((item, index) => <span key={`${item.productId || item.name}-${index}`}>{item.name} × {item.quantity}</span>)}{(order.items || []).length > 4 ? <span>+ {(order.items || []).length - 4} more</span> : null}</div>
    <div className="history-card-bottom"><div><span>Total</span><strong>₹{Number(order.total || 0).toFixed(2)}</strong></div><div><span>Delivery</span><strong><FiMapPin/> {order.address?.city || "Saved address"}</strong></div><div className="history-actions">{order.status !== "delivered" && order.status !== "cancelled" ? <button onClick={() => navigate(`/track-order/${order._id}`)}>Track live</button> : <button onClick={() => navigate("/pizzas")}><FiRepeat/> Order again</button>}</div></div>
  </article>;

  return <section className="history-page"><div className="history-shell"><div className="history-head"><div><span className="history-kicker">YOUR NAJAF ACCOUNT</span><h1>Orders</h1><p>Keep one eye on the current delivery and one on your favorites.</p></div><button type="button" onClick={() => navigate("/pizzas")}><FiShoppingBag/> Order food</button></div>
    {active.length ? <section className="history-group"><div className="group-title"><span>LIVE NOW</span><strong>{active.length} active order{active.length > 1 ? "s" : ""}</strong></div>{active.map(renderOrder)}</section> : null}
    <section className="history-group"><div className="group-title"><span>HISTORY</span><strong>{past.length ? `${past.length} completed` : "No past orders yet"}</strong></div>{past.length ? past.map(renderOrder) : <div className="history-empty small"><div className="empty-icon"><FiPackage/></div><h2>Your next favorite is still waiting.</h2><p>Place an order and your history will start building here.</p><Link to="/pizzas" className="history-button">Browse menu</Link></div>}</section>
  </div></section>;
};

export default OrderHistory;
