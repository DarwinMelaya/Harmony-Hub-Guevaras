const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

const GOOGLE_CALLBACK_URL = "/auth/google/callback";

// Helper function to generate unique username
async function generateUniqueUsername(baseUsername) {
  let username = baseUsername;
  let counter = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
}

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Check if user exists by Google ID first
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user); // existing Google OAuth user
          }

          // Check if user exists with same email but no Google ID
          user = await User.findOne({
            email: profile.emails[0].value,
            googleId: { $exists: false },
          });

          if (user) {
            // Update existing user with Google ID
            user.googleId = profile.id;
            user.profilePhoto = profile.photos[0].value;
            user.displayName = profile.displayName;
            await user.save();
            return done(null, user);
          }

          // Generate unique username
          const baseUsername = profile.emails[0].value.split("@")[0];
          const uniqueUsername = await generateUniqueUsername(baseUsername);

          // Create new user with Google OAuth data
          const newUser = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            profilePhoto: profile.photos[0].value,
            fullName: profile.displayName,
            username: uniqueUsername,
            role: "client", // Automatically assign client role
            // Note: password field is not included since it's not required for Google OAuth users
          });

          // Send confirmation email
          const sendEmail = require("../utils/sendEmail");

          await sendEmail(
            newUser.email,
            "Welcome to Harmony Hub 🎉",
            `Hi ${newUser.fullName}, you just signed up on Harmony Hub using Google.`,
            `
              <h2>Welcome to Harmony Hub!</h2>
              <p>Hi <strong>${newUser.fullName}</strong>,</p>
              <p>You just signed up on <strong>Harmony Hub</strong> using your Google account (${newUser.email}).</p>
              <p>If this wasn’t you, please ignore this message.</p>
              <br/>
              <p>With love,<br/>The Harmony Hub Team</p>
            `
          );

          return done(null, newUser);
          
        } catch (err) {
          console.error("Google OAuth error:", err);
          done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => done(null, user));
  });
};
