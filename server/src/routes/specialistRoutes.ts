import { Router } from "express";
import { getAllSpecialists } from "../controllers/specialistController";

const router = Router();

router.get("/", getAllSpecialists);

export default router;
