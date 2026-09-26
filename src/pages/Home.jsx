import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiArrowRight, FiClock, FiMapPin, FiSearch, FiShield, FiShoppingBag, FiStar, FiTruck, FiZap } from "react-icons/fi";
import products from "../assets/fake-data/products";
import { getSavedLocation } from "../services/location";
import { api } from "../services/api";
import { getSessionUser } from "../services/liveOrder";
import "./DominoHome.css";

const categoryCards = [
  { label: "Pizza", emoji: "🍕", query: "Pizza" },
  { label: "Burgers", emoji: "🍔", query: "Burger" },
  { label: "Sides", emoji: "🍟", query: "" },
  { label: "Drinks", emoji: "🥤", query: "" },
  { label: "Desserts", emoji: "🍰", query: "" },
];

const deals = [
  { eyebrow: "TODAY'S DEAL", title: "Big craving, better value.", text: "Build a meal around your favorite items and keep delivery simple.", action: "Explore menu", path: "/pizzas", tone: "red" },
  { eyebrow: "LIVE TRACKING", title: "Know where your order is.", text: "Save your location and follow your delivery partner on the live map.", action: "Track an order", path: "/track-order", tone: "navy" },
  { eyebrow: "FAST CHECKOUT", title: "Less tapping. More eating.", text: "Your cart, address and order status stay connected from checkout to delivery.", action: "See how it works", path: "/location", tone: "cream" },
];

const serviceTiles = [
  { icon: FiTruck, title: "Live delivery", text: "GPS-based rider updates when your delivery partner is online." },
  { icon: FiZap, title: "Fast ordering", text: "Simple menu, quick cart actions and a focused checkout flow." },
  { icon: FiShield, title: "Secure account", text: "JWT-backed customer accounts and protected order APIs." },
  { icon: FiClock, title: "Order timeline", text: "Placed, accepted, preparing, picked up, on the way, delivered." },
];

function currency(value) {
  return `₹${Number(value || 0).toFixed(0)}`;
}

