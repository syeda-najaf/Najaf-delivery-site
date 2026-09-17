import { requireSupabase } from './supabase';

async function parseResponse(response) {
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { error: text || 'Unexpected server response' }; }
  if (!response.ok) throw new Error(payload.error || payload.message || `Request failed (${response.status})`);
  return payload;
}

export async function getAccessToken() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (!data.session?.access_token) throw new Error('Please sign in again before continuing.');
  return data.session.access_token;
}

export async function createRazorpayOrder({ items, address, destination }) {
  const token = await getAccessToken();
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, address, destination }),
  });
  return parseResponse(response);
}

export async function createCodOrder({ items, address, destination }) {
  const token = await getAccessToken();
  const response = await fetch('/api/create-cod-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, address, destination }),
  });
  return parseResponse(response);
}

export async function verifyRazorpayPayment(payload) {
  const token = await getAccessToken();
  const response = await fetch('/api/verify-razorpay-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
}

export async function loadRazorpayScript() {
  if (window.Razorpay) return true;
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-razorpay-checkout]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', reject);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Razorpay Checkout could not be loaded. Check your internet connection.'));
    document.body.appendChild(script);
  });
  return true;
}

export async function geocodeAddress(address) {
  const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  const q = encodeURIComponent(address);
  const url = `https://api.mapbox.com/search/geocode/v6/forward?q=${q}&country=IN&limit=1&access_token=${token}`;
  const response = await fetch(url);
  const data = await parseResponse(response);
  const feature = data.features?.[0];
  if (!feature?.geometry?.coordinates) return null;
  const [lng, lat] = feature.geometry.coordinates;
  return { lat, lng, label: feature.properties?.full_address || feature.properties?.name || address };
}

export async function reverseGeocode({ lat, lng }) {
  const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
  if (!token) return null;
  const url = `https://api.mapbox.com/search/geocode/v6/reverse?longitude=${encodeURIComponent(lng)}&latitude=${encodeURIComponent(lat)}&access_token=${token}`;
  const response = await fetch(url);
  const data = await parseResponse(response);
  const feature = data.features?.[0];
  return feature?.properties?.full_address || feature?.properties?.name || feature?.place_name || null;
}

export async function fetchMyOrders() {
  const client = requireSupabase();
  const { data, error } = await client
    .from('orders')
    .select('*,order_items(*)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertProfile({ userId, fullName, phone }) {
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .upsert({ id: userId, full_name: fullName, phone, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
