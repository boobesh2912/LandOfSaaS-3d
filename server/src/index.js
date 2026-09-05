import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import { buildingsRouter } from './routes/buildings.js';
import { bidsRouter } from './routes/bids.js';
import { webhooksRouter } from './routes/webhooks.js';

const requiredEnv = ['CLERK_SECRET_KEY', 'DODO_API_KEY', 'DODO_WEBHOOK_SECRET', 'DODO_PRODUCT_ID'];
const missing = requiredEnv.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`Missing required env vars: ${missing.join(', ')}. Copy server/.env.example to server/.env and fill them in.`);
  process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));

// Webhook route needs the raw body for signature verification, so it's
// mounted BEFORE express.json() with its own raw parser.
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhooksRouter);

app.use(express.json());

// clerkMiddleware() decodes/verifies the bearer token eagerly and throws on
// a malformed one instead of just leaving the request unauthenticated — an
// API (no browser sign-in redirect) should treat a bad token as "no
// session", not a 500. Swallow the error here; getAuth()-based checks
// downstream then correctly see no userId and return 401.
app.use((req, res, next) => {
  clerkMiddleware()(req, res, (err) => {
    if (err) console.warn('Clerk auth parsing failed, treating request as unauthenticated:', err.message);
    next();
  });
});

app.use('/api/buildings', buildingsRouter);
app.use('/api/bids', bidsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`LandOfSaaS API listening on :${port}`));
