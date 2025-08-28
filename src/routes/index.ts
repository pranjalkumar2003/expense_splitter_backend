import { Router, Request, Response } from "express";
import pool from "../database/pool-connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    console.log("📩 Body received:", req.body);

    const { email, password } = req.body;

    const user = await pool.query("SELECT * from users where email=$1", [email]);
    console.log("🔍 User query result:", user.rows);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    console.log("🔑 Comparing password...");
    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    console.log("🪪 Signing JWT...");
    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    res.json({
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).send("Something went wrong. Please try again later!");
  }
});


export default router;
