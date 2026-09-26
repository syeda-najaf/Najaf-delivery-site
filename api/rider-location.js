const { getServiceClient, json, methodGuard } = require('./_supabase');

module.exports = async (req, res) => {
  if (methodGuard(req, res)) return;
  try {
    const expected = process.env.RIDER_API_TOKEN;
    const provided = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!expected || !provided || provided !== expected) return json(res, 401, { error: 'Unauthorized rider client.' });
    const { order_id, lat, lng, heading, eta_minutes, status } = req.body || {};
    if (!order_id || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return json(res, 400, { error: 'order_id, lat and lng are required.' });
    const client = getServiceClient();
    const patch = {
      rider_lat: Number(lat),
      rider_lng: Number(lng),
      rider_heading: Number.isFinite(Number(heading)) ? Number(heading) : null,
      eta_minutes: Number.isFinite(Number(eta_minutes)) ? Number(eta_minutes) : undefined,
      status: status || undefined,
      status_updated_at: new Date().toISOString(),
    };
    Object.keys(patch).forEach((key) => patch[key] === undefined && delete patch[key]);
    const { data, error } = await client.from('orders').update(patch).eq('id', order_id).select().single();
    if (error) throw error;
    await client.from('order_events').insert({ order_id, event_type: 'rider_location', message: `Rider location updated to ${lat}, ${lng}.` });
    return json(res, 200, { ok: true, order: data });
  } catch (error) {
    console.error(error);
    return json(res, error.status || 500, { error: error.message || 'Unable to update rider location.' });
  }
};
