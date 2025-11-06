import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../../db";
import Joi from "joi";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendVerificationEmail } from "../../services/email.service";

const router = Router();

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[a-z]/)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[\W_]/)
    .required(),
  lng: Joi.string().valid("en", "hu", "de").optional(),
  neptun: Joi.string().alphanum().length(6).optional(),
});

// Register new user
router.post("/", async (req: any, res: any) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { fullName, email, password, neptun } = req.body;
  const lng = req.body.lng || "en";

  try {
    const [fname, ...rest] = fullName.trim().split(" ");
    const lname = rest.join(" ") || ""; // In case only one name is given

    // Check if email already exists
    const emailCheck = await pool.query(
      `SELECT user_id FROM "USER" WHERE email = $1`,
      [email]
    );

    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.query(
      `INSERT INTO "USER" (email, pw_hashed, is_verified, created_at, fname, lname, neptun, role) 
             VALUES ($1, $2, false, NOW(), $3, $4, $5, 'STDUSER') 
             RETURNING user_id, email, created_at, fname, lname, role`,
      [email, hashedPassword, fname, lname, neptun]
    );

    const newUser = result.rows[0];

    const jwtSecret = process.env.JWT_SECRET!;
    const frontendURL = process.env.FRONTEND_URL!;

    const token = jwt.sign({ email }, jwtSecret, { expiresIn: "1d" });
    const verificationLink = `${frontendURL}/${lng}/verify-email?token=${token}`;

    try {
      await sendVerificationEmail(email, fullName, verificationLink, lng);

      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error("Error sending verification email:", emailError);
      return res
        .status(500)
        .json({ error: "Failed to send verification email" });
    }

    // Return user data (excluding password)
    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      user: {
        id: newUser.user_id,
        fullName: `${newUser.fname} ${newUser.lname}`,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.created_at,
      },
    });
  } catch (err: any) {
    console.error("Error registering user:", err.message, err.stack);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check if email exists (for frontend validation)
router.get("/check-email/:email", async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      `SELECT user_id FROM "USER" WHERE email = $1`,
      [email]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
