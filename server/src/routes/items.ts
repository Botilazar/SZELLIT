// server/src/routes/items.ts
import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import pool from "../db";
import { verifyToken } from "./auth/verifyToken";

const router = Router();

/**
 * GET /api/items
 * → all items with seller info including profile pic
 */
const getAllItemsHandler: RequestHandler = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.item_id,
        i.title,
        i.description,
        i.price,
        i.created_at,
        c.name AS category_name,
        u.user_id,
        (COALESCE(NULLIF(TRIM(u.fname), ''), '') ||
         CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END) AS seller_name,
        u.prof_pic_url,
        'Budapest' AS seller_city,
        (
          SELECT ARRAY_REMOVE(ARRAY_AGG(img.img_url ORDER BY img.place ASC), NULL)
          FROM "IMAGE" img
          WHERE img.item_id = i.item_id
        ) AS img_urls
      FROM "ITEM" i
      JOIN "CATEGORY" c ON i.category_id = c.category_id
      JOIN "USER" u ON u.user_id = i.user_id
      ORDER BY i.created_at DESC;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

/**
 * GET /api/items/:itemId
 * → single item with seller info including profile pic
 */
const getSingleItemHandler: RequestHandler = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId param required" });
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        i.item_id,
        i.title,
        i.description,
        i.price,
        i.created_at,
        c.name AS category_name,
        u.user_id,
        (COALESCE(NULLIF(TRIM(u.fname), ''), '') ||
         CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END) AS seller_name,
        u.prof_pic_url,
        'Budapest' AS seller_city,
        (
          SELECT ARRAY_REMOVE(ARRAY_AGG(img.img_url ORDER BY img.place ASC), NULL)
          FROM "IMAGE" img
          WHERE img.item_id = i.item_id
        ) AS img_urls
      FROM "ITEM" i
      JOIN "CATEGORY" c ON i.category_id = c.category_id
      JOIN "USER" u ON u.user_id = i.user_id
      WHERE i.item_id = $1
      LIMIT 1;
      `,
      [itemId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching item detail:", err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

const deleteItemHandler: RequestHandler = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId param required" });
    return;
  }

  const userId = req.user?.user_id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // 1) Check owner
    const check = await pool.query(
      `SELECT user_id FROM "ITEM" WHERE item_id = $1`,
      [itemId]
    );

    if (check.rows.length === 0) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    if (check.rows[0].user_id !== userId) {
      res.status(403).json({ error: "Not authorized to delete this item" });
      return;
    }

    // 2) Delete images
    await pool.query(
      `DELETE FROM "IMAGE" WHERE item_id = $1`,
      [itemId]
    );

    // 3) Delete item
    await pool.query(
      `DELETE FROM "ITEM" WHERE item_id = $1`,
      [itemId]
    );

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};


// Routes
router.get("/", getAllItemsHandler);
router.get("/:itemId", getSingleItemHandler);
router.delete("/:itemId", verifyToken, deleteItemHandler);

export default router;
