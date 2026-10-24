import { Router } from "express";
import authRoutes from "./authRoutes";
import patientRoutes from "./patientRoutes";
import symptomRoutes from "./symptomRoutes";
import assessmentRoutes from "./assessmentRoutes";
import adminRoutes from "./adminRoutes";
import specialistRoutes from "./specialistRoutes";
import notificationRoutes from "./notificationRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/patients", patientRoutes);
router.use("/symptoms", symptomRoutes);
router.use("/assessments", assessmentRoutes);
router.use("/admin", adminRoutes);
router.use("/specialists", specialistRoutes);
router.use("/notifications", notificationRoutes);

export default router;
