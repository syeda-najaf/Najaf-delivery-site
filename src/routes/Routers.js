import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Pizzas from "../pages/Pizzas";
import PizzaDetails from "../pages/PizzaDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import OrderTracking from "../pages/OrderTracking";
import AuthPage from "../pages/AuthPage";
import LocationPicker from "../pages/LocationPicker";
import RestaurantDashboard from "../pages/RestaurantDashboard";
import DeliveryDashboard from "../pages/DeliveryDashboard";
import OrderHistory from "../pages/OrderHistory";
import AccountPage from "../pages/AccountPage";

const Routers = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="/home" element={<Home />} />
    <Route path="/pizzas" element={<Pizzas />} />
    <Route path="/pizzas/:id" element={<PizzaDetails />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/checkout" element={<Checkout />} />
    <Route path="/login" element={<AuthPage />} />
    <Route path="/location" element={<LocationPicker />} />
    <Route path="/track-order" element={<OrderTracking />} />
    <Route path="/track-order/:id" element={<OrderTracking />} />
    <Route path="/orders" element={<OrderHistory />} />
    <Route path="/account" element={<AccountPage />} />
    <Route path="/restaurant" element={<RestaurantDashboard />} />
    <Route path="/delivery" element={<DeliveryDashboard />} />
    <Route path="*" element={<Navigate to="/home" replace />} />
  </Routes>
);

export default Routers;
