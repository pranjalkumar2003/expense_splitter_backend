import { userAuthorization, verifyToken } from "../middleware/auth";
import { Router } from "express";
import {
  createGroupController,
  getAllGroupsController,
  getGroupByIdControllers,
} from "../controllers/group-controller";

const router = Router();

// Create a new group
router.post("/", verifyToken, createGroupController);

// Get all groups
router.get("/", verifyToken, userAuthorization, getAllGroupsController);

// Get group by ID
router.get("/:id", getGroupByIdControllers);


export default router;
