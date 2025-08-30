import pool from "../database/pool-connect";

export const createGroup = async (
  name: string,
  created_by: string,
  group_size: number,
  purpose: string
) => {
  const result = await pool.query(
    "INSERT INTO groups (name, created_by, group_size, purpose) VALUES ($1, $2, $3 ,$4) RETURNING *",
    [name, created_by, group_size, purpose]
  );
  return result.rows[0];
};

export const getAllGroups = async () => {
  const result = await pool.query(
    "SELECT * FROM groups ORDER BY created_by DESC"
  );
  return result.rows;
};

export const getGroupById = async (id: number | string) => {
  const result = await pool.query("SELECT * FROM groups WHERE id=$1", [id]);
  return result.rows[0];
};
