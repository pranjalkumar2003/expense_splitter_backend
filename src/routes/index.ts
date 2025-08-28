import { Router, Request, Response } from "express";
import pool from "../database/pool-connect.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const isExistingUser = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );
    console.log(isExistingUser, "isExistingUser");
    if (isExistingUser.rows.length > 0) {
      return res.status(409).send("User Already Exist!");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users (name,email, password) VALUES($1, $2, $3) RETURNING id, email",
      [name, email, hashPassword]
    );

    res.status(200).json(newUser.rows[0]);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * from users where email=$1", [
      email,
    ]);

    if (user.rows.length === 0) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const validPass = await bcrypt.compare(password, user.rows[0].password);
    if (!validPass) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

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
    res.status(500).send("Something went wrong. Please try again later!");
  }
});

router.get("/getallUsers", async (req: Request, res: Response) => {
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

export default router;
