import { Router } from 'express';
import { getAllBuildings } from '../db.js';

export const buildingsRouter = Router();

// Public read-only endpoint. Only exposes the fields the frontend needs to
// render current ownership/price — never anything a client could use to
// forge a claim.
buildingsRouter.get('/', (_req, res) => {
  const rows = getAllBuildings();
  res.json(
    rows.map((b) => ({
      id: b.id,
      status: b.status,
      basePrice: b.base_price,
      currentPrice: b.current_price,
      floors: b.floors,
      owner: b.owner_name
        ? { name: b.owner_name, logo: b.owner_logo, website: b.owner_website, color: b.owner_color }
        : null
    }))
  );
});
