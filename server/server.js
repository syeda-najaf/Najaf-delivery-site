const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");

dotenv.config();

const authRoutes = require("./routes/auth");
const orderRoutes = require("./routes/orders");
const deliveryRoutes = require("./routes/delivery");

const app = express();
const httpServer = http.createServer(app);

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((item) => item.trim());

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "Najaf Delivery API",
    message: "Backend is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/delivery", deliveryRoutes);

io.on("connection", (socket) => {
  socket.on("join-order", (orderId) => {
    if (orderId) socket.join(`order:${orderId}`);
  });

  socket.on("join-role", (role) => {
    if (role) socket.join(`role:${role}`);
  });

  socket.on("disconnect", () => {});
});

app.set("io", io);

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in server/.env");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    httpServer.listen(PORT, () => {
      console.log(`Najaf Delivery API running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

start();
