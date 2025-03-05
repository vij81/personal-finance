const express = require("express");
const router = express.Router();
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");

// Fetch all notifications for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Error fetching notifications" });
  }
});

// Mark a notification as read
router.put("/:id/mark-as-read", verifyToken, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ error: "Notification not found" });

    // Ensure the user owns the notification
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    notification.isRead = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Error marking notification as read" });
  }
});

// Update the saved amount for a goal
router.put("/:id/update-amount", verifyToken, async (req, res) => {
  try {
    const { amountToAdd } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) return res.status(404).json({ error: "Goal not found" });

    // Ensure the user owns the goal
    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update the currentAmount
    goal.currentAmount += amountToAdd;
    await goal.save();

    // Check if the goal is completed
    if (goal.currentAmount >= goal.targetAmount) {
      const notification = new Notification({
        userId: req.user.id,
        message: `Congratulations! You've completed your goal: ${goal.title}`,
        type: "goal",
      });
      await notification.save();
    }

    res.json(goal);
  } catch (error) {
    res.status(500).json({ error: "Error updating goal amount" });
  }
});
// Delete notifications marked as read
router.delete("/delete-read", verifyToken, async (req, res) => {
    try {
      await Notification.deleteMany({ userId: req.user.id, isRead: true });
      res.json({ message: "Read notifications deleted" });
    } catch (error) {
      res.status(500).json({ error: "Error deleting read notifications" });
    }
  });
module.exports = router;