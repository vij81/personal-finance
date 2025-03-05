const express = require("express");
const router = express.Router();
const Bill = require("../models/Bill");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");

// Add a new bill
router.post("/", verifyToken, async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debugging line
    const { name, amount, dueDate } = req.body;

    // Validate input
    if (!name || !amount || !dueDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newBill = new Bill({
      userId: req.user.id,
      name,
      amount,
      dueDate,
    });
    await newBill.save();
    res.status(201).json(newBill);
  } catch (error) {
    console.error("Error creating bill:", error); // Debugging line
    res.status(500).json({ error: "Error creating bill" });
  }
});

// Get all bills for the logged-in user
router.get("/", verifyToken, async (req, res) => {
  try {
    console.log("Fetching bills for user:", req.user.id); // Debugging line
    const bills = await Bill.find({ userId: req.user.id }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error); // Debugging line
    res.status(500).json({ error: "Error fetching bills" });
  }
});
// Mark a bill as paid
router.put("/:id/pay", verifyToken, async (req, res) => {
    try {
      const bill = await Bill.findById(req.params.id);
      if (!bill) return res.status(404).json({ error: "Bill not found" });
  
      // Ensure the user owns the bill
      if (bill.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
  
      // Mark the bill as paid
      bill.isPaid = true;
      await bill.save();
  
      // Send a notification
      const notification = new Notification({
        userId: req.user.id,
        message: `Your bill "${bill.name}" of $${bill.amount} has been paid.`,
        type: "bill",
      });
      await notification.save();
  
      res.json(bill);
    } catch (error) {
      console.error("Error paying bill:", error); // Debugging line
      res.status(500).json({ error: "Error paying bill" });
    }
  });
  
  module.exports = router;