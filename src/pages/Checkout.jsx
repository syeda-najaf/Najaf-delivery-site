import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AiFillCheckCircle } from "react-icons/ai";
import { api } from "../services/api";
import { getSavedLocation } from "../services/location";
import { getSessionUser, placeOrderFromCart, saveSession } from "../services/liveOrder";
import "../styles/checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalAmount = useSelector((state) => state.cart.totalAmount);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);

  const [user, setUser] = useState(getSessionUser());
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [location] = useState(getSavedLocation());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successOrder, setSuccessOrder] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const total = useMemo(() => Number(totalAmount || 0).toFixed(2), [totalAmount]);

  async function loginOrRegister(event) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const response =
        mode === "login"
          ? await api.login({ email: email.trim(), password })
          : await api.register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), role: "customer" });

      saveSession(response);
      setUser(response.user);
      window.dispatchEvent(new Event("najaf-session-changed"));
      setPassword("");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function placeOrder(event) {
    event.preventDefault();
    setError("");

    if (!user) {
      setError("Please login first.");
      return;
    }

    if (!cartItems.length) {
      setError("Your cart is empty.");
      return;
    }

    if (!location) {
      setError("Please set your delivery location on the map first.");
      return;
    }

    try {
      setLoading(true);
      const response = await placeOrderFromCart(cartItems, {
        label: "Current location",
        line1: location.displayName || `${location.lat}, ${location.lng}`,
        city: location.address?.city || location.address?.town || location.address?.village || "",
        pincode: location.address?.postcode || "",
        lat: location.lat,
        lng: location.lng,
      });

      localStorage.setItem("najaf_order_id", response.order._id);
      setSuccessOrder(response.order);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  if (successOrder) {
    return (
      <div className="checkoutMessage">
        <div className="checkoutTitleContainer">
          <AiFillCheckCircle className="checkoutIcon" />
          <h3>Order placed successfully!</h3>
        </div>
        <p>Your order has been saved to Najaf Delivery.</p>
        <p><strong>Order ID:</strong> {successOrder._id}</p>
        <p><strong>Status:</strong> {successOrder.status}</p>
        <button className="order__btn" type="button" onClick={() => navigate(`/track-order/${successOrder._id}`)}>Track my order</button>
      </div>
    );
  }

  return (
    <section style={styles.page}>
      <div style={styles.shell}>
        <div style={styles.heading}>
          <h1>Checkout</h1>
          <p>Login, select your real GPS location and place the order.</p>
        </div>

        {error ? <div style={styles.error}>{error}</div> : null}

        <div style={styles.grid}>
          <div style={styles.card}>
            <h2>Account</h2>
            {user ? (
              <div style={styles.accountBox}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                <span>{user.phone || "No phone number"}</span>
              </div>
            ) : (
              <>
                <div style={styles.tabs}>
                  <button type="button" onClick={() => setMode("login")} style={mode === "login" ? styles.activeTab : styles.tab}>Login</button>
                  <button type="button" onClick={() => setMode("register")} style={mode === "register" ? styles.activeTab : styles.tab}>Register</button>
                </div>

                <form onSubmit={loginOrRegister}>
                  {mode === "register" ? <>
                    <label style={styles.label}>Name</label>
                    <input style={styles.input} value={name} onChange={(e) => setName(e.target.value)} required />
                    <label style={styles.label}>Phone</label>
                    <input style={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </> : null}
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
                  <label style={styles.label}>Password</label>
                  <input style={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
                  <button style={styles.primary} disabled={loading} type="submit">{loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</button>
                </form>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h2>Delivery location</h2>
            <p style={styles.muted}>{location?.displayName || "No location selected"}</p>
            <button type="button" style={styles.secondary} onClick={() => navigate("/location")}>{location ? "Change location on map" : "Fetch my current location"}</button>
            {location ? <div style={styles.locationData}><strong>GPS</strong><span>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span></div> : null}
          </div>

          <div style={styles.card}>
            <h2>Order summary</h2>
            <div style={styles.summaryRow}><span>Items</span><strong>{totalQuantity}</strong></div>
            {cartItems.map((item, index) => <div key={`${item.id}-${index}`} style={styles.item}><span>{item.title} × {item.quantity}</span><strong>₹{(Number(item.price) * Number(item.quantity)).toFixed(2)}</strong></div>)}
            <div style={styles.total}><span>Total</span><strong>₹{total}</strong></div>
            <button type="button" style={styles.primary} onClick={placeOrder} disabled={loading || !user || !location}>{loading ? "Placing order..." : "Place real order"}</button>
          </div>
        </div>
      </div>
    </section>
  );
};

const styles = { page: { minHeight: "75vh", padding: "32px 16px", background: "#f7f8fc" }, shell: { maxWidth: 1100, margin: "0 auto" }, heading: { marginBottom: 20 }, grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 18 }, card: { background: "#fff", borderRadius: 18, padding: 20, boxShadow: "0 10px 30px rgba(20,30,60,.07)" }, tabs: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 15 }, tab: { padding: 11, border: "1px solid #dce1ea", background: "#fff", borderRadius: 10, fontWeight: 700 }, activeTab: { padding: 11, border: "1px solid #3158d4", background: "#3158d4", color: "#fff", borderRadius: 10, fontWeight: 700 }, label: { display: "block", margin: "12px 0 6px", fontWeight: 700 }, input: { width: "100%", boxSizing: "border-box", padding: 12, border: "1px solid #dce1ea", borderRadius: 10 }, primary: { width: "100%", marginTop: 16, padding: 13, border: 0, background: "#3158d4", color: "#fff", borderRadius: 10, fontWeight: 800 }, secondary: { width: "100%", padding: 13, border: "1px solid #3158d4", background: "#fff", color: "#3158d4", borderRadius: 10, fontWeight: 800 }, accountBox: { display: "grid", gap: 8, padding: 14, borderRadius: 12, background: "#f6f8ff" }, muted: { color: "#6b7280", lineHeight: 1.6 }, locationData: { display: "grid", gap: 4, marginTop: 14, padding: 12, borderRadius: 12, background: "#f7f8fc" }, summaryRow: { display: "flex", justifyContent: "space-between", paddingBottom: 12, borderBottom: "1px solid #eee" }, item: { display: "flex", justifyContent: "space-between", gap: 12, padding: "10px 0", borderBottom: "1px solid #eee" }, total: { display: "flex", justifyContent: "space-between", marginTop: 16, fontSize: 20 }, error: { marginBottom: 16, padding: 12, borderRadius: 12, background: "#fff0f0", color: "#b42318" } };

export default Checkout;
