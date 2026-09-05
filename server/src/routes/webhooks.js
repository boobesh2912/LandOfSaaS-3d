import { Router } from 'express';
import { verifyDodoWebhook } from '../dodoClient.js';
import { getBid, confirmBidIfHighest, markBidFailed } from '../db.js';

export const webhooksRouter = Router();

// Mounted with express.raw() in index.js — signature verification needs the
// exact raw bytes Dodo signed, not a re-serialized JSON.parse'd body.
webhooksRouter.post('/dodo', (req, res) => {
  let event;
  try {
    event = verifyDodoWebhook(req.body, req.headers);
  } catch (err) {
    console.error('Rejected webhook: bad signature', err.message);
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const bidId = event?.data?.metadata?.bidId;
  const bid = bidId && getBid(bidId);

  if (!bid) {
    // Not one of ours (or already gone) — ack so Dodo stops retrying.
    return res.status(200).json({ received: true });
  }

  if (event.type === 'payment.succeeded') {
    const { outcome } = confirmBidIfHighest(bidId);
    if (outcome === 'lost') {
      console.warn(`Bid ${bidId} paid but lost the race for building ${bid.building_id} — needs manual refund via Dodo dashboard`);
    }
  } else if (event.type === 'payment.failed' || event.type === 'payment.cancelled') {
    markBidFailed(bidId);
  }

  res.status(200).json({ received: true });
});
