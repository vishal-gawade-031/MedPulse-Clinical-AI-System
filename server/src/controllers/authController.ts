import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { PatientProfile } from "../models/PatientProfile";
import { ENV } from "../config/env";
import { logAuditEvent } from "../services/auditService";
import { AuthRequest } from "../types";

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        success: false,
        message: "First name, last name, email, and password are required.",
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const assignedRole = role === "ADMIN" ? "ADMIN" : "PATIENT";

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      phone: phone ? phone.trim() : "",
      role: assignedRole,
      lastLogin: new Date(),
    });

    // Create an initial PatientProfile for patients
    if (assignedRole === "PATIENT") {
      await PatientProfile.create({
        userId: user._id,
        height: 170,
        weight: 70,
        allergies: [],
        chronicConditions: [],
        currentMedications: [],
        emergencyContact: { name: "", relationship: "", phone: "" },
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await logAuditEvent("LOGIN", "User", user._id, user._id.toString(), {
      event: "User registration",
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to register user.",
      error: error.message,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      ENV.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await logAuditEvent("LOGIN", "User", user._id, user._id.toString(), {
      event: "User login",
      role: user.role,
    });

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "An error occurred during authentication.",
      error: error.message,
    });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    let profile = null;
    if (req.user.role === "PATIENT") {
      profile = await PatientProfile.findOne({ userId: req.user._id });
    }

    res.json({
      success: true,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        phone: req.user.phone,
        lastLogin: req.user.lastLogin,
      },
      profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
      error: error.message,
    });
  }
};
