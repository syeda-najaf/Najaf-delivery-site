const crypto = require('crypto');
const { authenticate, json, methodGuard } = require('./_supabase');

module.exports = async (req, res) => {
  if (methodGuard(req, res)) return;
  try {
    const { client, user } = await authenticate(req);
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return json(res, 400, { error: 'Missing Razorpay payment fields.' });

    const { data: order, error: findError } = await client.from('orders')
      .select('id,user_id,razorpay_order_id,total')
      .eq('user_id', user.id)
      .eq('razorpay_order_id', razorpay_order_id)
      .single();
    if (findError || !order) return json(res, 404, { error: 'Payment order not found.' });

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) throw new Error('Razorpay secret is not configured on the server.');
    const generated = crypto.createHmac('sha256', secret).update(`${order.razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (generated !== razorpay_signature) return json(res, 400, { error: 'Payment signature verification failed.' });

    const { data: updated, error: updateError } = await client.from('orders').update({
      razorpay_payment_id,
      payment_status: 'captured',
      status: 'confirmed',
      status_updated_at: new Date().toISOString(),
    }).eq('id', order.id).eq('user_id', user.id).select().single();
    if (updateError) throw updateError;

    await client.from('order_events').insert({ order_id: order.id, event_type: 'payment_captured', message: `Payment ${razorpay_payment_id} captured.` });
    return json(res, 200, { ok: true, order: updated });
  } catch (error) {
    console.error(error);
    return json(res, error.status || 500, { error: error.message || 'Unable to verify payment.' });
  }
};
