import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../db";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ error: "Missing token or password." });
  }

  const secret = process.env.JWT_SECRET!;
  if (!secret) {
    return res
      .status(500)
      .json({ error: "Server misconfigured: JWT_SECRET missing" });
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(`UPDATE "USER" SET pw_hashed = $1 WHERE user_id = $2`, [
      hashedPassword,
      decoded.userId,
    ]);

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error("Confirm reset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
