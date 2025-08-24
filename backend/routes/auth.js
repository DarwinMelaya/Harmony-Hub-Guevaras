const express = require("express");
const passport = require("passport");
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
      // Redirect to frontend dashboard or home page
      res.redirect("http://localhost:5173/dashboard");
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
