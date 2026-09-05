import DodoPayments from 'dodopayments';
import { Webhook } from 'standardwebhooks';

export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY,
  environment: process.env.DODO_ENVIRONMENT || 'test_mode'
});

const webhook = new Webhook(process.env.DODO_WEBHOOK_SECRET);

/**
 * Creates a Dodo hosted checkout session for a server-computed amount
 * (cents) and returns its checkout URL. The Dodo product referenced by
 * DODO_PRODUCT_ID must be configured as "Pay what you want" in the Dodo
 * dashboard for the `amount` override below to take effect — otherwise Dodo
 * charges the product's fixed dashboard price and ignores `amount`.
 */
export async function createCheckout({ amountCents, bidId, buyerUserId }) {
  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: process.env.DODO_PRODUCT_ID, quantity: 1, amount: amountCents }],
    return_url: process.env.CHECKOUT_RETURN_URL,
    metadata: { bidId, buyerUserId }
  });

  return { sessionId: session.session_id, checkoutUrl: session.checkout_url };
}

/**
 * Verifies the Standard Webhooks signature Dodo sends. Throws if invalid —
 * callers must reject the request (do not trust unverified webhook bodies).
 */
export function verifyDodoWebhook(rawBody, headers) {
  return webhook.verify(rawBody, {
    'webhook-id': headers['webhook-id'],
    'webhook-timestamp': headers['webhook-timestamp'],
    'webhook-signature': headers['webhook-signature']
  });
}
