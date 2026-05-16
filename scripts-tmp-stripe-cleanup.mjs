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

// 1) Rename canonical FULL CODE Upgrade product (lookup_key full_code_upgrade_1000)
const RENAME_ID = 'prod_UWRpkkZwlq9EY2';
const renamed = await stripe.products.update(RENAME_ID, {
  name: 'CORE Complete Upgrade',
  description: 'Unlock all 6 Focused Chapters after CORE — saves $7.94 vs buying separately.',
});
console.log('renamed:', renamed.id, '→', renamed.name);

// 2) Archive orphan products (no active lookup_key on any price).
// Strategy: list all active prices, group by product, find products whose
// ALL active prices have lookup_key=null. Then deactivate those prices first,
// then archive the product.
const prices = await stripe.prices.list({ limit: 100, active: true, expand: ['data.product'] });
const byProduct = new Map();
for (const p of prices.data) {
  const pid = typeof p.product === 'string' ? p.product : p.product.id;
  if (!byProduct.has(pid)) byProduct.set(pid, []);
  byProduct.get(pid).push(p);
}

const KEEP = new Set([RENAME_ID]); // never archive the renamed product
const orphans = [];
for (const [pid, plist] of byProduct.entries()) {
  if (KEEP.has(pid)) continue;
  const allOrphan = plist.every(p => !p.lookup_key);
  if (allOrphan) orphans.push({ pid, prices: plist });
}

for (const { pid, prices: plist } of orphans) {
  const product = typeof plist[0].product === 'object' ? plist[0].product : await stripe.products.retrieve(pid);
  console.log(`archiving: ${pid} (${product.name})`);
  for (const pr of plist) {
    await stripe.prices.update(pr.id, { active: false });
  }
  await stripe.products.update(pid, { active: false });
}
console.log(`done. archived ${orphans.length} product(s).`);
