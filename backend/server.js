require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const applicationRoutes = require("./routes/applicationroutes");
app.use("/applications", applicationRoutes);

// Get PORT from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Atlas first
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas connected");

    // Start server after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });
