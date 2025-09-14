import pool from "../database/pool-connect";

export const AddExpenses = async (
  group_id: number | string,
  group_name: string,
  member_id: number,
  member_name: string,
  amount: number,
  description: string
) => {
  console.log(group_id,group_name,member_id,member_name,amount);
  const result = await pool.query(
    `INSERT INTO expenses (group_id,group_name, member_id , member_name, paid_amount, description) 
       VALUES ($1,$2, $3, $4, $5, $6) RETURNING *`,
    [group_id, group_name, member_id, member_name, amount, description || null]
  );
  return result;
};

export const GetAllgroupExpenses = async (
  group_id: number | string,
  group_name?: string
) => {
  const result = await pool.query("SELECT * FROM expenses WHERE group_id=$1", [
    group_id,
  ]);
  return result;
};
