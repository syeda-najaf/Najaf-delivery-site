const express = require("express");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

function canSee(order, user) {
  return (
    order.customer?.toString() === user.id ||
    order.restaurant?.toString() === user.id ||
    order.deliveryPartner?.toString() === user.id ||
    user.role === "admin"
  );
}

router.post("/", auth, async (req, res) => {
  try {
    const { items, total, address, paymentMethod = "cod", restaurant } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order must contain items" });
    }
    if (!address?.line1) {
      return res.status(400).json({ message: "Delivery address is required" });
    }

    const order = await Order.create({
      customer: req.user.id,
      restaurant: restaurant && mongoose.isValidObjectId(restaurant) ? restaurant : null,
      items,
      total: Number(total) || 0,
      address,
      paymentMethod
    });

    const io = req.app.get("io");
    io.to("role:restaurant").emit("order-created", order);

    res.status(201).json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const filter =
      req.user.role === "customer"
        ? { customer: req.user.id }
        : req.user.role === "restaurant"
        ? { restaurant: req.user.id }
        : req.user.role === "delivery"
        ? { deliveryPartner: req.user.id }
        : {};

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canSee(order, req.user)) return res.status(403).json({ message: "Access denied" });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "accepted", "preparing", "ready", "assigned",
      "picked_up", "on_the_way", "delivered", "cancelled"
    ];

    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!canSee(order, req.user)) return res.status(403).json({ message: "Access denied" });

    order.status = status;
    order.statusHistory.push({ status, at: new Date() });
    await order.save();

    const io = req.app.get("io");
    io.to(`order:${order._id}`).emit("order-status", {
      orderId: order._id,
      status,
      order
    });

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/:id/assign", auth, async (req, res) => {
  try {
    if (!["restaurant", "admin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Only restaurant/admin can assign a rider" });
    }

    const { deliveryPartnerId } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.deliveryPartner = deliveryPartnerId || null;
    order.status = "assigned";
    order.statusHistory.push({ status: "assigned", at: new Date() });
    await order.save();

    const io = req.app.get("io");
    io.to(`order:${order._id}`).emit("order-status", {
      orderId: order._id,
      status: order.status,
      order
    });
    io.to("role:delivery").emit("delivery-assignment", order);

    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
