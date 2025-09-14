import {
  acceptInviteController,
  addUserController,
  deactivateUserController,
  getAllUsersController,
  getUserByEmailIdController,
  loginController,
  logoutController,
  verifyInviteController,
} from "../controllers/authentication-controller";
import { Router } from "express";
import { userAuthorization, verifyToken } from "../middleware/auth";

const router = Router();

router.post( "/user/add", verifyToken, userAuthorization, addUserController);

router.get("/user/verify-invite/:token", verifyInviteController);

router.post("/user/accept-invite", acceptInviteController);

router.get( "/user", verifyToken, userAuthorization, getAllUsersController);

router.get( "/user/:email", verifyToken, userAuthorization, getUserByEmailIdController);

router.post("/user/login", loginController);

router.post("/user/logout", verifyToken, logoutController);

router.post("/user/deactivate",verifyToken, userAuthorization,deactivateUserController);

export default router;
