import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PLAN_PRICE_BRL_CENTS = 3990; // R$39,90
const PLAN_NAME = 'Vitrink — Plano Mensal';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId e email são obrigatórios' });
  }

  const origin = req.headers.origin || process.env.VITE_SITE_URL || 'https://eldude.vitrink.app';

  try {
    // Find or create Stripe customer
    let customerId;
    const existing = await stripe.customers.list({ email, limit: 1 });
    if (existing.data.length > 0) {
      customerId = existing.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: { supabase_user_id: userId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: PLAN_NAME,
              description: 'Acesso completo à plataforma Vitrink para seu estúdio de tatuagem.',
            },
            unit_amount: PLAN_PRICE_BRL_CENTS,
            recurring: { interval: 'month' },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/admin/assinatura?status=sucesso&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/admin/assinatura?status=cancelado`,
      metadata: { supabase_user_id: userId },
      subscription_data: {
        metadata: { supabase_user_id: userId },
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[stripe-subscription]', err);
    res.status(500).json({ error: err.message });
  }
}
