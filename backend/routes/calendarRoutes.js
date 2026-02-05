const express = require("express");
const router = express.Router();
const { google } = require("googleapis");
const User = require("../models/User");

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:5000/calendar/callback" // Redirect URI
);

// Helper to check if user is authenticated
const requireAuth = (req, res, next) => {
    if (req.user) return next();
    res.status(401).json({ error: "Not authenticated" });
};

// 1. Redirect to Google for Calendar consent
router.get("/auth", requireAuth, (req, res) => {
    const scopes = ["https://www.googleapis.com/auth/calendar"];

    const url = oauth2Client.generateAuthUrl({
        access_type: "offline", // Essential for refresh_token
        scope: scopes,
        prompt: "consent", // Force consent to ensure refresh_token is returned
        state: req.user.id // Pass user ID in state to verify later if needed (simple ver)
    });

    res.redirect(url);
});

// 2. Callback
router.get("/callback", async (req, res) => {
    const { code } = req.query;

    if (!code) {
        return res.status(400).send("No code provided");
    }

    try {
        const { tokens } = await oauth2Client.getToken(code);

        // In a real session-based app, passport session should persist. 
        // However, sometimes cross-site cookies can be tricky.
        // Assuming the browser sends the session cookie to this callback.

        if (!req.user) {
            // Fallback: if session is lost, we might rely on state, but technically
            // passport should handle the session cookie if strictly on same domain/localhost.
            // For now, let's assume req.user is present.
            return res.status(401).redirect("http://localhost:3000/dashboard?error=unauthorized_calendar");
        }

        // Save tokens to user
        req.user.calendarAccessToken = tokens.access_token;
        if (tokens.refresh_token) {
            req.user.calendarRefreshToken = tokens.refresh_token;
        }
        await req.user.save();

        res.redirect("http://localhost:3000/dashboard?calendar_connected=true");
    } catch (error) {
        console.error("Calendar Auth Error:", error);
        res.redirect("http://localhost:3000/dashboard?error=calendar_failed");
    }
});

// 3. Create Calendar Event
router.post("/create-event", requireAuth, async (req, res) => {
    const { title, description, meetLink, startDateTime, endDateTime } = req.body;

    if (!req.user.calendarAccessToken || !req.user.calendarRefreshToken) {
        return res.status(400).json({ error: "User is not connected to Google Calendar" });
    }

    try {
        // Create a new OAuth2 client for this request to avoid global state conflicts
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "http://localhost:5000/calendar/callback"
        );

        oauth2Client.setCredentials({
            access_token: req.user.calendarAccessToken,
            refresh_token: req.user.calendarRefreshToken
        });

        // Handle token refresh
        oauth2Client.on('tokens', async (tokens) => {
            console.log("Tokens refreshed");
            let tokensUpdated = false;

            if (tokens.access_token) {
                req.user.calendarAccessToken = tokens.access_token;
                tokensUpdated = true;
            }
            if (tokens.refresh_token) {
                req.user.calendarRefreshToken = tokens.refresh_token;
                tokensUpdated = true;
            }

            if (tokensUpdated) {
                await req.user.save();
                console.log("Updated user tokens in DB");
            }
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: title,
            description: `${description}\n\nMeeting Link: ${meetLink}`,
            start: {
                dateTime: new Date(startDateTime).toISOString(),
                timeZone: 'UTC', // Or accept timezone from frontend
            },
            end: {
                dateTime: new Date(endDateTime).toISOString(),
                timeZone: 'UTC',
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 30 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        res.status(201).json({
            message: "Event created successfully",
            link: response.data.htmlLink,
            eventId: response.data.id
        });

    } catch (error) {
        console.error("Error creating calendar event:", error);

        // Handle token expiry explicitly if needed, though googleapis usually handles it with refresh_token
        if (error.code === 401) {
            return res.status(401).json({ error: "Token expired or invalid. Please reconnect Google Calendar." });
        }

        res.status(500).json({
            error: "Failed to create event",
            details: error.message
        });
    }
});

module.exports = router;
