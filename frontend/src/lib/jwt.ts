/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// This function should only be used on the server side
export const verifyJwtToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;

  } catch (error) {
    return null;
  }
};

// This function should only be used on the server side
export const createToken = (payload: any) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
};
