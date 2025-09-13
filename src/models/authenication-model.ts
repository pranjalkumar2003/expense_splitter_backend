import pool from "../database/pool-connect";
import { generateAccessToken, TOKEN_EXPIRY_MS } from "../utils/jwt";

export const isUserActive = async (email: string) => {
  return await pool.query(
    "SELECT isactive FROM users where email=$1",[email]
  );
};

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

export const saveInviteToken = async (user_id: number, inviteToken: string) => {
  return await pool.query(
    "UPDATE users SET invite_token = $1, invite_expiry = NOW() + interval '2 days' WHERE id = $2 RETURNING invite_token, email",
    [inviteToken, user_id]
  );
};

export const verifyInviteToken = async (token: string) => {
  return await pool.query(
    "SELECT id, name, email, invite_expiry FROM users WHERE invite_token = $1",
    [token]
  );
};

export const isValidInviteToken = async (token: string) => {
  return await pool.query(
    "SELECT id FROM users WHERE invite_token = $1 AND invite_expiry > NOW()",
    [token]
  );
};

export const setUserPassword = async (hashPassword: string, userId: number) => {
  return await pool.query(
    "UPDATE users SET password = $1, invite_token = NULL, invite_expiry = NULL, isActive = 1, isSignup = 1 WHERE id = $2 RETURNING id ,email",
    [hashPassword, userId]
  );
};

export const AddNewUser = async (
  name: string,
  email: string,
  hashPassword: string,
  isSignup: number,
  isActive: number
) => {
  const result = await pool.query(
    "INSERT INTO users (name,email, password, isSignup,isActive) VALUES($1, $2, $3, $4, $5) RETURNING id, email, name",
    [name, email, hashPassword, isSignup, isActive]
  );
  return result.rows[0];
};

export const logout = async (id: string | number) => {
  await pool.query("UPDATE users SET token_expires_at = NOW() WHERE id = $1", [
    id,
  ]);
};

export const getallUsers = async () => {
  const result = await pool.query(
    "SELECT id, email, name, isactive, isSignup FROM users"
  );
  return result;
};

export const getUserByEmail = async (email: string) => {
  const result = await pool.query(
    "SELECT id, email, name, isactive, isSignup  FROM users where email = $1",
    [email]
  );
  return result;
};

export const getUserById = async (id: number) => {
  const result = await pool.query(
    "SELECT id, email, name isactive, isSignup FROM users where id = $1",
    [id]
  );
  return result;
};