const Home = () => {
  const navigate = useNavigate();
  const user = getSessionUser();
  const location = getSavedLocation();
  const [query, setQuery] = useState("");
  const [activeOrder, setActiveOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (!user) return () => { mounted = false; };

    api.getOrders()
      .then((result) => {
        if (!mounted) return;
        const orders = result.orders || [];
        const live = orders.find((order) => !["delivered", "cancelled"].includes(order.status));
        setActiveOrder(live || null);
      })
      .catch(() => {
        if (mounted) setActiveOrder(null);
      });

    return () => { mounted = false; };
  }, [user]);

  const popular = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.slice(0, 8);
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim() || !Array.isArray(products)) return [];
    const needle = query.toLowerCase();
    return products
      .filter((item) => `${item.title || ""} ${item.category || ""}`.toLowerCase().includes(needle))
      .slice(0, 5);
  }, [query]);

  const deliveryLabel = location?.displayName
    ? location.displayName.split(",").slice(0, 2).join(",")
    : "Set delivery location";

  return (
    <main className="domino-home">
      <section className="domino-hero">
        <div className="domino-container domino-hero-grid">
          <div className="domino-hero-copy">
            <div className="domino-live-pill"><span /> Live delivery platform</div>
            <h1>Good food.<br /><span>Better delivery.</span></h1>
            <p className="domino-hero-sub">Order your favorites, save your delivery location and follow the journey from kitchen to doorstep.</p>

            <div className="domino-location-pill" onClick={() => navigate("/location")} role="button" tabIndex={0}>
              <FiMapPin />
              <div>
                <small>DELIVER TO</small>
                <strong>{deliveryLabel}</strong>
              </div>
              <FiArrowRight className="arrow" />
            </div>

            <div className="domino-search-wrap">
              <FiSearch />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pizza, burger, sides..." aria-label="Search food" />
              <button type="button" onClick={() => navigate("/pizzas")}>Search</button>
              {searchResults.length > 0 && (
                <div className="domino-search-results">
                  {searchResults.map((item) => (
                    <button type="button" key={item.id} onClick={() => navigate(`/pizzas/${item.id}`)}>
                      <span>{item.title}</span>
                      <strong>{currency(item.price)}</strong>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="domino-hero-actions">
              <Link to="/pizzas" className="domino-primary">Order now <FiArrowRight /></Link>
              <Link to="/track-order" className="domino-secondary">Track order</Link>
            </div>
          </div>

          <div className="domino-hero-art">
            <div className="domino-art-glow" />
            <div className="domino-art-card domino-art-card-main">
              <div className="domino-art-top"><span>NAJAF</span><span>LIVE</span></div>
              <div className="domino-art-pizza">🍕</div>
              <div className="domino-art-name">Hot, fresh & on the move</div>
              <div className="domino-art-route"><span className="route-point" /><span className="route-line" /><span className="route-point filled" /></div>
              <div className="domino-art-footer"><span>Kitchen</span><strong>Doorstep</strong></div>
            </div>
            <div className="domino-float-card domino-float-top"><FiClock /><div><small>Average prep</small><strong>Fast & focused</strong></div></div>
            <div className="domino-float-card domino-float-bottom"><FiStar /><div><small>Customer favorite</small><strong>Fresh from the menu</strong></div></div>
          </div>
        </div>
      </section>

      {activeOrder && (
        <section className="domino-active-order">
          <div className="domino-container active-order-inner">
            <div className="active-icon"><FiTruck /></div>
            <div className="active-copy"><small>LIVE ORDER</small><strong>Order #{String(activeOrder._id).slice(-8)} · {String(activeOrder.status || "").replace(/_/g, " ")}</strong><span>{activeOrder.etaMinutes ? `${activeOrder.etaMinutes} min ETA` : "Your delivery partner's updates will appear here"}</span></div>
            <Link to={`/track-order/${activeOrder._id}`} className="active-track">Track live <FiArrowRight /></Link>
          </div>
        </section>
      )}

      <section className="domino-section domino-categories">
        <div className="domino-container">
          <div className="section-heading"><div><span className="eyebrow">BROWSE FAST</span><h2>What are you craving?</h2></div><Link to="/pizzas" className="section-link">View full menu <FiArrowRight /></Link></div>
          <div className="category-grid">
            {categoryCards.map((category) => (
              <Link className="category-card" key={category.label} to={`/pizzas${category.query ? `?category=${encodeURIComponent(category.query)}` : ""}`}>
                <span className="category-emoji">{category.emoji}</span><strong>{category.label}</strong><span>Explore</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="offers" className="domino-section deals-section">
        <div className="domino-container">
          <div className="section-heading"><div><span className="eyebrow">MORE THAN A MENU</span><h2>Designed for the whole journey</h2></div></div>
          <div className="deal-grid">
            {deals.map((deal) => (
              <Link to={deal.path} key={deal.title} className={`deal-card ${deal.tone}`}>
                <span>{deal.eyebrow}</span><h3>{deal.title}</h3><p>{deal.text}</p><strong>{deal.action} <FiArrowRight /></strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="domino-section popular-section">
        <div className="domino-container">
          <div className="section-heading"><div><span className="eyebrow">POPULAR RIGHT NOW</span><h2>Customer favorites</h2></div><Link to="/pizzas" className="section-link">See all <FiArrowRight /></Link></div>
          <div className="popular-grid">
            {popular.map((item) => (
              <Link className="popular-card" to={`/pizzas/${item.id}`} key={item.id}>
                <div className="popular-image-wrap">{item.image01 ? <img src={item.image01} alt={item.title} /> : <div className="image-placeholder">🍕</div>}<span className="quick-badge">Popular</span></div>
                <div className="popular-copy"><h3>{item.title}</h3><p>{item.category || "Freshly prepared"}</p><div><strong>{currency(item.price)}</strong><span><FiStar /> 4.8</span></div></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="domino-section service-section">
        <div className="domino-container">
          <div className="section-heading"><div><span className="eyebrow">WHY NAJAF</span><h2>The useful stuff is built in</h2></div></div>
          <div className="service-grid">
            {serviceTiles.map(({ icon: Icon, title, text }) => (
              <div className="service-card" key={title}><div className="service-icon"><Icon /></div><h3>{title}</h3><p>{text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="domino-bottom-cta">
        <div className="domino-container bottom-cta-inner">
          <div><span className="eyebrow">READY WHEN YOU ARE</span><h2>Pick a meal. We'll handle the rest.</h2><p>Real accounts, real orders, real location data and live delivery updates.</p></div>
          <Link to="/pizzas" className="domino-primary">Start ordering <FiShoppingBag /></Link>
        </div>
      </section>
    </main>
  );
};

export default Home;
