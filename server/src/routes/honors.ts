import { Router, Request, Response, RequestHandler } from "express";
import pool from "../db";
import { verifyToken } from "./auth/verifyToken";

const router = Router();

// All endpoints are protected
router.use(verifyToken);

// Helper: get user payload from request
function getUser(req: Request) {
  const user = (req as any).user as
    | { user_id?: number; role?: string }
    | undefined;
  if (!user || typeof user.user_id !== "number" || !user.role) {
    throw new Error("Invalid token payload");
  }
  return user;
}

// POST /api/honors/:receiverId -> give an honor
const giveHonorHandler: RequestHandler = async (req, res) => {
  try {
    const giver = getUser(req);
    const receiverId = Number(req.params.receiverId);

    if (giver.user_id === receiverId) {
      res.status(400).json({ error: "Cannot honor yourself" });
      return;
    }

    await pool.query(
      `INSERT INTO "HONORS" (giver_id, receiver_id)
             VALUES ($1, $2)
             ON CONFLICT (giver_id, receiver_id) DO NOTHING`,
      [giver.user_id, receiverId]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM "HONORS" WHERE receiver_id = $1`,
      [receiverId]
    );

    res
      .status(201)
      .json({
        message: "Honor given",
        totalHonors: parseInt(countRes.rows[0].total),
      });
  } catch (err) {
    console.error("Error giving honor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// DELETE /api/honors/:receiverId -> remove honor
const removeHonorHandler: RequestHandler = async (req, res) => {
  try {
    const giver = getUser(req);
    const receiverId = Number(req.params.receiverId);

    await pool.query(
      `DELETE FROM "HONORS" WHERE giver_id = $1 AND receiver_id = $2`,
      [giver.user_id, receiverId]
    );

    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM "HONORS" WHERE receiver_id = $1`,
      [receiverId]
    );

    res
      .status(200)
      .json({
        message: "Honor removed",
        totalHonors: parseInt(countRes.rows[0].total),
      });
  } catch (err) {
    console.error("Error removing honor:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/honors/:userId -> get honors, current badge, earned badges, hasHonored
const getHonorsHandler: RequestHandler = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const currentUser = getUser(req);

    // total honors
    const countRes = await pool.query(
      `SELECT COUNT(*) AS total FROM "HONORS" WHERE receiver_id = $1`,
      [userId]
    );
    const totalHonors = parseInt(countRes.rows[0].total);

    // current highest badge
    const badgeRes = await pool.query(
      `SELECT badge_id, name, icon_url, min_honors
             FROM "BADGES"
             WHERE min_honors <= $1
             ORDER BY min_honors DESC
             LIMIT 1`,
      [totalHonors]
    );
    const currentBadge = badgeRes.rows[0] || null;

    // all earned badges
    const badgesRes = await pool.query(
      `SELECT badge_id, name, icon_url, min_honors
             FROM "BADGES"
             WHERE min_honors <= $1
             ORDER BY min_honors ASC`,
      [totalHonors]
    );

    // check if current user has already honored
    const honorCheck = await pool.query(
      `SELECT 1 FROM "HONORS" WHERE receiver_id = $1 AND giver_id = $2`,
      [userId, currentUser.user_id]
    );
    const hasHonored = (honorCheck.rowCount ?? 0) > 0;

    res.json({
      totalHonors,
      currentBadge,
      earnedBadges: badgesRes.rows,
      hasHonored,
    });
  } catch (err) {
    console.error("Error fetching honors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// =======================
// Register routes
// =======================
router.post("/:receiverId", giveHonorHandler);
router.delete("/:receiverId", removeHonorHandler);
router.get("/:userId", getHonorsHandler);

export default router;
