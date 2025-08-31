const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Google login route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:5173/login?error=google_auth_failed",
    failureFlash: true,
  }),
  (req, res) => {
    // Check if user exists and is authenticated
    if (req.user) {
      console.log("Google OAuth successful for user:", req.user.email);

      // Generate JWT token
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
