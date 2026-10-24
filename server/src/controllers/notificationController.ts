import { Response } from "express";
import { Notification } from "../models/Notification";
import { AuthRequest } from "../types";

export const getNotifications = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });

    res.json({
      success: true,
      unreadCount,
      data: notifications,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications.",
      error: error.message,
    });
  }
};

export const markNotificationRead = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { id } = req.params;

    if (id === "all") {
      await Notification.updateMany(
        { userId: req.user._id, read: false },
        { $set: { read: true } }
      );
      res.json({ success: true, message: "All notifications marked as read." });
      return;
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: "Notification not found." });
      return;
    }

    res.json({ success: true, data: notification });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification.",
      error: error.message,
    });
  }
};
