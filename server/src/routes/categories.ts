import { Router } from "express";
import pool from "../db"; // your PostgreSQL pool

const router = Router();

// GET /api/categories
router.get("/", async (req, res) => {
    try {
        const result = await pool.query('SELECT name FROM "CATEGORY" ORDER BY category_id');
        const categories = result.rows.map(row => row.name);
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});

export default router;
