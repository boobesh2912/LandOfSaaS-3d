import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { getAuth } from '@clerk/express';
import rateLimit from 'express-rate-limit';
import { getBuilding, createBid } from '../db.js';
import { createCheckout } from '../dodoClient.js';

export const bidsRouter = Router();

const ALLOWED_FLOOR_TIERS = [6, 14, 24, 38];
const HEX_COLOR = /^#[0-9a-f]{6}$/i;

const bidLimiter = rateLimit({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false
});

// requireAuth() from @clerk/express redirects to a sign-in page when
// unauthenticated — correct for a rendered app, wrong for a JSON API. This
// returns a clean 401 instead, and tolerates clerkMiddleware() having failed
// to parse a malformed token upstream (see index.js).
function requireSignedIn(req, res, next) {
  let userId = null;
  try {
    userId = getAuth(req)?.userId ?? null;
  } catch {
    userId = null;
  }
  if (!userId) return res.status(401).json({ error: 'Sign in required' });
  req.userId = userId;
  next();
}

function validateBidInput(body) {
  const errors = [];
  const brandName = String(body.brandName ?? '').trim().slice(0, 40);
  const website = String(body.website ?? '').trim();
  const color = String(body.color ?? '');
  const logo = String(body.logo ?? '').trim().slice(0, 8);
  const floors = Number(body.floors);

  if (!brandName) errors.push('brandName is required');
  if (!/^https?:\/\/.+/i.test(website) || website.length > 200) errors.push('website must be a valid http(s) URL');
  if (!HEX_COLOR.test(color)) errors.push('color must be a hex code like #10b981');
  if (!logo) errors.push('logo is required');
  if (!ALLOWED_FLOOR_TIERS.includes(floors)) errors.push(`floors must be one of ${ALLOWED_FLOOR_TIERS.join(', ')}`);

  return { errors, clean: { brandName, website, color, logo, floors } };
}

// Auth required: unauthenticated users cannot create a bid or trigger a
// Dodo checkout. Price is always computed here from the DB, never from the
// request body — the frontend cannot influence what gets charged.
bidsRouter.post('/', bidLimiter, requireSignedIn, async (req, res) => {
  const { userId } = req;
  const building = getBuilding(req.body.buildingId);
  if (!building) return res.status(404).json({ error: 'Building not found' });

  const { errors, clean } = validateBidInput(req.body);
  if (errors.length) return res.status(400).json({ error: errors.join('; ') });

  const amount = building.status === 'owned' ? building.current_price + 5 : building.base_price;
  const bidId = randomUUID();

  try {
    const { sessionId, checkoutUrl } = await createCheckout({
      amountCents: amount * 100,
      bidId,
      buyerUserId: userId
    });

    createBid({
      id: bidId,
      buildingId: building.id,
      clerkUserId: userId,
      amount,
      dodoPaymentId: sessionId,
      ...clean
    });

    res.json({ bidId, amount, checkoutUrl });
  } catch (err) {
    console.error('Dodo checkout creation failed', err);
    res.status(502).json({ error: 'Could not start payment. Please try again.' });
  }
});
