import { Response } from "express";
import { PatientProfile } from "../models/PatientProfile";
import { User } from "../models/User";
import { AuthRequest } from "../types";
import { logAuditEvent } from "../services/auditService";

export const getPatientProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    let profile = await PatientProfile.findOne({ userId: req.user._id });

    if (!profile) {
      // Auto-provision empty profile if missing
      profile = await PatientProfile.create({
        userId: req.user._id,
        gender: "Prefer not to say",
        bloodGroup: "Unknown",
        height: 170,
        weight: 70,
      });
    }

    res.json({
      success: true,
      data: profile,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patient profile.",
      error: error.message,
    });
  }
};

export const updatePatientProfile = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      age,
      gender,
      bloodGroup,
      height,
      weight,
      allergies,
      chronicConditions,
      currentMedications,
      emergencyContact,
    } = req.body;

    // Update User model fields if provided
    if (firstName || lastName || phone !== undefined) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (firstName) user.firstName = firstName.trim();
        if (lastName) user.lastName = lastName.trim();
        if (phone !== undefined) user.phone = phone.trim();
        await user.save();
      }
    }

    let profile = await PatientProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = new PatientProfile({ userId: req.user._id });
    }

    if (dateOfBirth) profile.dateOfBirth = new Date(dateOfBirth);
    if (age !== undefined) profile.age = Number(age);
    if (gender) profile.gender = gender;
    if (bloodGroup) profile.bloodGroup = bloodGroup;
    if (height !== undefined) profile.height = Number(height);
    if (weight !== undefined) profile.weight = Number(weight);
    if (allergies) profile.allergies = allergies;
    if (chronicConditions) profile.chronicConditions = chronicConditions;
    if (currentMedications) profile.currentMedications = currentMedications;
    if (emergencyContact) {
      profile.emergencyContact = {
        name: emergencyContact.name || "",
        relationship: emergencyContact.relationship || "",
        phone: emergencyContact.phone || "",
      };
    }

    await profile.save();

    await logAuditEvent(
      "PROFILE_UPDATED",
      "PatientProfile",
      req.user._id,
      profile._id.toString(),
      { updatedFields: Object.keys(req.body) }
    );

    res.json({
      success: true,
      message: "Patient profile successfully updated.",
      data: profile,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update patient profile.",
      error: error.message,
    });
  }
};
