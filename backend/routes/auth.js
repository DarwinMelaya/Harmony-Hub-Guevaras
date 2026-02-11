const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Google login route
router.get("/google", (req, res, next) => {
  // Get role from query parameter if provided
  const role = req.query.role || "client";
  
  // Store role in session to pass to callback
  req.session.googleOAuthRole = role;
  
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: role, // Pass role through state parameter
  })(req, res, next);
});

// Callback route after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login?error=google_auth_failed",
    failureFlash: true,
  }),
  async (req, res) => {
    // Check if user exists and is authenticated
    if (req.user) {
      console.log("Google OAuth successful for user:", req.user.email);
      
      // Get role from session if it was stored
      const requestedRole = req.session.googleOAuthRole;
      if (requestedRole && req.user.role !== requestedRole) {
        // Update user role if it was specified and different
        req.user.role = requestedRole;
        await req.user.save();
      }
      // Clear the role from session
      delete req.session.googleOAuthRole;

      // Check if user is verified
      if (!req.user.isVerified) {
        // User is not verified, redirect to verification page
        const encodedEmail = encodeURIComponent(req.user.email);
        const callbackUrl = `http://localhost:5173/google-verify?email=${encodedEmail}&source=google`;
        console.log("User not verified, redirecting to verification:", callbackUrl);
        return res.redirect(callbackUrl);
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.redirect("http://localhost:5173/login?error=account_deactivated");
      }

      // User is verified and active, generate JWT token
      const token = jwt.sign(
        { userId: req.user._id },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" }
      );

      // Prepare user data for frontend
      const userData = {
        _id: req.user._id,
        fullName: req.user.fullName,
        email: req.user.email,
        phoneNumber: req.user.phoneNumber,
        location: req.user.location,
        username: req.user.username,
        role: req.user.role,
        displayName: req.user.displayName,
        profilePhoto: req.user.profilePhoto,
        isActive: req.user.isActive,
        isVerified: req.user.isVerified,
        createdAt: req.user.createdAt,
      };

      // Encode user data and token for URL
      const encodedToken = encodeURIComponent(token);
      const encodedUserData = encodeURIComponent(JSON.stringify(userData));

      // Redirect to frontend callback handler with token and user data
      const callbackUrl = `http://localhost:5173/google-callback?token=${encodedToken}&user=${encodedUserData}`;

      console.log("Redirecting to callback:", callbackUrl);
      res.redirect(callbackUrl);
    } else {
      console.log("Google OAuth failed - no user found");
      res.redirect("http://localhost:5173/login?error=no_user_found");
    }
  }
);

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("http://localhost:5173/login?error=logout_failed");
    }
    res.redirect("http://localhost:5173/");
  });
});

module.exports = router;
