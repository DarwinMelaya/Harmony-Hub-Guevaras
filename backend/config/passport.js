const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");

const GOOGLE_CALLBACK_URL = "/auth/google/callback";

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
          // Check if user exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            return done(null, user); // existing user
          } else {
            // create new user
            const newUser = await User.create({
              googleId: profile.id,
              displayName: profile.displayName,
              email: profile.emails[0].value,
              profilePhoto: profile.photos[0].value,
            });
            return done(null, newUser);
          }
        } catch (err) {
          console.error(err);
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
