const Razorpay = require('razorpay');
const { authenticate, json, methodGuard } = require('./_supabase');

function calculate(items, catalog) {
  const lookup = new Map(catalog.map((item) => [String(item.id), item]));
  let subtotal = 0;
  const normalized = [];
  for (const raw of items || []) {
    const item = lookup.get(String(raw.id));
    const quantity = Math.max(1, Math.min(20, Number(raw.quantity) || 1));
    if (!item) throw new Error(`Unknown menu item: ${raw.id}`);
    subtotal += item.price * quantity;
    normalized.push({ menu_item_id: item.id, name: item.name, unit_price: item.price, quantity });
  }
  if (!normalized.length) throw new Error('Cart is empty');
  const deliveryFee = subtotal >= 699 ? 0 : 39;
  return { subtotal, deliveryFee, total: subtotal + deliveryFee, normalized };
}

module.exports = async (req, res) => {
  if (methodGuard(req, res)) return;
  try {
    const { client, user } = await authenticate(req);
    const { items, address, destination } = req.body || {};
    if (!address) return json(res, 400, { error: 'Delivery address is required.' });

    const ids = (items || []).map((item) => Number(item.id)).filter(Number.isFinite);
    const { data: catalog, error: catalogError } = await client
      .from('menu_items')
      .select('id,name,price')
      .in('id', ids);
    if (catalogError) throw catalogError;

    const totals = calculate(items, catalog || []);
    const { data: created, error: orderError } = await client
      .from('orders')
      .insert({
        user_id: user.id,
        status: 'payment_pending',
        payment_status: 'created',
        subtotal: totals.subtotal,
        delivery_fee: totals.deliveryFee,
        total: totals.total,
        address_snapshot: { text: address, ...destination },
        destination_lat: destination?.lat || null,
        destination_lng: destination?.lng || null,
        eta_minutes: 30,
      })
      .select()
      .single();
    if (orderError) throw orderError;

    const { error: itemError } = await client.from('order_items').insert(
      totals.normalized.map((item) => ({ ...item, order_id: created.id }))
    );
    if (itemError) throw itemError;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) throw new Error('Razorpay keys are not configured on the server.');

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const rpOrder = await razorpay.orders.create({
      amount: totals.total * 100,
      currency: 'INR',
      receipt: `najaf_${created.id.replace(/-/g, '').slice(0, 32)}`,
      notes: { supabase_order_id: created.id, user_id: user.id },
    });

    const { error: updateError } = await client
      .from('orders')
      .update({ razorpay_order_id: rpOrder.id, status_updated_at: new Date().toISOString() })
      .eq('id', created.id)
      .eq('user_id', user.id);
    if (updateError) throw updateError;

    return json(res, 200, {
      dbOrderId: created.id,
      razorpayOrderId: rpOrder.id,
      keyId,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      total: totals.total,
    });
  } catch (error) {
    console.error(error);
    return json(res, error.status || 500, { error: error.message || 'Unable to create payment order.' });
  }
};
