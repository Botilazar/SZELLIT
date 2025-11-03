import { Router } from "express";
import { verifyToken } from "./verifyToken";

const router = Router();

// Returns the logged-in user's info from the verified JWT
router.get("/", verifyToken, async (req, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    // Depending on what you store in the JWT payload,
    // you can send it back directly.
    // For example: { id, username, email }
    res.json({
      user_id: req.user.user_id ?? req.user.userId,
      fname: req.user.fname,
      lname: req.user.lname,
      role: req.user.role,
      neptun: req.user.neptun,
      email: req.user.email,
      prof_pic_url: req.user.prof_pic_url,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
