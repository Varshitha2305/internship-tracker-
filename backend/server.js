require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User");
const MongoStore = require("connect-mongo");

const app = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json());

// Session Config
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Passport Config
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/auth/google/callback"
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (user) {
        return done(null, user);
      }

      user = await new User({
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos[0].value
      }).save();

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

// Routes
const applicationRoutes = require("./routes/applicationroutes");
const calendarRoutes = require("./routes/calendarRoutes");

app.use("/applications", applicationRoutes);
app.use("/calendar", calendarRoutes);

// Auth Routes
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:3000?error=login_failed" }),
  (req, res) => {
    // Successful authentication, redirect dashboard.
    res.redirect("http://localhost:3000/dashboard");
  }
);

app.get("/auth/user", (req, res) => {
  console.log("Hits /auth/user. User:", req.user);
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  res.send(req.user);
});

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
