import type { Request, Response, NextFunction, RequestHandler } from "express";
import jwt from "jsonwebtoken";

// Bővítjük a Request-et, hogy legyen user rajta
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const verifyToken: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = auth.substring(7);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500).json({ error: "Server misconfigured: JWT_SECRET missing" });
      return;
    }
    const payload = jwt.verify(token, secret);
    req.user = payload;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
