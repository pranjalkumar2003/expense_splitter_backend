import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AuthRequest } from "../middleware/auth";
import {
  AddNewUser,
  isExistingUser,
  generateTokenForUser,
  logout,
  getallUsers,
  getUserByEmail,
  saveInviteToken,
  verifyInviteToken,
  isValidInviteToken,
  setUserPassword,
  isUserActive,
  userDeactivation,
} from "../models/authenication-model";
import { sendInviteEmail } from "../utils/mailer";

dotenv.config();

// #region Add User
export const addUserController = async (req: Request, res: Response) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "name and email are required" });
    }

    const result = await isExistingUser(email);
    if (result.rows.length > 0) {
      return res.status(409).send("User Already Exist!");
    }

    // Generate a random password (hidden from user)
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashPassword = await bcrypt.hash(randomPassword, 10);

    const newUser = await AddNewUser(name, email, hashPassword, 0, 0);
    // Generate invite token (JWT or random string)
    const inviteToken = crypto.randomBytes(16).toString("hex");

    const tokenResult = await saveInviteToken(newUser.id, inviteToken);
    // Only proceed if DB returned a valid row and email matches
    if (
      tokenResult.rows.length > 0 &&
      tokenResult.rows[0].email === newUser.email
    ) {
      const inviteLink = `${process.env.FRONTEND_URL}/accept-invite/${inviteToken}`;
      await sendInviteEmail(newUser.email, newUser.name, inviteLink);

      return res.status(201).json({
        message: "User created and invite sent successfully.",
        user: { id: newUser.id, name: newUser.name, email: newUser.email },
      });
    } else {
      return res.status(500).json({
        error: "Invite token could not be saved properly. Email not sent.",
      });
    }
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};

// #region signUp
export const verifyInviteController = async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await verifyInviteToken(token);

  if (
    result.rows.length === 0 ||
    new Date(result.rows[0].invite_expiry) < new Date()
  ) {
    return res.status(400).json({ error: "Invalid or expired invite link" });
  }

  res.json({ message: "Valid invite", user: result.rows[0] });
};

export const acceptInviteController = async (req: Request, res: Response) => {
  try {
    const { token, password, confirmPassword } = req.body;

    const result = await isValidInviteToken(token);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired invite link" });
    }

    const userId = result.rows[0].id;
    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ error: "password & confirm password doesn't match!" });
    }
    const hashPassword = await bcrypt.hash(password, 10);

    const passwordresult = await setUserPassword(hashPassword, userId);
    if (passwordresult.rows[0].id) {
      res.status(201).json({ message: "Signup completed successfully!" });
    }

    res
      .status(400)
      .json({ error: "Something went wrong. Please try again later!" });
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

    const isuserActive = await isUserActive(email);

    if (isuserActive.rowCount && isuserActive.rows[0].isactive) {
      const token = await generateTokenForUser(result);

      res.json({ message: "Login Sucessful", token });
    }
    res.status(500).json({ error: "User either Inactive or We are down!" });
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
    if (User.rowCount === 0) {
      res.status(400).json({ error: "User Doesn't exist!" });
    }
    res.status(200).json(User.rows[0]);
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};

// #region mark user Inactive
export const deactivateUserController = async (req: AuthRequest, res: Response) => {
  try {
    const { email, reason } = req.body;
    if (!email) {
      res.status(400).json({ error: "Enter email for user Deactivation" });
    }
    const User = await getUserByEmail(email);
    if (User.rowCount === 0) {
      res.status(400).json({ error: "User Doesn't exist!" });
    }
    if (!reason) {
      res.status(400).json({ error: "Enter reson for user Deactivation" });
    }
    const result = await userDeactivation(email);
    res.status(200).json({result: result.rows[0].email, message:"User marked Inactive"});
  } catch (error) {
    res.status(500).send("Something went wrong. Please try again later!");
  }
};
