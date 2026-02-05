const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String },
  status: {
    type: String,
    enum: ["Applied", "Interview", "Rejected"],
    default: "Applied",
  },
  professionalSummary: { type: String, maxlength: 300 },
  primarySkills: { type: String },
  experienceLevel: {
    type: String,
    enum: ["Fresher", "0-2", "2-5", "5+"],
  },
  currentRole: { type: String },
  interviewDateTime: { type: Date },
  meetingLink: { type: String },
  googleCalendarEventId: { type: String },
  hangoutLink: { type: String },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Application", applicationSchema);
