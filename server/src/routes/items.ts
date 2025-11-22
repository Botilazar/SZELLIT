// server/src/routes/items.ts
import { Router } from "express";
import type { Request, Response, RequestHandler } from "express";
import pool from "../db";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

/**
 * Multer beállítás a képfeltöltéshez
 */
const uploadDir = path.join(__dirname, "..", "..", "uploads", "items");

// Gondoskodunk róla, hogy a mappa létezzen
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
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
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 5,
  },
});

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

/**
 * POST /api/items
 * → új hirdetés létrehozása
 * Body: { user_id, title, description, price, category_id }
 */
const createItemHandler: RequestHandler = async (req: Request, res: Response) => {
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

    const newItem = result.rows[0];
    res.status(201).json(newItem); // { item_id: ... }
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

/**
 * POST /api/items/:itemId/images
 * → képek feltöltése egy itemhez
 * FormData: images[] (File[]), coverIndex (opcionális)
 */
const uploadItemImagesHandler: RequestHandler = async (req: Request, res: Response) => {
  const { itemId } = req.params;

  if (!itemId || isNaN(Number(itemId))) {
    res.status(400).json({ error: "Valid itemId param required" });
    return;
  }

  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) {
    res.status(400).json({ error: "No images uploaded" });
    return;
  }

  const coverIndexRaw = req.body.coverIndex;
  let coverIndex: number | null = null;

  if (coverIndexRaw !== undefined && coverIndexRaw !== null && coverIndexRaw !== "") {
    const parsed = Number(coverIndexRaw);
    coverIndex = Number.isNaN(parsed) ? null : parsed;
  }

  // ha van coverIndex, akkor azt tesszük az első helyre
  let orderedFiles = files;
  if (
    coverIndex !== null &&
    coverIndex >= 0 &&
    coverIndex < files.length
  ) {
    const coverFile = files[coverIndex];
    orderedFiles = [
      coverFile,
      ...files.filter((_, idx) => idx !== coverIndex),
    ];
  }

  try {
    // Minden képet beszúrunk az "IMAGE" táblába
    // img_url: a frontend felé relatív URL, pl. /uploads/items/<filename>
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let place = 0;
      const imgUrls: string[] = [];

      for (const file of orderedFiles) {
        const relativeUrl = `/uploads/items/${file.filename}`;
        imgUrls.push(relativeUrl);

        await client.query(
          `
          INSERT INTO "IMAGE" (item_id, img_url, place)
          VALUES ($1, $2, $3);
          `,
          [itemId, relativeUrl, place]
        );
        place += 1;
      }

      await client.query("COMMIT");

      res.status(201).json({ item_id: Number(itemId), img_urls: imgUrls });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Error saving item images:", err);
      res.status(500).json({ error: "Failed to save images" });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("DB connection error:", err);
    res.status(500).json({ error: "Failed to save images" });
  }
};

// Routes
router.get("/", getAllItemsHandler);
router.get("/:itemId", getSingleItemHandler);
router.post("/", createItemHandler);
router.post("/:itemId/images", upload.array("images[]", 5), uploadItemImagesHandler);

export default router;
