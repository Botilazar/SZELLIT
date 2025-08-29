// server/src/routes/users.ts
import { Router, Request, Response, RequestHandler } from "express";
import pool from "../db";
import { verifyToken } from "./auth/verifyToken";

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

// GET /api/users -> fetch all users (admin only)
const listUsersHandler: RequestHandler = async (req: Request, res: Response) => {
    try {
        const user = getUser(req);

        if (user.role !== "ADMIN") {
            res.status(403).json({ error: "Forbidden: admin only" });
            return;
        }

        const result = await pool.query(`
      SELECT 
        user_id,
        fname,
        lname,
        email,
        role,
        is_verified,
        created_at
      FROM "USER"
      ORDER BY user_id ASC
    `);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};

router.get("/", listUsersHandler);

export default router;
