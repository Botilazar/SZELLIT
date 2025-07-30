import { Router } from "express";
import pool from "../db";

const router = Router();

router.get("/", async (req, res) => {
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
        u.fname || ' ' || u.lname AS seller_name,
        'Budapest' AS seller_city,
        (
          SELECT json_agg(img.img_url ORDER BY img.place)
          FROM "IMAGE" img
          WHERE img.item_id = i.item_id
        ) AS img_urls
      FROM "ITEM" i
      JOIN "CATEGORY" c ON i.category_id = c.category_id
      JOIN "USER" u ON i.user_id = u.user_id
      ORDER BY i.created_at DESC;
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("DB error:", error);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
