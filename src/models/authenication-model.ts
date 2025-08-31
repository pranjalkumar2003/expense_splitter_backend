import pool from "../database/pool-connect";
import { generateAccessToken, TOKEN_EXPIRY_MS } from "../utils/jwt";

export const generateTokenForUser = async (result: any) => {
  // Generate token
  const payload = { id: result.rows[0].id, email: result.rows[0].email };
  const token = await generateAccessToken(payload);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_EXPIRY_MS);
  await pool.query(
    "UPDATE users SET token = $1, token_generated_at = $2, token_expires_at = $3 WHERE id = $4",
    [token, now, expiresAt, result.rows[0].id]
  );
  return token;
};

export const isExistingUser = async (email: string) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result;
};

export const AddNewUser = async (
  name: string,
  email: string,
  hashPassword: string
) => {
  const result = await pool.query(
    "INSERT INTO users (name,email, password) VALUES($1, $2, $3) RETURNING id, email",
    [name, email, hashPassword]
  );
  return result.rows[0];
};

export const logout = async (id: string | number) => {
  await pool.query("UPDATE users SET token_expires_at = NOW() WHERE id = $1", [
    id,
  ]);
};

export const getallUsers = async () => {
  const result = await pool.query("SELECT * FROM users");
  return result;
};

export const getUserByEmail = async (email: string) => {
  const result = await pool.query("SELECT * FROM users where email = $1", [
    email,
  ]);
  return result;
};

export const getUserById = async (id: number) => {
  const result = await pool.query("SELECT * FROM users where id = $1", [id]);
  return result;
};
