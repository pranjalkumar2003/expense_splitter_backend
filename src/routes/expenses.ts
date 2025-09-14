import { AddExpensesController, getAllGroupExpensesController } from "../controllers/expenses-controller";
import { Router } from "express";


const router = Router();

router.post("/:groupId",AddExpensesController);

router.get("/:groupId",getAllGroupExpensesController);


export default router;