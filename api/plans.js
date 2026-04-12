/**
 * Tiered pricing plans — shared config between API handlers.
 *
 * Each plan maps to:
 *  - key:         internal identifier sent from the frontend
 *  - maxArtists:  how many artists the studio can have active at once
 *  - envVar:      environment variable that holds the Stripe Price ID
 *  - priceId():   resolved Stripe Price ID at runtime
 *
 * Plans (BRL):
 *   starter  → 1 artist   → R$29,90/mês
 *   duo      → 2 artists  → R$39,90/mês
 *   trio     → 3 artists  → R$49,90/mês
 *   studio   → 4 artists  → R$59,90/mês
 *   pro      → 5 artists  → R$69,90/mês
 *   agency   → 15 artists → R$149,90/mês
 */

export const PLANS = {
  starter: {
    key: 'starter',
    maxArtists: 1,
    envVar: 'STRIPE_PRICE_STARTER',
    get priceId() { return process.env[this.envVar]; },
  },
  duo: {
    key: 'duo',
    maxArtists: 2,
    envVar: 'STRIPE_PRICE_DUO',
    get priceId() { return process.env[this.envVar]; },
  },
  trio: {
    key: 'trio',
    maxArtists: 3,
    envVar: 'STRIPE_PRICE_TRIO',
    get priceId() { return process.env[this.envVar]; },
  },
  studio: {
    key: 'studio',
    maxArtists: 4,
    envVar: 'STRIPE_PRICE_STUDIO_PLAN',
    get priceId() { return process.env[this.envVar]; },
  },
  pro: {
    key: 'pro',
    maxArtists: 5,
    envVar: 'STRIPE_PRICE_PRO',
    get priceId() { return process.env[this.envVar]; },
  },
  agency: {
    key: 'agency',
    maxArtists: 15,
    envVar: 'STRIPE_PRICE_AGENCY',
    get priceId() { return process.env[this.envVar]; },
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
 * Resolve a plan from a Stripe Price ID.
 * Used in the webhook to determine max_artists from the subscription's price.
 */
export function resolvePlanByPriceId(priceId) {
  return Object.values(PLANS).find((p) => p.priceId === priceId) ?? null;
}
