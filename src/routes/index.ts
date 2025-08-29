import { Router, Request, Response } from "express";
import pool from "../database/pool-connect.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AuthRequest ,userAuthorization,verifyToken} from "../middleware/auth.js";
import { generateAccessToken, TOKEN_EXPIRY_MS } from "../utils/jwt.js";

const router = Router();
dotenv.config();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }

    const isExistingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (isExistingUser.rows.length > 0) {
      return res.status(409).send("User Already Exist!");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name,email, password) VALUES($1, $2, $3) RETURNING id, email",
      [name, email, hashPassword]
    );

    res.status(201).json(newUser.rows[0]);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
});

router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: "Invalid credentials" });

    // Generate token
    const payload = { id: user.id, email: user.email };
    const token = generateAccessToken(payload);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MS);

    // Store token in users table
    await pool.query(
      "UPDATE users SET token = $1, token_generated_at = $2, token_expires_at = $3 WHERE id = $4",
      [token, now, expiresAt, user.id]
    );

    res.json({message:"Login Sucessful", token, token_expires_at: expiresAt });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/getallUsers", verifyToken, userAuthorization, async (req: Request, res: Response) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");

    res.status(200).json(allUsers.rows);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
});

router.get("/getUser/:email", async (req: Request, res: Response) => {
  const { email } = req.params;

  const user = await pool.query("SELECT * FROM users where email = $1", [
    email,
  ]);

  if (user.rows.length === 0) {
    return res.status(404).send("User not Found!");
  }
  res.status(200).send(user.rows);
});

router.get("/profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user?.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
