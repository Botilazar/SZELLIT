import { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../../db";
import Joi from "joi";

const router = Router();

const registerSchema = Joi.object({
  fullName: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  username: Joi.string().alphanum().min(3).required(),
  password: Joi.string()
    .min(8)
    .pattern(/[a-z]/)
    .pattern(/[A-Z]/)
    .pattern(/[0-9]/)
    .pattern(/[\W_]/)
    .required(),
});

// Register new user
router.post("/", async (req: any, res: any) => {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { fullName, email, password } = req.body; //USERNAME NINCS A DB-ben??? MOST AKKOR TAROLJUK VAGY NE?

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

    // Check if username already exists
    /*const usernameCheck = await pool.query(
      `SELECT user_id FROM "USER" WHERE username = $1`,
      [username]
    );

    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ error: "Username already exists" });
    }*/

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const neptun = ""; // Placeholder for neptun code, if needed
    // Insert new user
    const result = await pool.query(
      `INSERT INTO "USER" (email, pw_hashed, is_verified, created_at, fname, lname, neptun) 
             VALUES ($1, $2, false, NOW(), $3, $4, $5) 
             RETURNING user_id, email, created_at, fname, lname`,
      [email, hashedPassword, fname, lname, neptun]
    );

    const newUser = result.rows[0];

    // Return user data (excluding password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser.user_id,
        fullName: `${newUser.fname} ${newUser.lname}`,
        email: newUser.email,
        //username: newUser.username,
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

// Check if username exists (for frontend validation)
/*router.get("/check-username/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const result = await pool.query(
      `SELECT user_id FROM "USER" WHERE username = $1`,
      [username]
    );

    res.json({ exists: result.rows.length > 0 });
  } catch (err) {
    console.error("Error checking username:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});*/

export default router;
