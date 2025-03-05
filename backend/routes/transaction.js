const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all transactions for a user
router.get("/", authMiddleware, async (req, res) => {
    try {
      const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
      res.json(transactions);
    } catch (err) {
      res.status(500).json({ error: "Server Error" });
    }
  });
// Add a new transaction

// ➜ POST /api/transactions (Add Transaction)
router.post("/", authMiddleware, async (req, res) => {
    try {
      const { category, amount, type, date } = req.body;
      const newTransaction = new Transaction({
        userId: req.user.id,
        category,
        amount,
        type, // "Income" or "Expense"
        date: date || new Date(),
      });
  
      await newTransaction.save();
      res.status(201).json(newTransaction);
    } catch (err) {
      res.status(500).json({ error: "Server Error" });
    }
  });
// router.post("/", authMiddleware, async (req, res) => {
//     try {
//       const transactions = req.body.map(tx => ({
//         user: req.user.id, // Ensure the user ID is assigned
//         category: tx.category,
//         amount: tx.amount,
//         type: tx.type,
//         date: tx.date || new Date(),
//       }));
  
//       await Transaction.insertMany(transactions);
//       res.status(201).json({ message: "Transactions imported successfully!" });
//     } catch (err) {
//       console.error("Bulk import error:", err);
//       res.status(500).json({ error: "Failed to import transactions" });
//     }
//   });
router.post("/bulk", authMiddleware, async (req, res) => {
    try {
        const transactions = req.body;

        console.log("📌 Incoming Transactions:", transactions); // Debug incoming data

        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({ error: "Invalid CSV data" });
        }

        // Validate transactions
        const validTransactions = transactions.map(tx => {
            if (!tx.category || !tx.amount || !tx.type || !tx.date) {
                console.log("🚨 Missing fields in transaction:", tx);
                return res.status(400).json({ error: "Missing required fields" });
            }

            if (isNaN(tx.amount) || tx.amount <= 0) {
                console.log("🚨 Invalid amount:", tx.amount);
                return res.status(400).json({ error: "Invalid amount value" });
            }

            if (!["Income", "Expense"].includes(tx.type)) {
                console.log("🚨 Invalid type:", tx.type);
                return res.status(400).json({ error: "Invalid type. Must be 'Income' or 'Expense'" });
            }

            if (isNaN(new Date(tx.date).getTime())) {
                console.log("🚨 Invalid date:", tx.date);
                return res.status(400).json({ error: "Invalid date format" });
            }

            return {
                userId: req.user.id,  // ✅ Ensure user ID is included
                category: tx.category,
                amount: tx.amount,
                type: tx.type,
                date: tx.date
            };
        });

        // Save transactions to MongoDB
        await Transaction.insertMany(validTransactions);
        res.status(201).json({ message: "Transactions imported successfully!" });
    } catch (error) {
        console.error("🚨 Backend Error:", error); // Log full error
        res.status(500).json({ error: "Failed to import transactions", details: error.message });
    }
});

  
module.exports = router;
