import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { BUILDING_SEED } from './buildingsSeed.js';

const dbPath = process.env.SQLITE_PATH || './data/landofsaas.db';
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    base_price INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'available',
    current_price INTEGER NOT NULL,
    owner_name TEXT,
    owner_logo TEXT,
    owner_website TEXT,
    owner_color TEXT,
    floors INTEGER NOT NULL DEFAULT 12
  );

  CREATE TABLE IF NOT EXISTS bids (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES buildings(id),
    clerk_user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    brand_name TEXT NOT NULL,
    website TEXT NOT NULL,
    color TEXT NOT NULL,
    logo TEXT NOT NULL,
    floors INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- pending | confirmed | lost | failed
    dodo_payment_id TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

const seedCount = db.prepare('SELECT COUNT(*) AS n FROM buildings').get().n;
if (seedCount === 0) {
  const insert = db.prepare(`
    INSERT INTO buildings (id, base_price, status, current_price, owner_name, owner_logo, owner_website, owner_color, floors)
    VALUES (@id, @basePrice, @status, @currentPrice, @ownerName, @ownerLogo, @ownerWebsite, @ownerColor, @floors)
  `);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(
    BUILDING_SEED.map((b) => ({
      id: b.id,
      basePrice: b.basePrice,
      status: b.status,
      currentPrice: b.currentPrice,
      ownerName: b.owner?.name ?? null,
      ownerLogo: b.owner?.logo ?? null,
      ownerWebsite: b.owner?.website ?? null,
      ownerColor: b.owner?.color ?? null,
      floors: b.floors
    }))
  );
}

export function getAllBuildings() {
  return db.prepare('SELECT * FROM buildings').all();
}

export function getBuilding(id) {
  return db.prepare('SELECT * FROM buildings WHERE id = ?').get(id);
}

export function createBid(bid) {
  db.prepare(`
    INSERT INTO bids (id, building_id, clerk_user_id, amount, brand_name, website, color, logo, floors, status, dodo_payment_id)
    VALUES (@id, @buildingId, @clerkUserId, @amount, @brandName, @website, @color, @logo, @floors, 'pending', @dodoPaymentId)
  `).run(bid);
}

export function getBid(id) {
  return db.prepare('SELECT * FROM bids WHERE id = ?').get(id);
}

// Called only from the Dodo webhook after signature verification. Atomic:
// the building only flips to this bid's owner if no higher bid confirmed
// in the meantime (protects against two people paying for the same slot).
export function confirmBidIfHighest(bidId) {
  return db.transaction(() => {
    const bid = getBid(bidId);
    if (!bid || bid.status !== 'pending') return { outcome: 'noop', bid };

    const result = db.prepare(`
      UPDATE buildings
      SET status = 'owned', current_price = ?, owner_name = ?, owner_logo = ?, owner_website = ?, owner_color = ?, floors = ?
      WHERE id = ? AND current_price < ?
    `).run(bid.amount, bid.brand_name, bid.logo, bid.website, bid.color, bid.floors, bid.building_id, bid.amount);

    if (result.changes === 1) {
      db.prepare("UPDATE bids SET status = 'confirmed' WHERE id = ?").run(bidId);
      return { outcome: 'confirmed', bid };
    }

    // Someone else's bid was confirmed first for a higher (or equal) amount.
    db.prepare("UPDATE bids SET status = 'lost' WHERE id = ?").run(bidId);
    return { outcome: 'lost', bid };
  })();
}

export function markBidFailed(bidId) {
  db.prepare("UPDATE bids SET status = 'failed' WHERE id = ? AND status = 'pending'").run(bidId);
}
