import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'userId é obrigatório' });
  }

  const origin = req.headers.origin || process.env.VITE_SITE_URL || 'https://eldude.vitrink.app';

  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (error || !profile?.stripe_customer_id) {
      return res.status(400).json({ error: 'Cliente Stripe não encontrado' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: `${origin}/admin/billing`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (err) {
    console.error('[billing portal]', err);
    res.status(500).json({ error: err.message });
  }
}
