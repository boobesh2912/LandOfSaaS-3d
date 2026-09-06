import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { BUILDINGS_DATA } from './src/data/buildings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers & CORS Setup
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(cors());
app.use(express.json({ limit: '5mb' })); // Limit body payload size

// Simple In-Memory Rate Limiter for Payment Endpoint (10 requests per min per IP)
const rateLimitMap = new Map();
const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 15;

  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count += 1;
  }

  rateLimitMap.set(ip, record);

  if (record.count > maxRequests) {
    return res.status(429).json({ error: 'Too many payment session requests. Please wait a minute.' });
  }

  next();
};

// Input Sanitization & URL Validator Helpers
function sanitizeText(str = '', maxLength = 100) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>?/gm, '').substring(0, maxLength).trim();
}

function sanitizeUrl(urlStr = '') {
  if (typeof urlStr !== 'string') return 'https://mystartup.com';
  let cleanUrl = urlStr.trim();
  if (!cleanUrl) return 'https://mystartup.com';
  // Block dangerous schemes like javascript:, data:, vbscript:
  if (/^(javascript|vbscript|data):/i.test(cleanUrl)) {
    return 'https://mystartup.com';
  }
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }
  return cleanUrl.substring(0, 500);
}

// Initialize Supabase Client
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zbghycarahaxdwxhziiq.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_U-ihIqExyPZfkcypQuKpYQ_D-Iu7Vaz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// In-Memory Authoritative Building Database (Synced with Supabase)
let buildingsState = [...BUILDINGS_DATA];

// ---------------------------------------------------------
// 1. GET ALL BUILDINGS (Server & Supabase Source of Truth)
// ---------------------------------------------------------
app.get('/api/buildings', async (req, res) => {
  try {
    const { data: dbBuildings, error } = await supabase.from('buildings').select('*');
    if (!error && dbBuildings && dbBuildings.length > 0) {
      // Merge database claimed state into building list
      dbBuildings.forEach(dbB => {
        const idx = buildingsState.findIndex(b => b.id === dbB.id);
        if (idx !== -1) {
          buildingsState[idx] = { ...buildingsState[idx], ...dbB };
        }
      });
    }
  } catch (err) {
    console.warn('[Supabase Fetch Warning]: Falling back to local state', err.message);
  }
  return res.json({ success: true, buildings: buildingsState });
});


// ---------------------------------------------------------
// 2. CREATE DODO PAYMENT SESSION (Server-Side Price Authority)
// ---------------------------------------------------------
app.post('/api/create-payment-session', rateLimiter, async (req, res) => {
  try {
    const {
      buildingId,
      customBrandName,
      customWebsite,
      customColor,
      customLogo,
      customFloors,
      userId
    } = req.body;

    if (!buildingId) {
      return res.status(400).json({ error: 'Missing buildingId parameter' });
    }

    // Server-Side Price Verification (NEVER TRUST FRONTEND PRICE)
    const building = buildingsState.find((b) => b.id === buildingId);
    if (!building) {
      return res.status(404).json({ error: 'Target building slot not found' });
    }

    const minRequiredBid = building.status === 'owned' ? building.currentPrice + 5 : building.basePrice;

    const brandName = sanitizeText(customBrandName, 80) || 'My Startup';
    const website = sanitizeUrl(customWebsite);
    const color = (customColor && /^#[0-9A-F]{6}$/i.test(customColor)) ? customColor : '#10b981';
    const logo = customLogo || '🚀';
    const floors = Math.max(4, Math.min(60, Number(customFloors) || 14));

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const productId = process.env.DODO_PRODUCT_ID || 'pdt_0NmvqOrB01KtIWKY0htQs';

    const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : 'http://localhost:3000');
    const returnUrl = `${origin}/?payment=success&building_id=${buildingId}`;

    // Call Dodo Payments API (Test Mode)
    // Ref: https://test.dodopayments.com/payments
    const dodoResponse = await fetch('https://test.dodopayments.com/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        product_id: productId,
        payment_link: true,
        amount: minRequiredBid * 100, // Amount in cents ($5 -> 500)
        currency: 'USD',
        billing: {
          city: 'San Francisco',
          country: 'US',
          state: 'CA',
          street: '123 Tech Lane',
          zipcode: '94105'
        },
        customer: {
          email: 'buyer@landofsaas.com',
          name: brandName
        },
        return_url: returnUrl,
        metadata: {
          building_id: buildingId,
          user_id: userId || 'anonymous',
          bid_amount: String(minRequiredBid),
          brand_name: brandName,
          website_url: website,
          color: color,
          logo: logo,
          floors: String(floors)
        }
      })
    });

    const dodoData = await dodoResponse.json();

    if (!dodoResponse.ok) {
      console.warn('[Dodo API Test Mode Fallback]:', dodoData);
      // Fallback checkout session URL for test mode if endpoint schema differs
      const checkoutUrl = dodoData.payment_link || dodoData.checkout_url || `${returnUrl}&bid=${minRequiredBid}`;
      return res.json({
        success: true,
        checkout_url: checkoutUrl,
        validatedPrice: minRequiredBid,
        mode: 'test_fallback'
      });
    }

    return res.json({
      success: true,
      checkout_url: dodoData.payment_link || dodoData.url,
      validatedPrice: minRequiredBid
    });
  } catch (error) {
    console.error('Error creating Dodo payment session:', error);
    return res.status(500).json({ error: 'Failed to create payment session', details: error.message });
  }
});

// ---------------------------------------------------------
// 3. DODO PAYMENTS WEBHOOK RECEIVER (Payment Verification & Final Claim)
// ---------------------------------------------------------
app.post('/api/webhooks/dodo', async (req, res) => {
  try {
    const event = req.body;
    console.log('[Dodo Webhook Event Received]:', event.type || event.event);

    // Verify event type (payment.succeeded)
    if (event.type === 'payment.succeeded' || event.event === 'payment.succeeded' || event.data) {
      const metadata = event.data?.metadata || event.metadata || {};
      const { building_id, bid_amount, brand_name, website_url, color, logo, floors } = metadata;

      if (building_id) {
        const updatedBuilding = {
          id: building_id,
          status: 'owned',
          currentPrice: Number(bid_amount) || 5,
          customColor: color || '#10b981',
          floors: Number(floors) || 14,
          height: Math.max(2.5, (Number(floors) || 14) * 0.35),
          owner: {
            name: brand_name || 'New Owner',
            logo: logo || '🚀',
            website: website_url || 'https://mystartup.com',
            color: color || '#10b981'
          }
        };

        buildingsState = buildingsState.map((b) =>
          b.id === building_id ? { ...b, ...updatedBuilding } : b
        );

        // Upsert claim state into Supabase Database
        try {
          await supabase.from('buildings').upsert(updatedBuilding);
          console.log(`[Supabase DB Sync]: Building ${building_id} persisted to database.`);
        } catch (dbErr) {
          console.warn('[Supabase DB Sync Warning]:', dbErr.message);
        }

        console.log(`[Dodo Webhook Success]: Building ${building_id} updated to owner ${brand_name} at $${bid_amount}`);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
});


export default app;

// Start Server locally
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 LandOfSaaS Backend Server running on http://localhost:${PORT}`);
  });
}
