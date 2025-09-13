import { Router } from "express";
import { getRawBalances, getSettlements } from "../controllers/balance-controller";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Raw balances per group
router.get("/:groupId/raw", verifyToken, getRawBalances);

// Settlement suggestions
router.get("/:groupId/settlements", verifyToken, getSettlements);

export default router;
