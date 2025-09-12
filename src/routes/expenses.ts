import { AddExpensesController } from "../controllers/expenses-controller";
import { Router } from "express";


const router = Router();

router.post("/:id/expenses",AddExpensesController);

export default router;