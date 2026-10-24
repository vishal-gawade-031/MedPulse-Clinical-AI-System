import { Router } from "express";
import {
  getPatientProfile,
  updatePatientProfile,
} from "../controllers/patientController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/profile", requireAuth, getPatientProfile);
router.put("/profile", requireAuth, updatePatientProfile);

export default router;
