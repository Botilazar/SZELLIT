import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import pool from "../db";
import { verifyToken } from "./auth/verifyToken";

const router = Router();

// Minden végpont védett
router.use(verifyToken);

// user_id a JWT payloadból
function getUserId(req: Request): number {
  const u = (req as any).user as { user_id?: number } | undefined;
  if (!u || typeof u.user_id !== "number") {
    throw new Error("Missing user_id in token payload");
  }
  return u.user_id;
}

// GET /api/favorites  -> kedvenc item_id-k
const getIdsHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    const result = await pool.query(
      `SELECT item_id FROM "FAVORITE" WHERE user_id = $1`,
      [userId]
    );
    res.json(result.rows.map((row) => row.item_id));
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
router.get("/", getIdsHandler);

/**
 * GET /api/favorites/items -> teljes kedvenc lista
 */
const getItemsHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);

    const result = await pool.query(
      `
      SELECT
        i.item_id,
        i.title,
        i.description,
        i.price,
        i.created_at,
        c.name AS category_name,
        (COALESCE(NULLIF(TRIM(u.fname), ''), '') ||
         CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END) AS seller_name,u.prof_pic_url,
        ''::text AS seller_city,
        (
          SELECT ARRAY_REMOVE(ARRAY_AGG(im.img_url ORDER BY im.place ASC), NULL)
          FROM "IMAGE" im
          WHERE im.item_id = i.item_id
        ) AS img_urls
      FROM "ITEM" i
      JOIN "CATEGORY" c ON c.category_id = i.category_id
      JOIN "USER" u ON u.user_id = i.user_id
      WHERE EXISTS (
        SELECT 1
        FROM "FAVORITE" f
        WHERE f.user_id = $1
          AND f.item_id = i.item_id
      )
      ORDER BY i.created_at DESC;
      `,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching favorite items:", err);
    res.status(500).json({ error: "Failed to fetch favorite items" });
  }
};
router.get("/items", getItemsHandler);

// POST /api/favorites { item_id } -> hozzáadás
const addHandler: RequestHandler = async (req: Request, res: Response) => {
  const { item_id } = req.body;
  if (!item_id) {
    res.status(400).json({ error: "item_id required" });
    return;
  }
  try {
    const userId = getUserId(req);
    await pool.query(
      `INSERT INTO "FAVORITE" (user_id, item_id) VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [userId, item_id]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
};
router.post("/", addHandler);

// DELETE /api/favorites/:item_id  -> path param (ticket szerint)
const deleteParamHandler: RequestHandler = async (req: Request, res: Response) => {
  const item_id = Number(req.params.item_id);
  if (!item_id) {
    res.status(400).json({ error: "item_id param required" });
    return;
  }
  try {
    const userId = getUserId(req);
    await pool.query(
      `DELETE FROM "FAVORITE" WHERE user_id = $1 AND item_id = $2`,
      [userId, item_id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};
router.delete("/:item_id", deleteParamHandler);

// (Opciós, visszafelé kompatibilitás) DELETE { item_id } body-ban – deprecált
const deleteBodyHandler: RequestHandler = async (req: Request, res: Response) => {
  const { item_id } = req.body;
  if (!item_id) {
    res.status(400).json({ error: "item_id required" });
    return;
  }
  try {
    const userId = getUserId(req);
    await pool.query(
      `DELETE FROM "FAVORITE" WHERE user_id = $1 AND item_id = $2`,
      [userId, item_id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error("Error removing favorite (body):", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
};
router.delete("/", deleteBodyHandler);

export default router;
