import { Router } from "express";
import {
  getDashboardStats,
  getAllAssessments,
  updateAssessmentStatus,
  addDoctorNotes,
  getPatients,
  getAuditLogs,
} from "../controllers/adminController";
import { getAssessmentById } from "../controllers/assessmentController";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// Protect all admin routes with requireAuth and requireRole("ADMIN")
router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard", getDashboardStats);
router.get("/assessments", getAllAssessments);
router.get("/assessments/:id", getAssessmentById);
router.patch("/assessments/:id/status", updateAssessmentStatus);
router.post("/assessments/:id/notes", addDoctorNotes);
router.get("/patients", getPatients);
router.get("/audit-logs", getAuditLogs);

export default router;
