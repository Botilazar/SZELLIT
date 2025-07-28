import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../../db";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Missing token or password." });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM "USER" WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `UPDATE "USER" SET pw_hashed = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2`,
      [hashedPassword, token]
    );

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Confirm reset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
