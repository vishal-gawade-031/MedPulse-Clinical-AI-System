import { Router } from "express";
import {
  getNotifications,
  markNotificationRead,
} from "../controllers/notificationController";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.get("/", requireAuth, getNotifications);
router.patch("/:id/read", requireAuth, markNotificationRead);

export default router;
