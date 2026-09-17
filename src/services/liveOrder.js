import { api } from "./api";
import { socket } from "./socket";

export function saveSession(data) {
  localStorage.setItem("najaf_token", data.token);
  localStorage.setItem("najaf_user", JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem("najaf_token");
  localStorage.removeItem("najaf_user");
}

export function getSessionUser() {
  try {
    return JSON.parse(localStorage.getItem("najaf_user") || "null");
  } catch {
    return null;
  }
}

export async function refreshSession() {
  const token = localStorage.getItem("najaf_token");
  if (!token) return null;

  try {
    const response = await api.me();
    localStorage.setItem("najaf_user", JSON.stringify(response.user));
    return response.user;
  } catch {
    clearSession();
    return null;
  }
}

export async function placeOrderFromCart(cartItems, address) {
  const items = cartItems.map((item) => ({
    productId: item.id || item.productId || "",
    name: item.title || item.name || "Food item",
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    image: item.image01 || item.image || "",
  }));

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return api.createOrder({
    items,
    total,
    address,
    paymentMethod: "cod",
  });
}

export function subscribeToOrder(orderId, handlers = {}) {
  if (!orderId) return () => {};

  socket.emit("join-order", orderId);

  const statusHandler = (payload) => {
    if (handlers.onStatus) handlers.onStatus(payload);
  };

  const locationHandler = (payload) => {
    if (handlers.onLocation) handlers.onLocation(payload);
  };

  socket.on("order-status", statusHandler);
  socket.on("rider-location", locationHandler);

  return () => {
    socket.off("order-status", statusHandler);
    socket.off("rider-location", locationHandler);
  };
}

export function joinRole(role) {
  if (!role) return;
  socket.emit("join-role", role);
}

export async function startDeliveryLocationSharing(orderId) {
  if (!navigator.geolocation) {
    throw new Error("This browser does not support GPS location.");
  }

  return new Promise((resolve) => {
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        if (orderId) {
          try {
            await api.updateDeliveryLocation({
              orderId,
              lat: coords.lat,
              lng: coords.lng,
            });
          } catch (error) {
            console.error("Location update failed:", error);
          }
        }
      },
      (error) => {
        console.error("GPS error:", error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      }
    );

    resolve(() => navigator.geolocation.clearWatch(watchId));
  });
}
