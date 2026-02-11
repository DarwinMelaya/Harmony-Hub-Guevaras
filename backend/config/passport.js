const GoogleStrategy = require("passport-google-oauth20").Strategy;
const mongoose = require("mongoose");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const { getVerificationEmailTemplate } = require("../utils/sendEmail");

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

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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
            // Existing Google OAuth user - check if verified
            // If not verified, they'll be redirected to verification page
            return done(null, user);
          }

          // Check if user exists with same email but no Google ID
          user = await User.findOne({
            email: profile.emails[0].value,
            googleId: { $exists: false },
          });

          if (user) {
            // Update existing user with Google ID
            // If user is not verified, they still need to verify
            user.googleId = profile.id;
            user.profilePhoto = profile.photos[0].value;
            user.displayName = profile.displayName;
            
            // If user was not verified, generate new verification code
            if (!user.isVerified) {
              const verificationCode = generateVerificationCode();
              const verificationCodeExpires = new Date();
              verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 10);
              
              user.verificationCode = verificationCode;
              user.verificationCodeExpires = verificationCodeExpires;
              
              // Send verification email
              try {
                const emailHtml = getVerificationEmailTemplate(user.fullName, verificationCode);
                const emailText = `Hi ${user.fullName}, your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
                
                await sendEmail(
                  user.email,
                  "Verify Your Email - Harmony Hub",
                  emailText,
                  emailHtml
                );
              } catch (emailError) {
                console.error("Failed to send verification email:", emailError);
              }
            }
            
            await user.save();
            return done(null, user);
          }

          // Generate unique username
          const baseUsername = profile.emails[0].value.split("@")[0];
          const uniqueUsername = await generateUniqueUsername(baseUsername);

          // Generate verification code for new Google OAuth user
          const verificationCode = generateVerificationCode();
          const verificationCodeExpires = new Date();
          verificationCodeExpires.setMinutes(verificationCodeExpires.getMinutes() + 10); // 10 minutes expiry

          // Create new user with Google OAuth data (unverified)
          // Role will be set to "client" by default, and can be updated in callback if session has different role
          const newUser = await User.create({
            googleId: profile.id,
            displayName: profile.displayName,
            email: profile.emails[0].value,
            profilePhoto: profile.photos[0].value,
            fullName: profile.displayName,
            username: uniqueUsername,
            role: "client", // Default role, can be updated in callback route from session
            isVerified: false,
            isActive: false, // User is inactive until verified
            verificationCode,
            verificationCodeExpires,
            // Note: password field is not included since it's not required for Google OAuth users
          });

          // Send verification email
          try {
            const emailHtml = getVerificationEmailTemplate(newUser.fullName, verificationCode);
            const emailText = `Hi ${newUser.fullName}, your verification code is: ${verificationCode}. This code will expire in 10 minutes.`;
            
            await sendEmail(
              newUser.email,
              "Verify Your Email - Harmony Hub",
              emailText,
              emailHtml
            );
          } catch (emailError) {
            console.error("Failed to send verification email:", emailError);
            // Continue even if email fails - user can request resend
          }

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
