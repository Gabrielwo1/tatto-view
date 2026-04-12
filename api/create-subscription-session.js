import Stripe from 'stripe';
import { resolvePlan } from './plans.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email, planKey } = req.body;

  if (!userId || !email) {
    return res.status(400).json({ error: 'userId e email são obrigatórios' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('[stripe] Missing STRIPE_SECRET_KEY');
    return res.status(500).json({ error: 'Configuração de pagamento faltando (STRIPE_SECRET_KEY)' });
  }

  const plan = resolvePlan(planKey);

  if (!plan.priceId) {
    console.error(`[stripe] Missing price ID for plan "${plan.key}" (env: ${plan.envVar})`);
    return res.status(500).json({ error: `Preço não configurado para o plano "${plan.key}"` });
  }

  const origin = req.headers.origin || process.env.VITE_SITE_URL || 'https://eldude.vitrink.app';

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 20,
        metadata: {
          supabase_user_id: userId,
          plan_key: plan.key,
          max_artists: String(plan.maxArtists),
        },
      },
      payment_method_collection: 'always',
      success_url: `${origin}/admin/billing?success=1`,
      cancel_url: `${origin}/admin/billing`,
      metadata: {
        supabase_user_id: userId,
        plan_key: plan.key,
        max_artists: String(plan.maxArtists),
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[stripe subscription]', err);
    res.status(500).json({ error: err.message });
  }
}
