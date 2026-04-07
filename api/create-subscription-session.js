import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 10,
        metadata: { supabase_user_id: userId },
      },
      payment_method_collection: 'always',
      success_url: `${origin}/admin/billing?success=1`,
      cancel_url: `${origin}/admin/billing`,
      metadata: { supabase_user_id: userId },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[stripe subscription]', err);
    res.status(500).json({ error: err.message });
  }
}
