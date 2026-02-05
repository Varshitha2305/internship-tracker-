const express = require("express");
const router = express.Router();
const Application = require("../models/application");
const { google } = require("googleapis");
const User = require("../models/User");

// Helper: Sync with Google Calendar
async function syncCalendarEvent(user, application) {
  // We only sync if there is a valid interview date
  if (!application.interviewDateTime) return null;
  // User must have connected calendar
  if (!user.calendarAccessToken || !user.calendarRefreshToken) return null;

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "http://localhost:5000/calendar/callback"
    );

    oauth2Client.setCredentials({
      access_token: user.calendarAccessToken,
      refresh_token: user.calendarRefreshToken
    });

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
      let tokensUpdated = false;
      if (tokens.access_token) {
        user.calendarAccessToken = tokens.access_token;
        tokensUpdated = true;
      }
      if (tokens.refresh_token) {
        user.calendarRefreshToken = tokens.refresh_token;
        tokensUpdated = true;
      }
      if (tokensUpdated) {
        await user.save();
        console.log("Updated user tokens during sync");
      }
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const eventStartTime = new Date(application.interviewDateTime);
    const eventEndTime = new Date(eventStartTime);
    eventEndTime.setHours(eventEndTime.getHours() + 1); // Default 1 hour duration

    // Basic event structure
    const eventBase = {
      summary: `Interview: ${application.company} - ${application.role}`,
      description: `Role: ${application.role}\nLink: ${application.meetingLink || 'No link provided'}\n\nManaged by Internship Tracker`,
      start: {
        dateTime: eventStartTime.toISOString(),
        timeZone: "Asia/Kolkata"
      },
      end: {
        dateTime: eventEndTime.toISOString(),
        timeZone: "Asia/Kolkata"
      },
    };

    let result = {};

    if (application.googleCalendarEventId) {
      // 1. Try to get the existing event first
      try {
        const existingEvent = await calendar.events.get({
          calendarId: 'primary',
          eventId: application.googleCalendarEventId
        });

        // 2. Prepare update, preserving conferenceData
        const eventUpdate = {
          ...eventBase,
          conferenceData: existingEvent.data.conferenceData
        };

        const response = await calendar.events.update({
          calendarId: 'primary',
          eventId: application.googleCalendarEventId,
          resource: eventUpdate,
          //   conferenceDataVersion: 1 // Keep this to ensure we can still manipulate conference data if needed
        });

        console.log("✅ Google Calendar event updated:", response.data.id);
        result = {
          eventId: response.data.id,
          hangoutLink: response.data.hangoutLink
        };
      } catch (err) {
        console.error("⚠️ Failed to update calendar event:", err.message);

        // If event is missing/deleted (404/410), clear ID so we create a new one below
        if (err.code === 404 || err.code === 410) {
          console.log("Event not found, will create new one.");
          application.googleCalendarEventId = null;
        }
      }
    }

    // Create new event if no ID exists (or if update failed/ID was cleared)
    if (!application.googleCalendarEventId) {
      try {
        // Add conference data request for new events
        const eventCreate = {
          ...eventBase,
          conferenceData: {
            createRequest: {
              requestId: Math.random().toString(36).substring(7),
              conferenceSolutionKey: { type: 'hangoutsMeet' }
            }
          }
        };

        const response = await calendar.events.insert({
          calendarId: 'primary',
          resource: eventCreate,
          conferenceDataVersion: 1
        });
        console.log("✅ Google Calendar event created:", response.data.id);
        result = {
          eventId: response.data.id,
          hangoutLink: response.data.hangoutLink
        };
      } catch (createErr) {
        console.error("⚠️ Failed to create calendar event:", createErr.message);
        return null; // Return null to indicate failure, don't break the app flow
      }
    }

    return result;

  } catch (error) {
    console.error("Calendar Sync Error (Global):", error.message);
    return null;
  }
}

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
    const {
      professionalSummary,
      primarySkills,
      experienceLevel,
      currentRole,
      interviewDateTime,
      meetingLink,
      ...rest
    } = req.body;

    const newApplication = new Application({
      ...rest,
      professionalSummary: professionalSummary || null,
      primarySkills: primarySkills || null,
      experienceLevel: experienceLevel || null,
      currentRole: currentRole || null,
      interviewDateTime: interviewDateTime || null,
      meetingLink: meetingLink || null
    });

    // Save first
    await newApplication.save();

    // Check calendar sync
    if (newApplication.status === "Interview" && req.user) {
      const syncResult = await syncCalendarEvent(req.user, newApplication);
      if (syncResult && syncResult.eventId) {
        newApplication.googleCalendarEventId = syncResult.eventId;
        newApplication.hangoutLink = syncResult.hangoutLink;
        // Provide Google Meet link if none provided by user
        if (!newApplication.meetingLink && syncResult.hangoutLink) {
          newApplication.meetingLink = syncResult.hangoutLink;
        }
        await newApplication.save();
      }
    }

    res.status(201).json(newApplication);
  } catch (error) {
    console.error("SAVE ERROR:", error.message);
    res.status(400).json({ error: error.message });
  }
});

// UPDATE application status
router.put("/:id", async (req, res) => {
  try {
    // 1. Update the application fields
    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedApplication) {
      return res.status(404).json({ error: "Application not found" });
    }

    // 2. Check calendar sync
    if (updatedApplication.status === "Interview" && req.user) {
      const syncResult = await syncCalendarEvent(req.user, updatedApplication);
      if (syncResult && syncResult.eventId) {
        updatedApplication.googleCalendarEventId = syncResult.eventId;
        updatedApplication.hangoutLink = syncResult.hangoutLink;

        if (!updatedApplication.meetingLink && syncResult.hangoutLink) {
          updatedApplication.meetingLink = syncResult.hangoutLink;
        }
        await updatedApplication.save();
      }
    }

    res.json(updatedApplication);
  } catch (error) {
    console.error("UPDATE ERROR:", error.message);
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
