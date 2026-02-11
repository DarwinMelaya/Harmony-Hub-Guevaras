import { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import {
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { provinces, cities, barangays } from "select-philippines-address";

const Signup = () => {
  const [provinceData, setProvince] = useState([]);
  const [cityData, setCity] = useState([]);
  const [barangayData, setBarangay] = useState([]);

  const [provinceAddr, setProvinceAddr] = useState("Marinduque");
  const [cityAddr, setCityAddr] = useState("");
  const [barangayAddr, setBarangayAddr] = useState("");

  useEffect(() => {
    const loadAddressData = async () => {
      try {
        const provList = await provinces("17"); // fetch provinces for region 17 (MIMAROPA)
        setProvince(provList);
        const marinduque = provList.find(
          (p) => p.province_name === "Marinduque"
        );
        if (marinduque?.province_code) {
          const cityList = await cities(marinduque.province_code);
          setCity(cityList || []);
          setProvinceAddr(marinduque.province_name);
        } else {
          setCity([]);
        }
      } catch (err) {
        console.error("Failed to load address data:", err);
        setProvince([]);
        setCity([]);
        setBarangay([]);
      }
    };
    loadAddressData();
  }, []);

  const handleCityChange = (e) => {
    const cityCode = e.target.value;
    const cityName = e.target.selectedOptions[0].text;
    setCityAddr(cityName);

    barangays(cityCode).then((response) => setBarangay(response));
  };

  const handleBarangayChange = (e) => {
    const barangayName = e.target.selectedOptions[0].text;
    setBarangayAddr(barangayName);

    const locationValue = `${barangayName}, ${cityAddr}, ${provinceAddr}`;
    handleInputChange("location", locationValue);
  };

  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    location: "",
    username: "",
    password: "",
    confirmPassword: "",
    role: "client",
    genre: "",
    booking_fee: "",
  });
  const [focusedFields, setFocusedFields] = useState({
    fullName: false,
    email: false,
    phoneNumber: false,
    location: false,
    username: false,
    password: false,
    confirmPassword: false,
    genre: false,
    booking_fee: false,
    verificationCode: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);

  const API_BASE_URL = "http://localhost:5000/api";

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 1) {
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
      if (formData.phoneNumber && !/^\d+$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Phone number must contain digits only";
      }
    }

    if (currentStep === 2) {
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (!strongPassword.test(formData.password)) {
        newErrors.password =
          "At least 8 chars, with uppercase, lowercase, and a number";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (formData.role === "artist") {
        if (!formData.genre.trim()) {
          newErrors.genre = "Genre is required for artists";
        }
        if (!formData.booking_fee) {
          newErrors.booking_fee = "Booking fee is required for artists";
        } else if (parseFloat(formData.booking_fee) < 0) {
          newErrors.booking_fee = "Booking fee must be a positive number";
        }
      }
    }

    if (currentStep === 3) {
      if (!agreeToTerms) {
        newErrors.terms = "You must agree to the terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      nextStep();
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

    // Validate all steps
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
    if (formData.phoneNumber && !/^\d+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must contain digits only";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
      if (!strongPassword.test(formData.password)) {
        newErrors.password =
          "At least 8 chars, with uppercase, lowercase, and a number";
      }
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (formData.role === "artist") {
      if (!formData.genre.trim()) {
        newErrors.genre = "Genre is required for artists";
      }
      if (!formData.booking_fee) {
        newErrors.booking_fee = "Booking fee is required for artists";
      } else if (parseFloat(formData.booking_fee) < 0) {
        newErrors.booking_fee = "Booking fee must be a positive number";
      }
    }
    if (!agreeToTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoogleSignup = (desiredRole) => {
    const role = desiredRole || formData.role || "client";
    const base = "http://localhost:5000/auth/google";
    // Pass the currently selected role to backend (if supported)
    window.location.href = `${base}?role=${encodeURIComponent(role)}`;
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
        role: formData.role,
      };

      // Add artist-specific fields if role is artist
      if (formData.role === "artist") {
        userData.genre = formData.genre;
        userData.booking_fee = parseFloat(formData.booking_fee);
      }

      const response = await axios.post(
        `${API_BASE_URL}/users/register`,
        userData
      );

      if (response.data.success) {
        // Store pending email for verification
        setPendingEmail(formData.email);
        setSuccessMessage(
          "Account created successfully! Please check your email for verification code."
        );

        // Move to verification step
        setCurrentStep(4);
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

  const handleVerifyEmail = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrors({
        verificationCode: "Please enter a valid 6-digit verification code",
      });
      return;
    }

    setVerifying(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-email`, {
        email: pendingEmail,
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
        setErrors({
          verificationCode: "Verification failed. Please try again.",
        });
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
      const response = await axios.post(
        `${API_BASE_URL}/users/resend-verification`,
        {
          email: pendingEmail,
        }
      );

      if (response.data.success) {
        setSuccessMessage(
          "Verification code sent successfully! Please check your email."
        );
        setVerificationCode("");
      }
    } catch (error) {
      console.error("Resend code error:", error);
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({
          general: "Failed to resend verification code. Please try again.",
        });
      }
    } finally {
      setResendingCode(false);
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
      <div className="relative z-10 w-full max-w-2xl mx-4">
        <div className="bg-gray-900/60 backdrop-blur-lg rounded-3xl shadow-2xl border border-gray-700/50 p-8">
          {/* System Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Harmony <span className="text-red-500">Hub</span>
            </h1>
            <p className="text-gray-300 text-lg">Create Account</p>
            <p className="text-gray-400 text-sm mt-1">
              Step {currentStep} of {totalSteps}
            </p>
            {currentStep === 4 && (
              <p className="text-blue-400 text-sm mt-2">
                Check your email for the verification code
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                    step <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {step < currentStep ? <FaCheck className="w-4 h-4" /> : step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>Personal Info</span>
              <span>Account Details</span>
              <span>Terms & Submit</span>
              <span>Verify Email</span>
            </div>
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

          {/* Step Content */}
          <div className="min-h-[450px]">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="relative">
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
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
                      <p className="text-red-400 text-xs mt-1">
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
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
                      <p className="text-red-400 text-xs mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="relative">
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={formData.phoneNumber}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        handleInputChange("phoneNumber", digitsOnly);
                      }}
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
                    {errors.phoneNumber && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* Username */}
                  <div className="relative">
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) =>
                        handleInputChange("username", e.target.value)
                      }
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
                      <p className="text-red-400 text-xs mt-1">
                        {errors.username}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location Section - Full Width */}
                <div className="space-y-4">
                  <label className="block text-blue-400 text-sm font-medium mb-2">
                    Location
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* City Select */}
                    <div>
                      <select
                        onChange={handleCityChange}
                        className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                      >
                        <option value="">Select City</option>
                        {cityData.map((city) => (
                          <option key={city.city_code} value={city.city_code}>
                            {city.city_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Barangay Select */}
                    <div>
                      <select
                        onChange={handleBarangayChange}
                        disabled={!cityAddr}
                        className={`w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                          !cityAddr ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <option value="">Select Barangay</option>
                        {barangayData.map((barangay) => (
                          <option
                            key={barangay.brgy_code}
                            value={barangay.brgy_code}
                          >
                            {barangay.brgy_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Auto-filled Location Display */}
                  {formData.location && (
                    <div className="relative">
                      <input
                        type="text"
                        id="location"
                        value={formData.location}
                        readOnly
                        className="w-full px-4 py-4 bg-gray-800/30 border border-gray-600 rounded-xl text-gray-400 focus:outline-none backdrop-blur-sm transition-all duration-300 cursor-not-allowed"
                      />
                      <label
                        htmlFor="location"
                        className="absolute left-4 -top-2 text-gray-500 text-xs bg-gray-900/60 px-2"
                      >
                        Complete Address
                      </label>
                    </div>
                  )}
                </div>

                {/* Google Signup Option (Step 1) */}
                <div className="pt-2">
                  <div className="relative mb-3">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900/60 text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleGoogleSignup(formData.role)}
                    className="w-full flex items-center justify-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
                  >
                    <FcGoogle className="w-5 h-5" />
                    Continue with Google
                    {formData.role ? ` as ${formData.role}` : ""}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Account Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Account Details
                </h2>

                {/* Role Selection */}
                <div className="relative">
                  <select
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="w-full px-4 py-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  >
                    <option value="client">Client</option>
                    <option value="artist">Artist</option>
                  </select>
                  <label
                    htmlFor="role"
                    className="absolute left-4 -top-2 text-blue-400 text-xs bg-gray-900/60 px-2"
                  >
                    Account Type
                  </label>
                </div>

                {/* Artist-specific fields */}
                {formData.role === "artist" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Genre Field */}
                    <div className="relative">
                      <input
                        type="text"
                        id="genre"
                        value={formData.genre}
                        onChange={(e) =>
                          handleInputChange("genre", e.target.value)
                        }
                        onFocus={() => handleFocus("genre")}
                        onBlur={() => handleBlur("genre")}
                        className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                          errors.genre ? "border-red-500" : "border-gray-600"
                        }`}
                        placeholder="Enter your music genre"
                      />
                      <label
                        htmlFor="genre"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          focusedFields.genre || formData.genre
                            ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                            : "text-gray-400 text-sm top-4"
                        }`}
                      >
                        Music Genre
                      </label>
                      {errors.genre && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.genre}
                        </p>
                      )}
                    </div>

                    {/* Booking Fee Field */}
                    <div className="relative">
                      <input
                        type="number"
                        id="booking_fee"
                        value={formData.booking_fee}
                        onChange={(e) =>
                          handleInputChange("booking_fee", e.target.value)
                        }
                        onFocus={() => handleFocus("booking_fee")}
                        onBlur={() => handleBlur("booking_fee")}
                        min="0"
                        step="0.01"
                        className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 peer ${
                          errors.booking_fee
                            ? "border-red-500"
                            : "border-gray-600"
                        }`}
                        placeholder="Enter your booking fee"
                      />
                      <label
                        htmlFor="booking_fee"
                        className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                          focusedFields.booking_fee || formData.booking_fee
                            ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                            : "text-gray-400 text-sm top-4"
                        }`}
                      >
                        Booking Fee (₱)
                      </label>
                      {errors.booking_fee && (
                        <p className="text-red-400 text-xs mt-1">
                          {errors.booking_fee}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Field */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
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
                      <p className="text-red-400 text-xs mt-1">
                        {errors.password}
                      </p>
                    )}
                    {!errors.password && (
                      <p className="text-gray-400 text-xs mt-1">
                        Minimum 8 characters with uppercase, lowercase, and a
                        number.
                      </p>
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
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-600"
                      }`}
                      placeholder="Confirm your password"
                    />
                    <label
                      htmlFor="confirmPassword"
                      className={`absolute left-4 transition-all duration-300 pointer-events-none ${
                        focusedFields.confirmPassword ||
                        formData.confirmPassword
                          ? "text-blue-400 text-xs -top-2 bg-gray-900/60 px-2"
                          : "text-gray-400 text-sm top-4"
                      }`}
                    >
                      Confirm Password
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
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
                </div>
              </div>
            )}

            {/* Step 3: Terms & Submit */}
            {currentStep === 3 && !pendingEmail && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Terms & Conditions
                </h2>

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

                {/* Google Signup Option */}
                <div className="pt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900/60 text-gray-400">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105 mt-4"
                  >
                    <FcGoogle className="w-5 h-5" />
                    Continue with Google
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Email Verification */}
            {currentStep === 4 && pendingEmail && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-white mb-6 text-center">
                  Verify Your Email
                </h2>

                <div className="text-center mb-6">
                  <p className="text-gray-300 text-lg mb-2">
                    We've sent a verification code to
                  </p>
                  <p className="text-blue-400 font-semibold text-lg">
                    {pendingEmail}
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
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 6);
                        setVerificationCode(value);
                        if (errors.verificationCode) {
                          setErrors((prev) => ({
                            ...prev,
                            verificationCode: "",
                          }));
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          verificationCode.length === 6
                        ) {
                          handleVerifyEmail();
                        }
                      }}
                      onFocus={() => handleFocus("verificationCode")}
                      onBlur={() => handleBlur("verificationCode")}
                      className={`w-full px-4 py-4 bg-gray-800/50 border rounded-xl text-white text-center text-3xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 ${
                        errors.verificationCode
                          ? "border-red-500"
                          : "border-gray-600"
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
                    💡 The verification code will expire in 10 minutes. If you
                    don't see the email, check your spam folder.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div
            className={`flex ${
              currentStep === 4 && pendingEmail
                ? "justify-center"
                : "justify-between"
            } mt-8`}
          >
            {currentStep !== 4 && (
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 bg-gray-700/50 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaArrowLeft className="w-4 h-4" />
                Previous
              </button>
            )}

            {currentStep === 4 && pendingEmail ? (
              <button
                type="button"
                onClick={handleVerifyEmail}
                disabled={verifying || verificationCode.length !== 6}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? "Verifying..." : "Verify Email"}
                <FaCheck className="w-4 h-4" />
              </button>
            ) : currentStep < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              >
                Next
                <FaArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? "Creating Account..." : "Create Account"}
                <FaCheck className="w-4 h-4" />
              </button>
            )}
          </div>

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
