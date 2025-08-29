import jwt from "jsonwebtoken";

export const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour in ms

const TOKEN_EXPIRY = "1h"; // 1 hour
const JWT_SECRET_KEY = process.env.JWT_SECRET as string;

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: TOKEN_EXPIRY });
};

export const verifyTKN = (token: string) => {
  return jwt.verify(token, JWT_SECRET_KEY);
};
