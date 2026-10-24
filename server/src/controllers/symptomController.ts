import { Request, Response } from "express";
import { Symptom } from "../models/Symptom";

export const getAllSymptoms = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category, search } = req.query;
    const filter: Record<string, any> = {};

    if (category && typeof category === "string" && category !== "All") {
      filter.category = category;
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [
        { displayName: searchRegex },
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    const symptoms = await Symptom.find(filter).sort({ category: 1, displayName: 1 });

    res.json({
      success: true,
      count: symptoms.length,
      data: symptoms,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve symptoms catalog.",
      error: error.message,
    });
  }
};
