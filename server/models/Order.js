const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, default: "" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String, default: "" }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    items: { type: [orderItemSchema], required: true },
    total: { type: Number, required: true, min: 0 },
    address: {
      label: { type: String, default: "" },
      line1: { type: String, required: true },
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      default: "cod"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending"
    },
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "ready",
        "assigned",
        "picked_up",
        "on_the_way",
        "delivered",
        "cancelled"
      ],
      default: "placed"
    },
    riderLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    etaMinutes: { type: Number, default: null },
    statusHistory: [
      {
        status: String,
        at: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

orderSchema.pre("validate", function(next) {
  if (!this.statusHistory || this.statusHistory.length === 0) {
    this.statusHistory = [{ status: this.status, at: new Date() }];
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
