import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { resolvePlan } from './plans.js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const RESERVED = ['www', 'api', 'admin', 'app', 'mail', 'vitrink', 'eldude', 'static', 'cdn', 'help', 'support'];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { studioName, subdomain, email, planKey } = req.body ?? {};

  if (!studioName || !subdomain || !email) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  // Validate subdomain: 3-30 chars, lowercase letters, numbers, hyphens
  if (!/^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/.test(subdomain)) {
    return res.status(400).json({
      error: 'Subdomínio inválido. Use 3–30 caracteres: apenas letras minúsculas, números e hífen.',
    });
  }

  if (RESERVED.includes(subdomain)) {
    return res.status(400).json({ error: 'Este subdomínio é reservado. Escolha outro.' });
  }

  // Check subdomain availability
  const { data: existing } = await supabase
    .from('studios')
    .select('id')
    .eq('id', subdomain)
    .maybeSingle();

  if (existing) {
    return res.status(400).json({ error: 'Este subdomínio já está em uso. Escolha outro.' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Configuração de pagamento ausente.' });
  }

  const plan = resolvePlan(planKey);

  if (!plan.priceId) {
    console.error(`[create-studio-checkout] Missing price ID for plan "${plan.key}" (env: ${plan.envVar})`);
    return res.status(500).json({ error: `Preço não configurado para o plano "${plan.key}"` });
  }

  const origin = req.headers.origin || 'https://vitrink.app';

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: plan.priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: 20,
        metadata: {
          type: 'studio_creation',
          studio_name: studioName,
          subdomain,
          email,
          plan_key: plan.key,
          max_artists: String(plan.maxArtists),
        },
      },
      payment_method_collection: 'always',
      success_url: `${origin}/checkout/studio-sucesso?subdomain=${subdomain}`,
      cancel_url: `${origin}/criar-studio`,
      metadata: {
        type: 'studio_creation',
        studio_name: studioName,
        subdomain,
        email,
        plan_key: plan.key,
        max_artists: String(plan.maxArtists),
      },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('[create-studio-checkout]', err);
    return res.status(500).json({ error: 'Erro ao criar sessão de pagamento.' });
  }
}
