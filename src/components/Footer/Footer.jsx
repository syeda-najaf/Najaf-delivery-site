import React from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiFacebook, FiInstagram, FiMapPin, FiPhone, FiTwitter } from "react-icons/fi";
import "../../styles/footer.css";

const Footer = () => (
  <footer className="najaf-footer">
    <div className="najaf-container">
      <div className="footer-top">
        <div className="footer-brand"><div className="footer-logo-row"><span className="footer-logo-mark"><span/><span/></span><strong>NAJAF</strong></div><p>Good food, focused delivery. Built around real ordering, real location and live tracking.</p><div className="footer-socials"><a href="#instagram" aria-label="Instagram"><FiInstagram/></a><a href="#facebook" aria-label="Facebook"><FiFacebook/></a><a href="#twitter" aria-label="Twitter"><FiTwitter/></a></div></div>
        <div className="footer-col"><h4>Explore</h4><Link to="/home">Home</Link><Link to="/pizzas">Menu</Link><Link to="/cart">Cart</Link><Link to="/location">Location</Link></div>
        <div className="footer-col"><h4>Orders</h4><Link to="/track-order">Track order</Link><Link to="/orders">Order history</Link><Link to="/account">My account</Link><Link to="/restaurant">Restaurant</Link></div>
        <div className="footer-col"><h4>Support</h4><a href="tel:+919876543210"><FiPhone/> +91 98765 43210</a><a href="#location"><FiMapPin/> Hyderabad, India</a><Link to="/home">Help center <FiArrowRight/></Link></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Najaf Food Center</span><span>Built for a production-style delivery experience</span></div>
    </div>
  </footer>
);

export default Footer;
