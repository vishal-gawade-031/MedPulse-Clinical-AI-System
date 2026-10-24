import { Router } from "express";
import {
  createAssessment,
  getPatientAssessments,
  getAssessmentById,
} from "../controllers/assessmentController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.post("/", requireAuth, createAssessment);
router.get("/", requireAuth, getPatientAssessments);
router.get("/:id", requireAuth, getAssessmentById);

export default router;
