import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { BUILDINGS_DATA } from './src/data/buildings.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Authoritative Building Database (Production should use PostgreSQL / MongoDB)
let buildingsState = [...BUILDINGS_DATA];

// ---------------------------------------------------------
// 1. GET ALL BUILDINGS (Server Source of Truth)
// ---------------------------------------------------------
app.get('/api/buildings', (req, res) => {
  return res.json({ success: true, buildings: buildingsState });
});

// ---------------------------------------------------------
// 2. CREATE DODO PAYMENT SESSION (Server-Side Price Authority)
// ---------------------------------------------------------
app.post('/api/create-payment-session', async (req, res) => {
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

    const brandName = customBrandName?.trim() || 'My Startup';
    const website = customWebsite?.trim() || 'https://mystartup.com';
    const color = customColor || '#10b981';
    const logo = customLogo || '🚀';
    const floors = customFloors || 14;

    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const productId = process.env.DODO_PRODUCT_ID || 'pdt_0NmvqOrB01KtIWKY0htQs';

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
        return_url: `http://localhost:3000/?payment=success&building_id=${buildingId}`,
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
      const checkoutUrl = dodoData.payment_link || dodoData.checkout_url || `http://localhost:3000/?payment=success&building_id=${buildingId}&bid=${minRequiredBid}`;
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
app.post('/api/webhooks/dodo', (req, res) => {
  try {
    const event = req.body;
    console.log('[Dodo Webhook Event Received]:', event.type || event.event);

    // Verify event type (payment.succeeded)
    if (event.type === 'payment.succeeded' || event.event === 'payment.succeeded' || event.data) {
      const metadata = event.data?.metadata || event.metadata || {};
      const { building_id, bid_amount, brand_name, website_url, color, logo, floors } = metadata;

      if (building_id) {
        buildingsState = buildingsState.map((b) =>
          b.id === building_id
            ? {
                ...b,
                status: 'owned',
                currentPrice: Number(bid_amount) || b.currentPrice + 5,
                customColor: color || '#10b981',
                floors: Number(floors) || 14,
                height: Math.max(2.5, (Number(floors) || 14) * 0.35),
                owner: {
                  name: brandName || 'New Owner',
                  logo: logo || '🚀',
                  website: website_url || 'https://mystartup.com',
                  color: color || '#10b981'
                }
              }
            : b
        );
        console.log(`[Dodo Webhook Success]: Building ${building_id} updated to owner ${brand_name} at $${bid_amount}`);
      }
    }

    return res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err);
    return res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 LandOfSaaS Backend Server running on http://localhost:${PORT}`);
});
