// Server-side source of truth for price/ownership. Mirrors the demo state
// currently hardcoded in src/data/buildings.js on the frontend, so the first
// server boot renders identically to before. From here on, ownership only
// changes through a paid, webhook-confirmed bid (see routes/bids.js).
// Geometry (position, width, depth, tier) stays client-side — cosmetic only.

export const BUILDING_SEED = [
  { id: 'ai-1', basePrice: 5, status: 'owned', currentPrice: 85, owner: { name: 'OpenAI', logo: '🤖', website: 'https://openai.com', color: '#10a37f' }, floors: 28 },
  { id: 'ai-2', basePrice: 3, status: 'owned', currentPrice: 42, owner: { name: 'Anthropic', logo: '✳', website: 'https://anthropic.com', color: '#d97757' }, floors: 16 },
  { id: 'ai-3', basePrice: 3, status: 'owned', currentPrice: 28, owner: { name: 'Midjourney', logo: '🎨', website: 'https://midjourney.com', color: '#06b6d4' }, floors: 14 },
  { id: 'ai-4', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 6 },
  { id: 'ai-5', basePrice: 3, status: 'owned', currentPrice: 18, owner: { name: 'Perplexity', logo: '🔍', website: 'https://perplexity.ai', color: '#2563eb' }, floors: 15 },
  { id: 'ai-6', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 7 },
  { id: 'ai-7', basePrice: 3, status: 'owned', currentPrice: 15, owner: { name: 'Superhuman', logo: '⚡', website: 'https://superhuman.com', color: '#8b5cf6' }, floors: 13 },
  { id: 'saas-1', basePrice: 5, status: 'owned', currentPrice: 120, owner: { name: 'Stripe', logo: '💳', website: 'https://stripe.com', color: '#6366f1' }, floors: 36 },
  { id: 'saas-2', basePrice: 3, status: 'available', currentPrice: 3, owner: null, floors: 18 },
  { id: 'saas-3', basePrice: 3, status: 'owned', currentPrice: 65, owner: { name: 'Notion', logo: '📝', website: 'https://notion.so', color: '#1e293b' }, floors: 16 },
  { id: 'saas-4', basePrice: 3, status: 'owned', currentPrice: 50, owner: { name: 'Figma', logo: '🎨', website: 'https://figma.com', color: '#a855f7' }, floors: 17 },
  { id: 'saas-5', basePrice: 3, status: 'owned', currentPrice: 35, owner: { name: 'Linear', logo: '🎯', website: 'https://linear.app', color: '#5e6ad2' }, floors: 14 },
  { id: 'saas-6', basePrice: 5, status: 'owned', currentPrice: 95, owner: { name: 'Vercel', logo: '▲', website: 'https://vercel.com', color: '#000000' }, floors: 25 },
  { id: 'saas-7', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 6 },
  { id: 'saas-8', basePrice: 3, status: 'owned', currentPrice: 40, owner: { name: 'Supabase', logo: '⚡', website: 'https://supabase.com', color: '#3ecf8e' }, floors: 14 },
  { id: 'mkt-1', basePrice: 5, status: 'owned', currentPrice: 38, owner: { name: 'PostHog', logo: '🦔', website: 'https://posthog.com', color: '#f43f5e' }, floors: 24 },
  { id: 'mkt-2', basePrice: 3, status: 'owned', currentPrice: 30, owner: { name: 'HubSpot', logo: '🟠', website: 'https://hubspot.com', color: '#f97316' }, floors: 16 },
  { id: 'mkt-3', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 5 },
  { id: 'mkt-4', basePrice: 3, status: 'owned', currentPrice: 22, owner: { name: 'Loops', logo: '✉️', website: 'https://loops.so', color: '#ec4899' }, floors: 13 },
  { id: 'mkt-5', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 5 },
  { id: 'mkt-6', basePrice: 3, status: 'owned', currentPrice: 25, owner: { name: 'Ahrefs', logo: '📈', website: 'https://ahrefs.com', color: '#2563eb' }, floors: 15 },
  { id: 'web3-1', basePrice: 5, status: 'owned', currentPrice: 90, owner: { name: 'Ethereum', logo: '⬡', website: 'https://ethereum.org', color: '#6366f1' }, floors: 26 },
  { id: 'web3-2', basePrice: 3, status: 'owned', currentPrice: 45, owner: { name: 'Solana', logo: '◎', website: 'https://solana.com', color: '#a855f7' }, floors: 16 },
  { id: 'web3-3', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 6 },
  { id: 'web3-4', basePrice: 3, status: 'owned', currentPrice: 30, owner: { name: 'Uniswap', logo: '🦄', website: 'https://uniswap.org', color: '#f43f5e' }, floors: 14 },
  { id: 'crt-1', basePrice: 5, status: 'owned', currentPrice: 40, owner: { name: 'Substack', logo: '🧡', website: 'https://substack.com', color: '#f97316' }, floors: 23 },
  { id: 'crt-2', basePrice: 3, status: 'owned', currentPrice: 22, owner: { name: 'Gumroad', logo: '🛍️', website: 'https://gumroad.com', color: '#f43f5e' }, floors: 15 },
  { id: 'crt-3', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 5 },
  { id: 'crt-4', basePrice: 3, status: 'owned', currentPrice: 26, owner: { name: 'Patreon', logo: '🎨', website: 'https://patreon.com', color: '#f43f5e' }, floors: 13 },
  { id: 'open-1', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 6 },
  { id: 'open-2', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 5 },
  { id: 'open-3', basePrice: 2, status: 'available', currentPrice: 2, owner: null, floors: 6 },
  { id: 'open-4', basePrice: 3, status: 'available', currentPrice: 3, owner: null, floors: 14 }
];
