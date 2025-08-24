import { FcGoogle } from "react-icons/fc";
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [focusedFields, setFocusedFields] = useState({
    fullName: false,
    email: false,
    phoneNumber: false,
    location: false,
    username: false,
    password: false,
    confirmPassword: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE_URL = "http://localhost:5000/api";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFocus = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setFocusedFields((prev) => ({ ...prev, [field]: false }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignup = () => {
    // Redirect to Google OAuth
    window.location.href = "http://localhost:5000/auth/google";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccessMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const userData = {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        username: formData.username,
        password: formData.password,
        role: "client", // Automatically set to client
      };

      const response = await axios.post(
        `${API_BASE_URL}/users/register`,
        userData
      );

      if (response.data.success) {
        setSuccessMessage(
          "Account created successfully! Redirecting to login..."
        );

        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else if (error.response?.status === 400) {
        setErrors({
          general: "User with this email or username already exists",
        });
      } else {
        setErrors({ general: "Registration failed. Please try again." });
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
      <div className="relative z-10 w-full max-w-lg mx-4">
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          {/* System Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Harmony <span className="text-red-500">Hub</span>
            </h1>
            <p className="text-gray-300 text-lg">Create Account</p>
            <p className="text-gray-400 text-sm mt-1">
              Join us and start your journey
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-center">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-center">
              {errors.general}
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div className="relative">
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                onFocus={() => handleFocus("fullName")}
                onBlur={() => handleBlur("fullName")}
                className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                  errors.fullName ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Enter your full name"
              />
              <label
                htmlFor="fullName"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.fullName || formData.fullName
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Full Name
              </label>
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="relative">
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onFocus={() => handleFocus("email")}
                onBlur={() => handleBlur("email")}
                className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                  errors.email ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Enter your email"
              />
              <label
                htmlFor="email"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.email || formData.email
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Email Address
              </label>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div className="relative">
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                onFocus={() => handleFocus("phoneNumber")}
                onBlur={() => handleBlur("phoneNumber")}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer"
                placeholder="Enter your phone number"
              />
              <label
                htmlFor="phoneNumber"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.phoneNumber || formData.phoneNumber
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Phone Number
              </label>
            </div>

            {/* Location Field */}
            <div className="relative">
              <input
                type="text"
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                onFocus={() => handleFocus("location")}
                onBlur={() => handleBlur("location")}
                className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer"
                placeholder="Enter your location"
              />
              <label
                htmlFor="location"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.location || formData.location
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Location
              </label>
            </div>

            {/* Username Field */}
            <div className="relative">
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                onFocus={() => handleFocus("username")}
                onBlur={() => handleBlur("username")}
                className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                  errors.username ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Choose a username"
              />
              <label
                htmlFor="username"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.username || formData.username
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Username
              </label>
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                className={`w-full px-4 py-4 pr-12 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                  errors.password ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Create a password"
              />
              <label
                htmlFor="password"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.password || formData.password
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:text-gray-200"
              >
                {showPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                onFocus={() => handleFocus("confirmPassword")}
                onBlur={() => handleBlur("confirmPassword")}
                className={`w-full px-4 py-4 pr-12 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                  errors.confirmPassword ? "border-red-500" : "border-gray-600"
                }`}
                placeholder="Confirm your password"
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                  focusedFields.confirmPassword || formData.confirmPassword
                    ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                    : "text-gray-400 text-sm top-4"
                }`}
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors focus:outline-none focus:text-gray-200"
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="w-5 h-5" />
                ) : (
                  <FaEye className="w-5 h-5" />
                )}
              </button>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-start space-x-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 focus:ring-2 mt-1"
              />
              <label
                htmlFor="terms"
                className="text-sm text-gray-300 leading-relaxed"
              >
                I agree to the{" "}
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-400 text-xs mt-1">{errors.terms}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? "Creating Account..." : "Create Account"}
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

          {/* Google Signup Button */}
          <button
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </button>

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-gray-300">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
