import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email, items } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Carrinho vazio' });
  }

  const origin = req.headers.origin || process.env.VITE_SITE_URL || 'https://eldude.vitrink.app';

  try {
    const lineItems = items.map((item) => ({
      price_data: {
        currency: 'brl',
        product_data: {
          name: item.itemType === 'tattoo'
            ? `Reserva: ${item.name}`
            : item.name,
          images: item.image ? [item.image] : [],
          metadata: { itemType: item.itemType, itemId: item.itemId },
        },
        unit_amount: item.priceCents,
      },
      quantity: 1,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${origin}/checkout/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/carrinho`,
      metadata: {
        userId,
        items: JSON.stringify(items.map((i) => ({ itemType: i.itemType, itemId: i.itemId }))),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[stripe]', err);
    res.status(500).json({ error: err.message });
  }
}
