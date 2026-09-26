import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiChevronRight, FiHeart, FiMapPin, FiPackage, FiShield, FiUser } from "react-icons/fi";
import { clearSession, getSessionUser } from "../services/liveOrder";
import { getSavedLocation } from "../services/location";
import "./AccountPage.css";

const AccountPage = () => {
  const navigate = useNavigate();
  const user = getSessionUser();
  const location = getSavedLocation();
  if (!user) return <section className="account-page"><div className="account-empty"><div className="account-avatar"><FiUser/></div><h1>Welcome to Najaf</h1><p>Sign in to manage your account, saved location and orders.</p><Link to="/login" className="account-primary">Login</Link></div></section>;
  const signOut = () => { clearSession(); window.dispatchEvent(new Event("najaf-session-changed")); navigate("/home"); };
  return <section className="account-page"><div className="account-shell"><div className="account-banner"><div className="account-avatar"><FiUser/></div><div><span>NAJAF ACCOUNT</span><h1>{user.name}</h1><p>{user.email} {user.phone ? `· ${user.phone}` : ""}</p></div></div><div className="account-grid"><Link to="/orders" className="account-card"><div><FiPackage/><h3>Orders</h3><p>Track active deliveries and view order history.</p></div><FiChevronRight/></Link><Link to="/location" className="account-card"><div><FiMapPin/><h3>Delivery location</h3><p>{location?.displayName || "Set a location for faster checkout."}</p></div><FiChevronRight/></Link><Link to="/pizzas" className="account-card"><div><FiHeart/><h3>Favorites</h3><p>Keep your next comfort meal close at hand.</p></div><FiChevronRight/></Link><div className="account-card"><div><FiShield/><h3>Account security</h3><p>Your account uses the real backend login session.</p></div><span className="account-secure">Protected</span></div></div><button className="account-signout" type="button" onClick={signOut}>Sign out</button></div></section>;
};

export default AccountPage;
