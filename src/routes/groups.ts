import { userAuthorization, verifyToken } from "../middleware/auth";
import { Router } from "express";
import {
  AddGroupMemberController,
  createGroupController,
  getAllGroupMemberController,
  getAllGroupsController,
  getGroupByIdControllers,
  getGroupMemberController,
} from "../controllers/group-controller";

const router = Router();

// Create a new group
router.post("/", verifyToken, createGroupController);

// Get all groups
router.get("/", verifyToken, userAuthorization, getAllGroupsController);

// Get all Group Members
router.get("/members", verifyToken, getAllGroupMemberController);

// Get group by ID
router.get("/:id", getGroupByIdControllers);

// Add Group Member
router.post("/:idOrName/members", verifyToken, AddGroupMemberController);

// Get all Members of group
router.get("/:idOrName/members", verifyToken, getGroupMemberController);



export default router;
