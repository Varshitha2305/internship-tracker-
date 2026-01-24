const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String },
  status: {
    type: String,
    enum: ["Applied", "Interview", "Rejected"],
    default: "Applied",
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
