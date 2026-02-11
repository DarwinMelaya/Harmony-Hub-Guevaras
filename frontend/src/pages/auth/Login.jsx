import { FcGoogle } from "react-icons/fc";
import { useState, useEffect } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  // Check for OAuth errors in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const oauthError = urlParams.get("error");

    if (oauthError) {
      switch (oauthError) {
        case "google_auth_failed":
          setError("Google authentication failed. Please try again.");
          break;
        case "no_user_found":
          setError("No user found. Please try signing up first.");
          break;
        case "oauth_failed":
          setError("OAuth authentication failed. Please try again.");
          break;
        default:
          setError("Authentication failed. Please try again.");
      }
    }
  }, [location]);

  const handleGoogleLogin = () => {
    // Redirect to Google OAuth
    window.location.href = "http://localhost:5000/auth/google";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/login`, {
        email,
        password,
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        // Redirect based on user role
        const userRole = response.data.data.role;
        switch (userRole) {
          case "admin":
            navigate("/admin-dashboard");
            break;
          case "client":
            navigate("/user-home");
            break;
          case "staff":
            navigate("/staff-dashboard");
            break;
          case "artist":
            navigate("/artist-dashboard");
            break;
          case "owner":
            navigate("/owner-dashboard");
            break;
          default:
            navigate("/home");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 relative overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{
          backgroundImage: "url('/images/bg.jpg')",
        }}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-blue-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-900 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          {/* System Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Harmony <span className="text-red-500">Hub</span>
            </h1>
            <p className="text-gray-300 text-lg">Welcome Back</p>
            <p className="text-gray-400 text-sm mt-1">
              Sign in to your account to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer"
                placeholder="Enter your email"
                required
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  emailFocused || email
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Email Address
              </label>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                className="w-full px-4 py-4 pr-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer"
                placeholder="Enter your password"
                required
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  passwordFocused || password
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:text-gray-200"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-900/60 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Sign Up Link */}
          <div className="text-center mt-6">
            <p className="text-gray-300">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail("");
                  setForgotPasswordSuccess(false);
                  setError("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            {forgotPasswordSuccess ? (
              <div className="space-y-4">
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 text-green-400 text-center">
                  <p className="font-semibold mb-2">Email Sent!</p>
                  <p className="text-sm">
                    If an account with that email exists, a password reset code
                    has been sent to your email. Please check your inbox.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setShowResetPassword(true);
                    setForgotPasswordSuccess(false);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Enter Reset Code
                </button>
                <button
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                    setForgotPasswordSuccess(false);
                    setError("");
                  }}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotPasswordLoading(true);
                  setError("");

                  try {
                    const response = await axios.post(
                      `${API_BASE_URL}/users/forgot-password`,
                      {
                        email: forgotPasswordEmail,
                      }
                    );

                    if (response.data.success) {
                      setForgotPasswordSuccess(true);
                    }
                  } catch (error) {
                    console.error("Forgot password error:", error);
                    if (error.response?.data?.message) {
                      setError(error.response.data.message);
                    } else {
                      setError("Failed to send reset code. Please try again.");
                    }
                  } finally {
                    setForgotPasswordLoading(false);
                  }
                }}
                className="space-y-6"
              >
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-sm">
                    {error}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="email"
                    id="forgotEmail"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <p className="text-gray-400 text-sm">
                  Enter your email address and we'll send you a code to reset
                  your password.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordEmail("");
                      setError("");
                    }}
                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                  >
                    {forgotPasswordLoading ? "Sending..." : "Send Reset Code"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Reset Password</h2>
              <button
                onClick={() => {
                  setShowResetPassword(false);
                  setForgotPasswordEmail("");
                  setResetCode("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setResetPasswordLoading(true);
                setError("");

                if (newPassword !== confirmPassword) {
                  setError("Passwords do not match");
                  setResetPasswordLoading(false);
                  return;
                }

                if (newPassword.length < 6) {
                  setError("Password must be at least 6 characters long");
                  setResetPasswordLoading(false);
                  return;
                }

                try {
                  const response = await axios.post(
                    `${API_BASE_URL}/users/reset-password`,
                    {
                      email: forgotPasswordEmail,
                      resetCode: resetCode,
                      newPassword: newPassword,
                    }
                  );

                  if (response.data.success) {
                    // Success - close modal and show success message
                    setShowResetPassword(false);
                    setForgotPasswordEmail("");
                    setResetCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                    setShowForgotPassword(false);
                    // Show success message in main login form
                    setError("");
                    alert("Password reset successfully! You can now login with your new password.");
                  }
                } catch (error) {
                  console.error("Reset password error:", error);
                  if (error.response?.data?.message) {
                    setError(error.response.data.message);
                  } else {
                    setError("Failed to reset password. Please try again.");
                  }
                } finally {
                  setResetPasswordLoading(false);
                }
              }}
              className="space-y-6"
            >
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter reset code"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 pr-12 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>

              <p className="text-gray-400 text-sm">
                Enter the reset code sent to your email and create a new
                password.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false);
                    setForgotPasswordEmail("");
                    setResetCode("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setError("");
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPasswordLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-semibold transition-colors"
                >
                  {resetPasswordLoading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
