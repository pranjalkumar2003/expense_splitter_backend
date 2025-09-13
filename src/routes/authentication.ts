import {
  acceptInviteController,
  addUserController,
  getAllUsersController,
  getUserByEmailIdController,
  loginController,
  logoutController,
  verifyInviteController,
} from "../controllers/authentication-controller";
import { Router } from "express";
import { userAuthorization, verifyToken } from "../middleware/auth";

const router = Router();

router.post( "/addUser", verifyToken, userAuthorization, addUserController);

router.get("/verify-invite/:token", verifyInviteController);

router.post("/accept-invite", acceptInviteController);

router.get( "/User", verifyToken, userAuthorization, getAllUsersController);

router.get( "/User/:email", verifyToken, userAuthorization, getUserByEmailIdController);

router.post("/login", loginController);

router.post("/logout", verifyToken, logoutController);

export default router;
