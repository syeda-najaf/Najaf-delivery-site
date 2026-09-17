const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("najaf_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("najaf_token");
      localStorage.removeItem("najaf_user");
    }
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const api = {
  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  me: () => request("/auth/me"),

  createOrder: (body) =>
    request("/orders", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getOrders: () => request("/orders"),

  getOrder: (id) => request(`/orders/${id}`),

  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  assignDelivery: (id, deliveryPartnerId) =>
    request(`/orders/${id}/assign`, {
      method: "PATCH",
      body: JSON.stringify({ deliveryPartnerId }),
    }),

  setDeliveryOnline: (online) =>
    request("/delivery/online", {
      method: "PATCH",
      body: JSON.stringify({ online }),
    }),

  updateDeliveryLocation: (body) =>
    request("/delivery/location", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getAvailableDeliveryPartners: () => request("/delivery/available"),
};

export { API_URL };
