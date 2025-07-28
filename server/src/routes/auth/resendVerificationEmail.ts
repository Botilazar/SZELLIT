import { Router } from "express";
import { sendVerificationEmail } from "../../services/email.service";
import pool from "../../db";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { email, lng } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const result = await pool.query(`SELECT * FROM "USER" WHERE email = $1`, [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: "If the email exists, a verification has been resent.",
      });
    }

    const user = result.rows[0];

    if (user.is_verified) {
      return res.status(400).json({ error: "Email already verified." });
    }

    // You may want to regenerate the token or reuse the old one
    const token = user.verification_token;

    await sendVerificationEmail(email, token, lng);
    res.status(200).json({ message: "Verification email resent." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
