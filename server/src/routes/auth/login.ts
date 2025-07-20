// server/src/routes/login.ts
import e, { Router } from "express";
import bcrypt from "bcrypt";
import pool from "../../db";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

router.post("/", async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query(
      `SELECT user_id, email, pw_hashed, fname, lname FROM "USER" WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.pw_hashed);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    //create a safe user object to return
    // This is to avoid sending sensitive information like password hash - else it could be used for malicious purposes (visible in dev tools)
    const safeUser = {
      user_id: user.user_id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
    };

    const token = jwt.sign(safeUser, JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({ user: safeUser, token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
