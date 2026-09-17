import React, { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FiHeart, FiMapPin, FiMenu, FiSearch, FiShoppingBag, FiUser, FiX } from "react-icons/fi";
import { useSelector } from "react-redux";
import { getSavedLocation } from "../../services/location";
import { clearSession, getSessionUser } from "../../services/liveOrder";
import "../../styles/header.css";

const links = [
  { label: "Home", path: "/home" },
  { label: "Menu", path: "/pizzas" },
  { label: "Offers", path: "/home#offers" },
  { label: "Track", path: "/track-order" },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(getSessionUser());
  const [savedLocation, setSavedLocation] = useState(getSavedLocation());

  useEffect(() => {
    const sync = () => {
      setUser(getSessionUser());
      setSavedLocation(getSavedLocation());
    };
    window.addEventListener("najaf-session-changed", sync);
    window.addEventListener("najaf-location-changed", sync);
    return () => {
      window.removeEventListener("najaf-session-changed", sync);
      window.removeEventListener("najaf-location-changed", sync);
    };
  }, []);

  useEffect(() => setOpen(false), [location.pathname, location.search]);

  const shortLocation = savedLocation?.displayName
    ? savedLocation.displayName.split(",").slice(0, 2).join(",")
    : "Set location";

  function signOut() {
    clearSession();
    window.dispatchEvent(new Event("najaf-session-changed"));
    navigate("/home");
  }

  return (
    <header className="najaf-header">
      <div className="najaf-topbar">
        <div className="najaf-container najaf-topbar-inner">
          <button className="najaf-delivery-loc" type="button" onClick={() => navigate("/location")}>
            <FiMapPin />
            <span><small>DELIVER TO</small><strong>{shortLocation}</strong></span>
          </button>
          <div className="najaf-top-links"><span>Freshly prepared</span><span>Live tracking</span><span>Secure checkout</span></div>
        </div>
      </div>

      <div className="najaf-mainbar">
        <div className="najaf-container najaf-mainbar-inner">
          <button className="najaf-logo" type="button" onClick={() => navigate("/home")} aria-label="Najaf home">
            <span className="najaf-logo-mark"><span /><span /></span>
            <span><strong>NAJAF</strong><small>FOOD CENTER</small></span>
          </button>

          <nav className={`najaf-nav ${open ? "open" : ""}`} aria-label="Primary navigation">
            <div className="najaf-mobile-nav-head"><span>Menu</span><button type="button" onClick={() => setOpen(false)}><FiX /></button></div>
            {links.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => isActive ? "active" : ""}>{item.label}</NavLink>
            ))}
            <button className="mobile-location-link" type="button" onClick={() => navigate("/location")}><FiMapPin /> Delivery location</button>
            <button className="mobile-profile-link" type="button" onClick={() => navigate(user ? "/account" : "/login")}><FiUser /> {user ? "My account" : "Login"}</button>
          </nav>

          <div className="najaf-nav-actions">
            <button type="button" className="icon-button desktop-only" onClick={() => navigate("/pizzas")} aria-label="Search"><FiSearch /></button>
            <button type="button" className="icon-button desktop-only" onClick={() => navigate("/account")} aria-label="Account"><FiUser /></button>
            <button type="button" className="icon-button desktop-only" onClick={() => navigate("/pizzas")} aria-label="Favorites"><FiHeart /></button>
            <button type="button" className="cart-button" onClick={() => navigate("/cart")} aria-label="Cart"><FiShoppingBag /><span>{totalQuantity}</span></button>
            <button type="button" className="mobile-menu-button" onClick={() => setOpen(true)} aria-label="Open menu"><FiMenu /></button>
            {user && <button type="button" className="signout-button" onClick={signOut}>Sign out</button>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
