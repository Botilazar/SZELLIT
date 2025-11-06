import { Router } from "express";
import jwt from "jsonwebtoken";
import pool from "../../db";

const router = Router();

router.post("/", async (req: any, res: any) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Verification token is required." });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET!;
    // Verify the JWT token
    const decoded = jwt.verify(token, jwtSecret) as { email: string };
    const { email } = decoded;

    // Check if user exists and is not already verified
    const userResult = await pool.query(
      `SELECT user_id, email, fname, lname, is_verified FROM "USER" WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    if (user.is_verified) {
      return res
        .status(400)
        .json({ message: "Email is already verified", alreadyVerified: true });
    }

    // Update user verification status
    await pool.query(`UPDATE "USER" SET is_verified = true WHERE email = $1`, [
      email,
    ]);

    // Create a new access token for auto-login
    const accessToken = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "15m" }
    );

    // Create refresh token
    const refreshToken = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
      },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Determine cookie settings based on environment
    /*const isProduction = process.env.NODE_ENV === "production";
    const secureCookie = isProduction
      ? process.env.PROD_SECURE_COOKIE === "true"
      : process.env.DEV_SECURE_COOKIE === "true";
    const sameSite = isProduction
      ? (process.env.PROD_SAMESITE as "lax" | "strict" | "none")
      : (process.env.DEV_SAMESITE as "lax" | "strict" | "none");

    console.log(
      `Setting cookie with secure=${secureCookie}, sameSite=${sameSite}`
    );*/
    // Set refresh token in httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.DEV_SECURE_COOKIE,
      sameSite: process.env.DEV_SAMESITE,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Prepare user data to return
    const userData = {
      id: user.user_id,
      fullName: `${user.fname} ${user.lname}`.trim(),
      email: user.email,
      isVerified: true,
    };

    res.status(200).json({
      message: "Email verified successfully",
      user: userData,
      token: accessToken, // For automatic login
    });
  } catch (error: any) {
    console.error("Email verification error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        message:
          "Verification token has expired. Please request a new verification email.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        message: "Invalid verification token",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
