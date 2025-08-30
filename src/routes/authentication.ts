import {
  createUserController,
  getAllUsersController,
  getUserByEmailIdController,
  loginController,
  logoutController,
} from "../controllers/authentication-controller";
import { Router } from "express";
import { userAuthorization, verifyToken } from "../middleware/auth";

const router = Router();

router.post( "/createUser", verifyToken, userAuthorization, createUserController);

router.get( "/getallUsers", verifyToken, userAuthorization, getAllUsersController);

router.get( "/getUser/:email", verifyToken, userAuthorization, getUserByEmailIdController);

router.post("/login", loginController);

router.post("/logout", verifyToken, logoutController);

export default router;
