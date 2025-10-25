import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken: RequestHandler = (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) {
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res
        .status(500)
        .json({ error: "Server misconfigured: JWT_SECRET missing" });
      return;
    }

    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
