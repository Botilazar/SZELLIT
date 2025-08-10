// server/src/routes/favourites.ts
import { Router } from "express";
import pool from "../db";

const router = Router();

// Hardcoded user_id = 2

// Get favorited item IDs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT item_id FROM "FAVORITE" WHERE user_id = 2`
    );
    res.json(result.rows.map((row) => row.item_id));
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * Get full favorite items list
 * - CATEGORY.name -> category_name
 * - USER.fname, USER.lname -> seller_name
 * - NINCS city mező -> '' AS seller_city
 * - IMAGE(img_url, place) -> img_urls (ARRAY), place szerint rendezve
 */
router.get("/items", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        i.item_id,
        i.title,
        i.description,
        i.price,
        i.created_at,
        c.name AS category_name,
        (COALESCE(NULLIF(TRIM(u.fname), ''), '') || 
         CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END) AS seller_name,
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
        WHERE f.user_id = 2
          AND f.item_id = i.item_id
      )
      ORDER BY i.created_at DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching favorite items:", err);
    res.status(500).json({ error: "Failed to fetch favorite items" });
  }
});

// Add favorite
router.post("/", async (req, res) => {
  const { item_id } = req.body;
  try {
    await pool.query(
      `INSERT INTO "FAVORITE" (user_id, item_id) VALUES (2, $1)`,
      [item_id]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error("Error adding favorite:", err);
    res.status(500).json({ error: "Failed to add favorite" });
  }
});

// Remove favorite
router.delete("/", async (req, res) => {
  const { item_id } = req.body;
  try {
    await pool.query(
      `DELETE FROM "FAVORITE" WHERE user_id = 2 AND item_id = $1`,
      [item_id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error("Error removing favorite:", err);
    res.status(500).json({ error: "Failed to remove favorite" });
  }
});

export default router;
