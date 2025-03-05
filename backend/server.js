const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const authRoutes = require("./routes/authRoutes");
const goalsRoutes = require("./routes/goals");
const notificationsRoutes = require("./routes/notifications");
const billsRoutes = require("./routes/bills");
const cron = require("node-cron");

// Add these lines after other app.use() calls
// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/transactions", require("./routes/transaction"));
app.use("/api/notifications", notificationsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/bills", billsRoutes);
//token 
const verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });
  
    try {
      const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
      req.user = verified;
      next();
    } catch (error) {
      res.status(400).json({ message: "Invalid Token" });
    }
  };
// ✅ Route to get user data
app.get("/api/auth/user", verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  cron.schedule("0 0 * * *", async () => {
    try {
      const today = new Date();
      const upcomingBills = await Bill.find({
        dueDate: { $lte: new Date(today.setDate(today.getDate() + 1)) }, // Bills due in the next 24 hours
        isPaid: false, // Only unpaid bills
      });
  
      for (const bill of upcomingBills) {
        const notification = new Notification({
          userId: bill.userId,
          message: `Reminder: Your bill "${bill.name}" of $${bill.amount} is due soon.`,
          type: "bill",
        });
        await notification.save();
      }
  
      console.log("Scheduled notifications sent for upcoming bills.");
    } catch (error) {
      console.error("Error sending scheduled notifications:", error);
    }
  });
// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
