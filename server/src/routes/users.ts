// server/src/routes/users.ts
import { Router, Request, Response, RequestHandler } from "express";
import pool from "../db";
import { verifyToken } from "./auth/verifyToken";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// All endpoints are protected
router.use(verifyToken);

// Helper: get user payload from request
function getUser(req: Request) {
    const user = (req as any).user as { user_id?: number; role?: string } | undefined;
    if (!user || typeof user.user_id !== "number" || !user.role) {
        throw new Error("Invalid token payload");
    }
    return user;
}

// Setup multer for profile pictures
const uploadDir = path.join(__dirname, "../../uploads/profile-pics");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `user-${Date.now()}${ext}`);
    },
});
const upload = multer({ storage });

// =======================
// GET /api/users -> list all users (admin only)
// =======================
const listUsersHandler: RequestHandler = async (req, res) => {
    try {
        const user = getUser(req);

        if (user.role !== "ADMIN") {
            res.status(403).json({ error: "Forbidden: admin only" });
            return;
        }

        const result = await pool.query(
            `SELECT 
                user_id,
                fname,
                lname,
                email,
                role,
                is_verified,
                prof_pic_url,
                created_at
             FROM "USER"
             ORDER BY user_id ASC`
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =======================
// GET /api/users/:id -> fetch single user (any logged in user)
// =======================
const getUserHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT 
                user_id,
                fname,
                lname,
                email,
                role,
                is_verified,
                prof_pic_url,
                neptun,
                created_at
             FROM "USER"
             WHERE user_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error fetching user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =======================
// PUT /api/users/:id -> update user profile (self only)
// =======================
const updateUserHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const authUser = getUser(req);

        if (authUser.user_id !== Number(id) && authUser.role !== "ADMIN") {
            res.status(403).json({ error: "Forbidden: cannot update other users" });
            return;
        }

        const { fname, lname, email, prof_pic_url } = req.body;

        const result = await pool.query(
            `UPDATE "USER"
             SET fname = $1,
                 lname = $2,
                 email = $3,
                 prof_pic_url = $4
             WHERE user_id = $5
             RETURNING user_id, fname, lname, email, prof_pic_url, role, is_verified, created_at`,
            [fname, lname, email, prof_pic_url, id]
        );

        if (result.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error updating user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =======================
// POST /api/users/:id/profile-pic -> upload profile picture
// =======================
const uploadProfilePicHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;
        const authUser = getUser(req);

        if (authUser.user_id !== Number(id) && authUser.role !== "ADMIN") {
            res.status(403).json({ error: "Forbidden: cannot update other users" });
            return;
        }

        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const fileUrl = `/uploads/profile-pics/${req.file.filename}`;

        const result = await pool.query(
            `UPDATE "USER"
             SET prof_pic_url = $1
             WHERE user_id = $2
             RETURNING user_id, fname, lname, email, prof_pic_url, role, is_verified, created_at`,
            [fileUrl, id]
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error("Error uploading profile picture:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =======================
// GET /api/users/:id/items -> fetch items for a specific user
// =======================
const getUserItemsHandler: RequestHandler = async (req, res) => {
    try {
        const { id } = req.params;

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
                 CASE WHEN TRIM(COALESCE(u.lname, '')) <> '' THEN ' ' || TRIM(u.lname) ELSE '' END) AS seller_name,
                'Budapest' AS city,
                (
                    SELECT ARRAY_REMOVE(ARRAY_AGG(img.img_url ORDER BY img.place ASC), NULL)
                    FROM "IMAGE" img
                    WHERE img.item_id = i.item_id
                ) AS image_url,
                u.prof_pic_url
            FROM "ITEM" i
            JOIN "CATEGORY" c ON i.category_id = c.category_id
            JOIN "USER" u ON u.user_id = i.user_id
            WHERE i.user_id = $1
            ORDER BY i.created_at DESC
            `,
            [id]
        );

        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching user items:", err);
        res.status(500).json({ error: "Failed to fetch items" });
    }
};

// Register routes
router.get("/", listUsersHandler);
router.get("/:id", getUserHandler);
router.put("/:id", updateUserHandler);
router.post("/:id/upload-profile-pic", upload.single("profile_pic"), uploadProfilePicHandler);
router.get("/:id/items", getUserItemsHandler);

export default router;
