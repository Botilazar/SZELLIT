import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../../db";
import { sendResetPWEmail } from "../../services/email.service";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { email, lng } = req.body;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(`SELECT * FROM "USER" WHERE email = $1`, [
      email,
    ]);

    if (result.rows.length === 0) {
      // Security: still return success (don't reveal whether user exists)
      return res.status(200).json({
        message: "If the email exists, reset instructions have been sent.",
      });
    }

    const user = result.rows[0];
    const secret = process.env.JWT_SECRET!;

    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const token = jwt.sign({ userId: user.user_id }, secret, {
      expiresIn: "1h",
    });

    const fullName =
      user.username || user.name || `${user.fname} ${user.lname}`;
    const langPath = lng || "en";
    const resetLink = `${
      process.env.CLIENT_URL
    }/${langPath}/reset-password-confirm?token=${token}&email=${encodeURIComponent(
      email
    )}&lng=${langPath}`;

    try {
      await sendResetPWEmail(email, fullName, resetLink);
    } catch (emailErr) {
      console.error("Email sending failed:", emailErr);
      return res.status(500).json({ error: "Failed to send reset email" });
    }

    res.status(200).json({ message: "Reset email sent." });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
