import pool from "../database/pool-connect";

export interface Member {
  user_id: number;
  user_name: string;
}

export interface Expense {
  id: number;
  member_id: number; // who paid
  paid_amount: number;
}

export const getGroupMembers = async (groupId: number): Promise<Member[]> => {
  const result = await pool.query(
    "SELECT user_id, user_name FROM group_members WHERE group_id = $1",
    [groupId]
  );
  return result.rows;
};

export const getGroupExpenses = async (groupId: number): Promise<Expense[]> => {
  const result = await pool.query(
    "SELECT id, member_id, paid_amount FROM expenses WHERE group_id = $1 ORDER BY created_at ASC",
    [groupId]
  );
  return result.rows;
};
