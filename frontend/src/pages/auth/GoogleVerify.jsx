import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { FaCheck, FaArrowLeft } from "react-icons/fa";

const GoogleVerify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState("");
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const API_BASE_URL = "http://localhost:5000/api";

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const emailParam = urlParams.get("email");
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    } else {
      // If no email in URL, redirect to login
      navigate("/login?error=no_email");
    }
  }, [location, navigate]);

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({ verificationCode: "Please enter a valid 6-digit verification code" });
      return;
    }

    setVerifying(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-email`, {
        email: email,
        verificationCode: verificationCode,
      });

      if (response.data.success) {
        setSuccessMessage("Email verified successfully! Redirecting...");

        // Store token in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data));

        // Redirect based on user role
        const userRole = response.data.data.role;
        setTimeout(() => {
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
              navigate("/user-home");
          }
        }, 2000);
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (error.response?.data?.message) {
        setErrors({ verificationCode: error.response.data.message });
      } else {
        setErrors({ verificationCode: "Verification failed. Please try again." });
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResendingCode(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/resend-verification`, {
        email: email,
      });

      if (response.data.success) {
        setSuccessMessage("Verification code sent successfully! Please check your email.");
        setVerificationCode("");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: "Failed to resend verification code. Please try again." });
      }
    } finally {
      setResendingCode(false);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

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
            <p className="text-gray-300 text-lg">Verify Your Email</p>
            <p className="text-blue-400 text-sm mt-2">
              Check your email for the verification code
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

          {/* Verification Content */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-300 text-lg mb-2">
                We've sent a verification code to
              </p>
              <p className="text-blue-400 font-semibold text-lg">
                {email}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Please enter the 6-digit code to verify your email address
              </p>
            </div>

            {/* Verification Code Input */}
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setVerificationCode(value);
                    if (errors.verificationCode) {
                      setErrors((prev) => ({ ...prev, verificationCode: "" }));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && verificationCode.length === 6) {
                      handleVerifyEmail();
                    }
                  }}
                  className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white text-center text-3xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                    errors.verificationCode ? "border-red-500" : "border-gray-600"
                  }`}
                  placeholder="000000"
                  maxLength="6"
                  autoFocus
                />
                {errors.verificationCode && (
                  <p className="text-red-400 text-xs mt-2 text-center">
                    {errors.verificationCode}
                  </p>
                )}
              </div>

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={resendingCode}
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed underline"
                >
                  {resendingCode ? "Sending..." : "Resend Code"}
                </button>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <p className="text-blue-300 text-sm text-center">
                💡 The verification code will expire in 10 minutes. If you don't see the email, check your spam folder.
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              onClick={handleVerifyEmail}
              disabled={verifying || verificationCode.length !== 6}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {verifying ? "Verifying..." : "Verify Email"}
              <FaCheck className="w-4 h-4" />
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors flex items-center justify-center gap-2 mx-auto"
              >
                <FaArrowLeft className="w-3 h-3" />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleVerify;

