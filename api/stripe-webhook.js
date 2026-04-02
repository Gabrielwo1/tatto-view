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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('[webhook] signature error:', err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      // Checkout completo → subscription criada
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription') break;
        const userId = session.metadata?.supabase_user_id;
        await updateSubscription(userId, {
          status: 'active',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
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
        // Ignorar eventos não tratados
        break;
    }
  } catch (err) {
    console.error('[webhook] handler error:', err);
  }

  res.status(200).json({ received: true });
}

// Vercel precisa do body bruto para validar assinatura do Stripe
export const config = { api: { bodyParser: false } };
