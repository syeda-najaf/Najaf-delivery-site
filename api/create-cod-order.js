const { authenticate, json, methodGuard } = require('./_supabase');

module.exports = async (req, res) => {
  if (methodGuard(req, res)) return;
  try {
    const { client, user } = await authenticate(req);
    const { items, address, destination } = req.body || {};
    if (!address || !Array.isArray(items) || !items.length) return json(res, 400, { error: 'Address and cart are required.' });

    const ids = items.map((item) => Number(item.id)).filter(Number.isFinite);
    const { data: catalog, error: catalogError } = await client.from('menu_items').select('id,name,price').in('id', ids);
    if (catalogError) throw catalogError;
    const lookup = new Map((catalog || []).map((item) => [String(item.id), item]));
    let subtotal = 0;
    const normalized = [];
    for (const raw of items) {
      const item = lookup.get(String(raw.id));
      const quantity = Math.max(1, Math.min(20, Number(raw.quantity) || 1));
      if (!item) throw new Error(`Unknown menu item: ${raw.id}`);
      subtotal += item.price * quantity;
      normalized.push({ menu_item_id: item.id, name: item.name, unit_price: item.price, quantity });
    }
    const deliveryFee = subtotal >= 699 ? 0 : 39;
    const total = subtotal + deliveryFee;

    const { data: order, error: orderError } = await client.from('orders').insert({
      user_id: user.id,
      status: 'confirmed',
      payment_status: 'cod_pending',
      subtotal,
      delivery_fee: deliveryFee,
      total,
      address_snapshot: { text: address, ...destination },
      destination_lat: destination?.lat || null,
      destination_lng: destination?.lng || null,
      eta_minutes: 35,
    }).select().single();
    if (orderError) throw orderError;

    const { error: itemError } = await client.from('order_items').insert(normalized.map((item) => ({ ...item, order_id: order.id })));
    if (itemError) throw itemError;
    await client.from('order_events').insert({ order_id: order.id, event_type: 'order_confirmed', message: 'Cash on delivery order confirmed.' });

    return json(res, 200, { dbOrderId: order.id, total });
  } catch (error) {
    console.error(error);
    return json(res, error.status || 500, { error: error.message || 'Unable to create COD order.' });
  }
};
