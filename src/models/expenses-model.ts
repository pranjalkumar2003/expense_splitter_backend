import pool from "../database/pool-connect";

export const AddExpenses = async (
  group_id: number | string,
  group_name: string,
  paid_by: number,
  paid_by_user_name: string,
  amount: number,
  description: string
) => {
  const result = await pool.query(
    `INSERT INTO expenses (group_id,group_name, paid_by , paid_by_user_name, amount, description) 
       VALUES ($1,$2, $3, $4, $5, $6) RETURNING *`,
    [group_id, group_name, paid_by, paid_by_user_name, amount, description || null]
  );
  return result;
};
