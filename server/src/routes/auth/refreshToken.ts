// server/src/auth/refreshToken.ts
import { Router } from "express";
import jwt from "jsonwebtoken";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

router.post("/", (req: any, res: any) => {
  const token = req.cookies.refreshToken;

  if (!token) return res.status(401).json({ error: "No refresh token" });

  try {
    const user = jwt.verify(token, JWT_SECRET);
    const newAccessToken = jwt.sign(user as any, JWT_SECRET, {
      expiresIn: "15m",
    });

    res.json({ token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
});

export default router;
