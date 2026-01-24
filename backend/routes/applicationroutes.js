const express = require("express");
const router = express.Router();
const Application = require("../models/application");

// GET all applications
router.get("/", async (req, res) => {
  try {
    const applications = await Application.find();
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// POST new application
router.post("/", async (req, res) => {
  try {
    console.log("Request body:", req.body); // DEBUG
    const newApplication = new Application(req.body);
    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    console.error("SAVE ERROR:", error.message); // DEBUG
    res.status(400).json({ error: error.message });
  }
});
// UPDATE application status
router.put("/:id", async (req, res) => {
  try {
    const updated = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Failed to update application" });
  }
});
// DELETE application
router.delete("/:id", async (req, res) => {
  try {
    await Application.findByIdAndDelete(req.params.id);
    res.json({ message: "Application deleted" });
  } catch {
    res.status(400).json({ error: "Failed to delete application" });
  }
});



module.exports = router;
