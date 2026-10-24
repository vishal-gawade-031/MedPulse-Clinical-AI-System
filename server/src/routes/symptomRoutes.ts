import { Router } from "express";
import { getAllSymptoms } from "../controllers/symptomController";

const router = Router();

router.get("/", getAllSymptoms);

export default router;
