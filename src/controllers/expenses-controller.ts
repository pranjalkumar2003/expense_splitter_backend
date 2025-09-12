import { AuthRequest } from "middleware/auth";
import { Response } from "express";
import { AddExpenses } from "../models/expenses-model";
import {
  getGroupById,
  getMemberofGroupById,
} from "../models/group-model";

export const AddExpensesController = async (
  req: AuthRequest,
  res: Response
) => {
  const { id } = req.params;
  const { paid_by, amount, description } = req.body;

  try {
    if (!id) {
      return res.status(400).send("Please provide a group id");
    }
    const isGroupExist = await getGroupById(id);
    if (!isGroupExist.rowCount) {
      res.status(400).send("Group Id Does not exist in database");
    }
    const group_name = isGroupExist.rows[0].name;
    if (!paid_by && !amount) {
      return res.status(400).send("paid_by and amount are required");
    }

    const isGroupMemberExist = await getMemberofGroupById(paid_by, id);

    if (!isGroupMemberExist.rowCount) {
      res.status(400).send("Group Member Does not exist in the group");
    }
    const paidByUserName= isGroupMemberExist.rows[0].user_name;

    const result = await AddExpenses(
      id,
      group_name,
      paid_by,
      paidByUserName,
      amount,
      description
    );
    res.status(200).send(result.rows);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};
