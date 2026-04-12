/** Frontend mirror of api/plans.js — display data only, no price IDs. */
export interface Plan {
  key: string;
  maxArtists: number;
  namePT: string;
  nameEN: string;
  priceBRL: number;
  priceUSD: number;
  priceEUR: number;
  popular?: boolean;
}

export const PLANS: Plan[] = [
  { key: 'starter', maxArtists: 1,  namePT: 'Iniciante', nameEN: 'Starter', priceBRL: 29.90, priceUSD: 20.00, priceEUR: 20.00 },
  { key: 'duo',     maxArtists: 2,  namePT: 'Dupla',     nameEN: 'Duo',     priceBRL: 39.90, priceUSD: 30.00, priceEUR: 30.00 },
  { key: 'trio',    maxArtists: 3,  namePT: 'Trio',      nameEN: 'Trio',    priceBRL: 49.90, priceUSD: 40.00, priceEUR: 40.00 },
  { key: 'studio',  maxArtists: 4,  namePT: 'Estúdio',   nameEN: 'Studio',  priceBRL: 59.90, priceUSD: 50.00, priceEUR: 50.00, popular: true },
  { key: 'pro',     maxArtists: 5,  namePT: 'Pro',       nameEN: 'Pro',     priceBRL: 69.90, priceUSD: 60.00, priceEUR: 60.00 },
  { key: 'agency',  maxArtists: 15, namePT: 'Agência',   nameEN: 'Agency',  priceBRL: 149.90, priceUSD: 120.00, priceEUR: 120.00 },
];

export function getPlanByKey(key: string): Plan | undefined {
  return PLANS.find((p) => p.key === key);
}

/** Find the plan that matches a given maxArtists value. */
export function getPlanByMaxArtists(maxArtists: number): Plan | undefined {
  return PLANS.find((p) => p.maxArtists === maxArtists);
}

export type Currency = 'brl' | 'usd' | 'eur';

export function formatPrice(plan: Plan, currency: Currency): string {
  if (currency === 'usd') return `$${plan.priceUSD.toFixed(2)}`;
  if (currency === 'eur') return `€${plan.priceEUR.toFixed(2)}`;
  return `R$${plan.priceBRL.toFixed(2).replace('.', ',')}`;
}
