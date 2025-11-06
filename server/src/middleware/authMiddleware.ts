import jwt from "jsonwebtoken";

export function authenticate(req: any, res: any, next: any) {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    req.user = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET || "your-secret-key"
    );
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
