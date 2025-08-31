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
  return result;
};

export const getGroupByName = async (name: string) => {
  const result = await pool.query("SELECT * FROM groups WHERE name=$1", [name]);
  return result;
};

export const getGroupMemberById = async (group_id: number) => {
  const result = await pool.query(
    "SELECT * FROM group_members WHERE group_id=$1",
    [group_id]
  );
  return result;
};

export const getGroupMemberByName = async (group_name: string) => {
  const result = await pool.query(
    "SELECT * FROM group_members WHERE group_name=$1",
    [group_name]
  );
  return result;
};

export const getAllGroupMember = async () => {
  const result = await pool.query("SELECT * FROM group_members");
  return result;
};

export const addGroupMembers = async (
  group_id: number,
  user_id: number,
  group_name: string,
  user_name: string,
  user_email: string
) => {
  const result = await pool.query(
    "INSERT INTO group_members (group_id,user_id,group_name,user_name,user_email) VALUES ($1,$2,$3,$4,$5) RETURNING id,user_email ",
    [group_id, user_id, group_name, user_name, user_email]
  );
  return result;
};
