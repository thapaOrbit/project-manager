import express from "express";
import NotificationService from "../services/notification-service.js";
import authMiddleware from "../middleware/auth-middleware.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { limit = 50, skip = 0, unreadOnly = false } = req.query;

    const notifications = await NotificationService.getUserNotifications(
      req.user._id,
      {
        limit: parseInt(limit),
        skip: parseInt(skip),
        unreadOnly: unreadOnly === "true",
      }
    );

    res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/unread-count", authMiddleware, async (req, res) => {
  try {
    const count = await NotificationService.getUnreadCount(req.user._id);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:notificationId/read", authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await NotificationService.markAsRead(
      notificationId,
      req.user._id
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/read-all", authMiddleware, async (req, res) => {
  try {
    const result = await NotificationService.markAllAsRead(req.user._id);
    res.status(200).json({
      message: "All notifications marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/:notificationId", authMiddleware, async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await NotificationService.deleteNotification(
      notificationId,
      req.user._id
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
});

export default router;
