import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { loginUserDB, registerUserDB } from "../database/authDB";
import { generateToken } from "../libs/generateToken";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await loginUserDB(email);

    const isMatch = await bcrypt.compare(password, result.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(result.id);
    res.cookie("token", token);

    res.status(200).json({
      success: true,
      message: "Logged in succesfully",
      result,
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const result = await registerUserDB(username, email, hashedPassword);

    const token = generateToken(result.id);
    res.cookie("token", token);

    res.status(200).json({
      success: true,
      message: "Registered succesfully",
      result,
      token,
    });
  } catch (error: any) {
    if (error.code === "23505") {
      res.status(403).json({ success: false, message: "Email already exist" });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
