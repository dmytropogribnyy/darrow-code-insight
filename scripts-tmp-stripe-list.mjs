import Stripe from 'stripe';
const GATEWAY = 'https://connector-gateway.lovable.dev/stripe';
const conn = process.env.STRIPE_SANDBOX_API_KEY;
const lov = process.env.LOVABLE_API_KEY;
const stripe = new Stripe(conn, {
  apiVersion: '2026-03-25.dahlia',
  httpClient: Stripe.createFetchHttpClient((url, init) => {
    const u = url.toString().replace('https://api.stripe.com', GATEWAY);
    return fetch(u, { ...init, headers: { ...Object.fromEntries(new Headers(init?.headers).entries()), 'X-Connection-Api-Key': conn, 'Lovable-API-Key': lov } });
  }),
});
const prices = await stripe.prices.list({ limit: 100, active: true, expand: ['data.product'] });
const rows = prices.data.map(p => ({
  lookup_key: p.lookup_key,
  amount: p.unit_amount,
  currency: p.currency,
  product_name: (p.product && typeof p.product === 'object' && 'name' in p.product) ? p.product.name : p.product,
  product_id: (p.product && typeof p.product === 'object' && 'id' in p.product) ? p.product.id : p.product,
}));
rows.sort((a,b)=> (a.lookup_key||'').localeCompare(b.lookup_key||''));
console.table(rows);
