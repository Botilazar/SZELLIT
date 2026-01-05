// server/src/routes/items.ts
import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import pool from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken } from "./auth/verifyToken";

const router = Router();

/**
 * Multer setup
 */
const uploadDir = path.join(__dirname, "..", "..", "uploads", "items");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

/**
 * GET /api/items
 */
const getAllItemsHandler: RequestHandler = async (_req, res): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        i.item_id, i.title, i.description, i.price, i.created_at,
        c.name AS category_name,
        u.user_id,
        (COALESCE(NULLIF(TRIM(u.fname), ''), '') ||
         CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END)
         AS seller_name,
        u.prof_pic_url,
        'Budapest' AS seller_city,
        (
          SELECT ARRAY_REMOVE(ARRAY_AGG(img.img_url ORDER BY img.place ASC), NULL)
          FROM "IMAGE" img WHERE img.item_id = i.item_id
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
 */
const getSingleItemHandler: RequestHandler = async (req, res): Promise<void> => {
  const { itemId } = req.params;

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId required" });
    return;
  }

  try {
    const result = await pool.query(
      `
      SELECT 
        i.item_id, i.title, i.description, i.price, i.created_at,
        c.name AS category_name,
        u.user_id,
        (COALESCE(NULLIF(TRIM(u.fname), ''), '') ||
         CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END)
         AS seller_name,
        u.prof_pic_url,
        'Budapest' AS seller_city,
        (
          SELECT ARRAY_REMOVE(ARRAY_AGG(img.img_url ORDER BY img.place ASC), NULL)
          FROM "IMAGE" img WHERE img.item_id = i.item_id
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

/**
 * POST /api/items
 */
const createItemHandler: RequestHandler = async (req, res): Promise<void> => {
  const { user_id, title, description, price, category_id } = req.body || {};

  if (!user_id || !title || !category_id || price === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO "ITEM" (user_id, title, description, price, category_id, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING item_id;
      `,
      [user_id, title, description ?? "", price, category_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

/**
 * POST /api/items/:itemId/images
 */
const uploadItemImagesHandler: RequestHandler = async (req, res): Promise<void> => {
  const { itemId } = req.params;
  const files = (req.files as Express.Multer.File[]) || [];

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId required" });
    return;
  }

  if (!files.length) {
    res.status(400).json({ error: "No images uploaded" });
    return;
  }

  let coverIndex: number | null = null;
  if (req.body.coverIndex !== undefined) {
    const parsed = Number(req.body.coverIndex);
    if (!isNaN(parsed)) coverIndex = parsed;
  }

  let orderedFiles = files;
  if (coverIndex !== null && coverIndex >= 0 && coverIndex < files.length) {
    const cover = files[coverIndex];
    orderedFiles = [cover, ...files.filter((_, i) => i !== coverIndex)];
  }

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let place = 0;
      const urls: string[] = [];

      for (const f of orderedFiles) {
        const url = `/uploads/items/${f.filename}`;
        urls.push(url);

        await client.query(
          `INSERT INTO "IMAGE" (item_id, img_url, place) VALUES ($1, $2, $3);`,
          [itemId, url, place]
        );
        place++;
      }

      await client.query("COMMIT");
      res.status(201).json({ item_id: Number(itemId), img_urls: urls });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error saving images:", err);
      res.status(500).json({ error: "Failed to save images" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Failed to save images" });
  }
};

/**
 * PUT /api/items/:itemId
 * → update item fields
 */
const updateItemHandler: RequestHandler = async (req, res): Promise<void> => {
  const { itemId } = req.params;
  const { title, description, price, category_id } = req.body;
  const userId = req.user?.user_id;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const check = await pool.query(`SELECT user_id FROM "ITEM" WHERE item_id=$1`, [itemId]);

    if (!check.rowCount) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    if (check.rows[0].user_id !== userId) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }

    await pool.query(
      `
      UPDATE "ITEM"
      SET title=$1, description=$2, price=$3, category_id=$4
      WHERE item_id=$5
      `,
      [title, description, price, category_id, itemId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("updateItem error:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
};

/**
 * PUT /api/items/:itemId/images
 * → update existing + new images, reorder
 */
const updateImagesHandler: RequestHandler = async (req, res): Promise<void> => {
  const { itemId } = req.params;
  const userId = req.user?.user_id;

  const existing: string[] = JSON.parse(req.body.existing || "[]");
  const coverIndex = Number(req.body.coverIndex ?? -1);
  const uploaded = (req.files as Express.Multer.File[]) || [];

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const check = await pool.query(`SELECT user_id FROM "ITEM" WHERE item_id=$1`, [itemId]);

    if (!check.rowCount) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    if (check.rows[0].user_id !== userId) {
      res.status(403).json({ error: "Not allowed" });
      return;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      await client.query(`DELETE FROM "IMAGE" WHERE item_id=$1`, [itemId]);

      let place = 0;
      let final: string[] = [];

      for (const url of existing) {
        await client.query(
          `INSERT INTO "IMAGE" (item_id,img_url,place) VALUES ($1,$2,$3)`,
          [itemId, url, place]
        );
        final.push(url);
        place++;
      }

      for (const file of uploaded) {
        const url = `/uploads/items/${file.filename}`;
        await client.query(
          `INSERT INTO "IMAGE" (item_id,img_url,place) VALUES ($1,$2,$3)`,
          [itemId, url, place]
        );
        final.push(url);
        place++;
      }

      if (coverIndex >= 0 && coverIndex < final.length) {
        const cover = final[coverIndex];
        final.splice(coverIndex, 1);
        final.unshift(cover);

        await client.query(`DELETE FROM "IMAGE" WHERE item_id=$1`, [itemId]);

        let p = 0;
        for (const url of final) {
          await client.query(
            `INSERT INTO "IMAGE" (item_id,img_url,place) VALUES ($1,$2,$3)`,
            [itemId, url, p]
          );
          p++;
        }
      }

      await client.query("COMMIT");
      res.json({ success: true, images: final });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("updateImages error:", err);
      res.status(500).json({ error: "Failed to update images" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("updateImages outer:", err);
    res.status(500).json({ error: "Server error" });
  }
};

/**
 * DELETE /api/items/:itemId
 */
const deleteItemHandler: RequestHandler = async (req, res): Promise<void> => {
  const { itemId } = req.params;

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId required" });
    return;
  }

  const userId = req.user?.user_id;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const check = await pool.query(`SELECT user_id FROM "ITEM" WHERE item_id=$1`, [itemId]);

    if (!check.rowCount) {
      res.status(404).json({ error: "Item not found" });
      return;
    }

    if (check.rows[0].user_id !== userId) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    await pool.query(`DELETE FROM "IMAGE" WHERE item_id=$1`, [itemId]);
    await pool.query(`DELETE FROM "ITEM" WHERE item_id=$1`, [itemId]);

    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error("deleteItem error:", err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

/* ROUTES */
router.get("/", getAllItemsHandler);
router.get("/:itemId", getSingleItemHandler);
router.post("/", createItemHandler);
router.post("/:itemId/images", upload.array("images[]", 5), uploadItemImagesHandler);
router.put("/:itemId", verifyToken, updateItemHandler);
router.put("/:itemId/images", verifyToken, upload.array("images[]", 5), updateImagesHandler);
router.delete("/:itemId", verifyToken, deleteItemHandler);

export default router;
