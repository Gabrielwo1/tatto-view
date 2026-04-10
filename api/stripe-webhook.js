import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Service role key bypasses RLS — nunca exponha no frontend
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function updateSubscription(userId, { status, stripeCustomerId, stripeSubscriptionId }) {
  if (!userId) return;
  const update = { subscription_status: status };
  if (stripeCustomerId)    update.stripe_customer_id    = stripeCustomerId;
  if (stripeSubscriptionId) update.stripe_subscription_id = stripeSubscriptionId;
  const { error } = await supabase
    .from('user_profiles')
    .update(update)
    .eq('id', userId);
  if (error) console.error('[webhook] updateSubscription error:', error);
}

async function getUserIdFromCustomer(customerId) {
  const { data } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single();
  return data?.id ?? null;
}

async function handleStudioCreation(session) {
  const { studio_name, subdomain, email } = session.metadata ?? {};
  if (!subdomain || !email) {
    console.error('[webhook] studio_creation: missing metadata', session.metadata);
    return;
  }

  // 1. Create Supabase auth user (service role bypasses email confirmation)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    password: crypto.randomUUID(), // temporary — overwritten by password recovery flow
  });

  if (authError) {
    // If user already exists (retry scenario), fetch their id
    if (!authError.message?.includes('already')) {
      console.error('[webhook] createUser error:', authError);
      return;
    }
  }

  const userId = authData?.user?.id;
  if (!userId) {
    console.error('[webhook] Could not get userId for', email);
    return;
  }

  const trialEndsAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

  // 2. Create studio entry
  const { error: studioError } = await supabase.from('studios').upsert({
    id: subdomain,
    name: studio_name ?? subdomain,
    domain: `${subdomain}.vitrink.app`,
  }, { onConflict: 'id', ignoreDuplicates: true });

  if (studioError) console.error('[webhook] studios upsert error:', studioError);

  // 3. Create user_profiles with trialing subscription
  const { error: profileError } = await supabase.from('user_profiles').upsert({
    id: userId,
    role: 'admin',
    studio_id: subdomain,
    artist_id: null,
    subscription_status: 'trialing',
    trial_ends_at: trialEndsAt,
    stripe_customer_id: session.customer,
    stripe_subscription_id: session.subscription,
  }, { onConflict: 'id' });

  if (profileError) console.error('[webhook] user_profiles upsert error:', profileError);

  // 4. Send password recovery email so the user can set their own password
  const { error: recoveryError } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `https://${subdomain}.vitrink.app/admin/reset-password`,
    },
  });

  if (recoveryError) console.error('[webhook] generateLink error:', recoveryError);

  console.log(`[webhook] Studio "${subdomain}" created for ${email}, trial until ${trialEndsAt}`);
}

async function handleOneTimePayment(session) {
  const userId = session.metadata?.userId;
  const items = JSON.parse(session.metadata?.items || '[]');
  console.log('[webhook] Processing items for user:', userId, items);

  // 1. Marcar tatuagens como arquivadas (vendidas)
  for (const item of items) {
    if (item.itemType === 'tattoo') {
      await supabase
        .from('tattoos')
        .update({ status: 'archived' })
        .eq('id', item.itemId);
    }
  }

  // 2. Limpar carrinho no Supabase
  if (userId) {
    const { error: cartError } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    
    if (cartError) console.error('[webhook] Error clearing cart:', cartError);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const buf = await new Promise((resolve, reject) => {
    let rawData = '';
    req.on('data', chunk => rawData += chunk);
    req.on('end', () => resolve(rawData));
    req.on('error', err => reject(err));
  });

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      // Checkout completo
      case 'checkout.session.completed': {
        const session = event.data.object;

        if (session.mode === 'subscription' && session.metadata?.type === 'studio_creation') {
          // New studio onboarding via vitrink.app
          await handleStudioCreation(session);
        } else if (session.mode === 'subscription') {
          // Existing studio activating/reactivating a plan
          const userId = session.metadata?.supabase_user_id;
          await updateSubscription(userId, {
            status: 'active',
            stripeCustomerId: session.customer,
            stripeSubscriptionId: session.subscription,
          });
        } else if (session.mode === 'payment') {
          await handleOneTimePayment(session);
        }
        break;
      }

      // Renovação bem-sucedida / mudança de status
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const userId = sub.metadata?.supabase_user_id ?? await getUserIdFromCustomer(sub.customer);
        const statusMap = {
          active:    'active',
          past_due:  'past_due',
          canceled:  'canceled',
          unpaid:    'unpaid',
          trialing:  'trialing',
        };
        await updateSubscription(userId, {
          status: statusMap[sub.status] ?? sub.status,
          stripeSubscriptionId: sub.id,
          stripeCustomerId: sub.customer,
        });
        break;
      }

      // Subscription cancelada/expirada
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.supabase_user_id ?? await getUserIdFromCustomer(sub.customer);
        await updateSubscription(userId, {
          status: 'canceled',
          stripeSubscriptionId: sub.id,
        });
        break;
      }

      // Cobrança falhou
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const userId = await getUserIdFromCustomer(invoice.customer);
        await updateSubscription(userId, { status: 'past_due' });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error('[webhook] handler error:', err);
  }

  res.status(200).json({ received: true });
}

// Vercel precisa do body bruto para validar assinatura do Stripe
export const config = { api: { bodyParser: false } };
