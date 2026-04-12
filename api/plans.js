/**
 * Tiered pricing plans — shared config between API handlers.
 *
 * Each plan supports three currencies (BRL, USD, EUR).
 * Price IDs are read from environment variables at runtime.
 *
 * Plans:
 *   starter  → 1 artist   → R$29,90 / $5,99 / €4,99
 *   duo      → 2 artists  → R$39,90 / $7,99 / €6,99
 *   trio     → 3 artists  → R$49,90 / $9,99 / €8,99
 *   studio   → 4 artists  → R$59,90 / $11,99 / €10,99
 *   pro      → 5 artists  → R$69,90 / $13,99 / €12,99
 *   agency   → 15 artists → R$149,90 / $27,99 / €24,99
 */

export const PLANS = {
  starter: {
    key: 'starter',
    maxArtists: 1,
    prices: {
      brl: { get id() { return process.env.STRIPE_PRICE_STARTER_BRL; } },
      usd: { get id() { return process.env.STRIPE_PRICE_STARTER_USD; } },
      eur: { get id() { return process.env.STRIPE_PRICE_STARTER_EUR; } },
    },
  },
  duo: {
    key: 'duo',
    maxArtists: 2,
    prices: {
      brl: { get id() { return process.env.STRIPE_PRICE_DUO_BRL; } },
      usd: { get id() { return process.env.STRIPE_PRICE_DUO_USD; } },
      eur: { get id() { return process.env.STRIPE_PRICE_DUO_EUR; } },
    },
  },
  trio: {
    key: 'trio',
    maxArtists: 3,
    prices: {
      brl: { get id() { return process.env.STRIPE_PRICE_TRIO_BRL; } },
      usd: { get id() { return process.env.STRIPE_PRICE_TRIO_USD; } },
      eur: { get id() { return process.env.STRIPE_PRICE_TRIO_EUR; } },
    },
  },
  studio: {
    key: 'studio',
    maxArtists: 4,
    prices: {
      brl: { get id() { return process.env.STRIPE_PRICE_STUDIO_PLAN_BRL; } },
      usd: { get id() { return process.env.STRIPE_PRICE_STUDIO_PLAN_USD; } },
      eur: { get id() { return process.env.STRIPE_PRICE_STUDIO_PLAN_EUR; } },
    },
  },
  pro: {
    key: 'pro',
    maxArtists: 5,
    prices: {
      brl: { get id() { return process.env.STRIPE_PRICE_PRO_BRL; } },
      usd: { get id() { return process.env.STRIPE_PRICE_PRO_USD; } },
      eur: { get id() { return process.env.STRIPE_PRICE_PRO_EUR; } },
    },
  },
  agency: {
    key: 'agency',
    maxArtists: 15,
    prices: {
      brl: { get id() { return process.env.STRIPE_PRICE_AGENCY_BRL; } },
      usd: { get id() { return process.env.STRIPE_PRICE_AGENCY_USD; } },
      eur: { get id() { return process.env.STRIPE_PRICE_AGENCY_EUR; } },
    },
  },
};

/** Default plan when none is specified. */
export const DEFAULT_PLAN_KEY = 'starter';

/**
 * Resolve a plan from a plan key string.
 * Falls back to the default plan if the key is unknown.
 */
export function resolvePlan(planKey) {
  return PLANS[planKey] ?? PLANS[DEFAULT_PLAN_KEY];
}

/**
 * Resolve the Stripe Price ID for a given plan and currency.
 * Falls back to BRL if the requested currency is not configured.
 */
export function resolvePriceId(planKey, currency = 'brl') {
  const plan = resolvePlan(planKey);
  const curr = (currency ?? 'brl').toLowerCase();
  return plan.prices[curr]?.id ?? plan.prices.brl?.id ?? null;
}

/**
 * Resolve a plan from a Stripe Price ID (any currency).
 * Used in the webhook to determine max_artists from the subscription's price.
 */
export function resolvePlanByPriceId(priceId) {
  if (!priceId) return null;
  for (const plan of Object.values(PLANS)) {
    for (const price of Object.values(plan.prices)) {
      if (price.id === priceId) return plan;
    }
  }
  return null;
}
