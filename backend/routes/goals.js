const express = require("express");
const router = express.Router();
const Goal = require("../models/Goal");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");

// Create a new goal
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, targetAmount, deadline } = req.body;
    const newGoal = new Goal({
      userId: req.user.id,
      title,
      targetAmount,
      deadline,
    });
    await newGoal.save();
    res.status(201).json(newGoal);
  } catch (error) {
    res.status(500).json({ error: "Error creating goal" });
  }
});

// Get all goals for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ error: "Error fetching goals" });
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
        console.log("Notification created for completed goal:", goal.title); // Debugging line
      }
  
      res.json(goal);
    } catch (error) {
      console.error("Error updating goal amount:", error); // Debugging line
      res.status(500).json({ error: "Error updating goal amount" });
    }
  });
  

// Delete a goal
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if (!goal) return res.status(404).json({ error: "Goal not found" });

    // Ensure the user owns the goal
    if (goal.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await goal.remove();
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting goal" });
  }
});

module.exports = router;