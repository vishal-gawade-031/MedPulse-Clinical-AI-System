import { Request, Response } from "express";
import { Specialist } from "../models/Specialist";

export const getAllSpecialists = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { specialty } = req.query;
    const filter: Record<string, any> = {};

    if (specialty && typeof specialty === "string") {
      filter.specialty = new RegExp(specialty.trim(), "i");
    }

    const specialists = await Specialist.find(filter).sort({ name: 1 });

    res.json({
      success: true,
      count: specialists.length,
      data: specialists,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve specialists directory.",
      error: error.message,
    });
  }
};
