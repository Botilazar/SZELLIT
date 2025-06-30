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
