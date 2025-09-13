import { AddExpensesController, getAllGroupExpensesController } from "../controllers/expenses-controller";
import { Router } from "express";


const router = Router();

router.post("/:id/expenses",AddExpensesController);

router.get("/:id/expenses",getAllGroupExpensesController);


export default router;