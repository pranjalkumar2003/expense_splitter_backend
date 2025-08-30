import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { verifyTKN as verifyJWT } from "../utils/jwt";
import pool from "../database/pool-connect";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: number;
      email: string;
    };
    req.user = decoded; // attach user info to request
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

export const verifyToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token required" });

    // Verify JWT signature
    const decoded = verifyJWT(token) as { id: number; email: string };

    // Check DB if token matches and not expired
    const result = await pool.query(
      "SELECT token, token_expires_at FROM users WHERE id = $1",
      [decoded.id]
    );

    if (result.rows.length === 0){
      return res.status(404).json({ error: "User not found" });
    }

    const userToken = result.rows[0].token;
    const expiresAt = result.rows[0].token_expires_at;

    if (token !== userToken)
      return res.status(403).json({ error: "Token invalidated" });
    if (new Date() > new Date(expiresAt))
      return res.status(403).json({ error: "Token expired" });

    // Attach user info to request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid token" });
  }
};

export const userAuthorization = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const id = req.user?.id;

  const result = await pool.query(
    "SELECT isadmin FROM users where id = $1",
    [id]
  );
  try {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!result.rows[0].isadmin) {
      return res.status(403).send("Not allowed to consume this API");
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};
