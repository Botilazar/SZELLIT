import { Router } from "express";

const router = Router();

router.post("/", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.DEV_SECURE_COOKIE === "true",
    sameSite: process.env.DEV_SAMESITE as "lax" | "strict" | "none",
  });

  res.status(200).json({ message: "Logged out" });
});

export default router;
