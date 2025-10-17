// server/src/routes/items.ts
import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import pool from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

/* =========================
   Multer beállítás képekhez
   ========================= */

const itemUploadsDir = path.join(__dirname, "../../uploads/item-pics");
if (!fs.existsSync(itemUploadsDir)) {
  fs.mkdirSync(itemUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, itemUploadsDir);
  },
  filename: (req, file, cb) => {
    const { itemId } = req.params as { itemId?: string };
    const ext = path.extname(file.originalname);
    const safeItemId = Number(itemId) || "new";
    cb(null, `item-${safeItemId}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

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
        'Budapest' AS seller_city
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
        'Budapest' AS seller_city
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
 * → új item létrehozása (csak az ITEM táblába)
 * Body (JSON):
 * {
 *   user_id: number,
 *   title: string,
 *   description: string,
 *   price: number,
 *   category_id: number
 * }
 */
const createItemHandler: RequestHandler = async (req: Request, res: Response) => {
  const { user_id, title, description, price, category_id } = req.body ?? {};

  // Alapszintű validáció
  if (
    !Number.isInteger(user_id) ||
    typeof title !== "string" ||
    typeof description !== "string" ||
    !Number.isInteger(price) ||
    !Number.isInteger(category_id)
  ) {
    res.status(400).json({
      error:
        "Hiányzó vagy hibás mezők. Szükséges: user_id (int), title (string), description (string), price (int), category_id (int).",
    });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // ITEM beszúrás
    const insertItem = await client.query<{ item_id: number; created_at: string }>(
      `
      INSERT INTO "ITEM" (user_id, title, description, price, created_at, category_id)
      VALUES ($1, $2, $3, $4, NOW(), $5)
      RETURNING item_id, created_at;
      `,
      [user_id, title.trim(), description.trim(), price, category_id]
    );
    const newItemId = insertItem.rows[0].item_id;

    // A létrehozott item visszaadása
    const result = await client.query(
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
        'Budapest' AS seller_city
      FROM "ITEM" i
      JOIN "CATEGORY" c ON i.category_id = c.category_id
      JOIN "USER" u ON u.user_id = i.user_id
      WHERE i.item_id = $1
      LIMIT 1;
      `,
      [newItemId]
    );

    await client.query("COMMIT");
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating item:", err);
    const msg = (err as Error)?.message ?? "";
    if (msg.includes("foreign key constraint") || msg.includes("violates foreign key constraint")) {
      res.status(400).json({ error: "Érvénytelen user_id vagy category_id (FK hiba)." });
    } else if (msg.toLowerCase().includes("null value") || msg.toLowerCase().includes("not null")) {
      res.status(400).json({ error: "Kötelező mező hiányzik." });
    } else {
      res.status(500).json({ error: "Nem sikerült létrehozni az itemet." });
    }
  } finally {
    client.release();
  }
};

/**
 * POST /api/items/:itemId/images
 * → képek feltöltése egy meglévő itemhez
 * Form: multipart/form-data
 *   - images[]: File[]  (több file támogatott)
 *   - coverIndex?: string (opcionális, későbbi logikához; most nem használjuk külön)
 *
 * Mentés:
 *  - Fájlok: src/uploads/item-pics/...
 *  - DB: "IMAGE" (img_url = /uploads/item-pics/<filename>, place = "0","1","2"...)
 */
const uploadItemImagesHandler: RequestHandler = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId param required" });
    return;
  }

  // Kell, hogy legyen legalább egy file
  if (!req.files || !(req.files as Express.Multer.File[]).length) {
    res.status(400).json({ error: "No files uploaded (images[])" });
    return;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ellenőrizzük, létezik-e az item
    const itemCheck = await client.query(`SELECT 1 FROM "ITEM" WHERE item_id = $1`, [itemId]);
    if (itemCheck.rowCount === 0) {
      await client.query("ROLLBACK");
      res.status(404).json({ error: "Item not found" });
      return;
    }

    const files = req.files as Express.Multer.File[];

    // Meglévő képek száma (hogy a place folyamatosan növekedjen)
    const existingCountRes = await client.query<{ cnt: string }>(
      `SELECT COUNT(*)::int AS cnt FROM "IMAGE" WHERE item_id = $1`,
      [itemId]
    );
    let placeOffset = Number(existingCountRes.rows[0]?.cnt ?? 0);

    // Beszúrások
    const inserted: Array<{ img_id: number; img_url: string; place: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const webPath = `/uploads/item-pics/${f.filename}`; // ezt szolgálod ki statikusan az Express-ben

      const placeChar = String(placeOffset + i); // "char" mező → string formában tároljuk az indexet
      const ins = await client.query<{ img_id: number; img_url: string; place: string }>(
        `
        INSERT INTO "IMAGE" (item_id, img_url, place)
        VALUES ($1, $2, $3)
        RETURNING img_id, img_url, place;
        `,
        [itemId, webPath, placeChar]
      );
      inserted.push(ins.rows[0]);
    }

    await client.query("COMMIT");
    res.status(201).json({
      item_id: Number(itemId),
      images: inserted,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error uploading item images:", err);
    res.status(500).json({ error: "Failed to upload images" });
  } finally {
    client.release();
  }
};

// Routes
router.get("/", getAllItemsHandler);
router.get("/:itemId", getSingleItemHandler);
router.post("/", createItemHandler);

// ÚJ: képfeltöltés itemhez
router.post("/:itemId/images", upload.array("images[]", 10), uploadItemImagesHandler);

export default router;
