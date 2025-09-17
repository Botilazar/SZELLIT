import { Router, RequestHandler } from "express";
import pool from "../db";
import { verifyToken } from "./auth/verifyToken";

const router = Router();
router.use(verifyToken);

// =======================
// GET /api/badges -> list all badges
// =======================
const listBadgesHandler: RequestHandler = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT badge_id, name, icon_url, min_honors
       FROM "BADGES"
       ORDER BY min_honors ASC`
        );
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching badges:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =======================
// GET /api/badges/current/:userId -> user's current badge
// =======================
const getCurrentBadgeHandler: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT b.badge_id, b.name, b.icon_url, b.min_honors
       FROM "BADGES" b
       WHERE b.min_honors <= (
         SELECT COUNT(*) FROM "HONORS" h WHERE h.receiver_id = $1
       )
       ORDER BY b.min_honors DESC
       LIMIT 1`,
            [userId]
        );

        res.json(result.rows[0] || null); // null if no badge yet
    } catch (err) {
        console.error("Error fetching current badge:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// =======================
// GET /api/badges/next/:userId -> next achievable badge
// =======================
const getNextBadgeHandler: RequestHandler = async (req, res) => {
    try {
        const { userId } = req.params;

        const result = await pool.query(
            `SELECT b.badge_id, b.name, b.icon_url, b.min_honors
       FROM "BADGES" b
       WHERE b.min_honors > (
         SELECT COUNT(*) FROM "HONORS" h WHERE h.receiver_id = $1
       )
       ORDER BY b.min_honors ASC
       LIMIT 1`,
            [userId]
        );

        res.json(result.rows[0] || null); // null if already highest badge
    } catch (err) {
        console.error("Error fetching next badge:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Register routes
router.get("/", listBadgesHandler);
router.get("/current/:userId", getCurrentBadgeHandler);
router.get("/next/:userId", getNextBadgeHandler);

export default router;
