import { Router, Request, Response } from "express";
import pool from "../database/pool-connect";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {
  AuthRequest,
  userAuthorization,
  verifyToken,
} from "../middleware/auth";
import {
  AddNewUser,
  isExistingUser,
  generateTokenForUser,
  logout,
  getallUsers,
  getUserByEmail,
} from "../models/authenication-model";

const router = Router();
dotenv.config();

// #region Create User
export const createUserController = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "name, email and password are required" });
    }

    const result = await isExistingUser(email);

    if (result.rows.length > 0) {
      return res.status(409).send("User Already Exist!");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await AddNewUser(name, email, hashPassword);

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};

// #region Login
export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await isExistingUser(email);

    if (result.rows.length === 0)
      return res.status(400).json({ error: "Invalid credentials" });

    const validPassword = await bcrypt.compare(
      password,
      result.rows[0].password
    );
    if (!validPassword)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = await generateTokenForUser(result);

    res.json({ message: "Login Sucessful", token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// #region Logout
export const logoutController = async (req: AuthRequest, res: Response) => {
  const id = req.user?.id;
  if (!id) return res.status(400).json({ error: "Something went Wrong" });

  try {
    await logout(id);
    res.json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// #region Get All Users
export const getAllUsersController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const allUsers = await getallUsers();
    res.status(200).json(allUsers.rows);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};

// #region Get User By Email
export const getUserByEmailIdController = async (
  req: AuthRequest,
  res: Response
) => {
  const { email } = req.params;
  try {
    const User = await getUserByEmail(email);
    res.status(200).json(User);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};
