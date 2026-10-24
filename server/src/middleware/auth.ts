import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { User, IUser } from "../models/User";
import { AuthRequest } from "../types";

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Missing or malformed token.",
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as {
      userId: string;
      role: "PATIENT" | "ADMIN";
    };

    const user = await User.findById(decoded.userId).select("-passwordHash");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "User session is invalid or user no longer exists.",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session token.",
      error: error.message,
    });
  }
};

export const requireRole = (role: "PATIENT" | "ADMIN") => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: `Forbidden. Access restricted to role: ${role}`,
      });
      return;
    }

    next();
  };
};
