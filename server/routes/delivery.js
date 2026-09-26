const express = require("express");
const User = require("../models/User");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

const router = express.Router();

router.patch("/online", auth, async (req, res) => {
  if (req.user.role !== "delivery") {
    return res.status(403).json({ message: "Delivery partner account required" });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isOnline: Boolean(req.body.online) },
    { new: true }
  );

  res.json({ online: user.isOnline });
});

router.patch("/location", auth, async (req, res) => {
  try {
    if (req.user.role !== "delivery") {
      return res.status(403).json({ message: "Delivery partner account required" });
    }

    const lat = Number(req.body.lat);
    const lng = Number(req.body.lng);
    const { orderId } = req.body;

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return res.status(400).json({ message: "Valid lat and lng are required" });
    }

    await User.findByIdAndUpdate(req.user.id, {
      location: { lat, lng }
    });

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.deliveryPartner?.toString() === req.user.id) {
        order.riderLocation = { lat, lng };
        order.status = ["assigned", "picked_up"].includes(order.status)
          ? "on_the_way"
          : order.status;
        order.statusHistory.push({ status: order.status, at: new Date() });
        await order.save();

        req.app.get("io").to(`order:${order._id}`).emit("rider-location", {
          orderId: order._id,
          lat,
          lng,
          status: order.status
        });
      }
    }

    res.json({ ok: true, lat, lng });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/available", auth, async (req, res) => {
  if (!["restaurant", "admin"].includes(req.user.role)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const partners = await User.find({
    role: "delivery",
    isOnline: true
  }).select("_id name phone location isOnline");

  res.json({ partners });
});

module.exports = router;
