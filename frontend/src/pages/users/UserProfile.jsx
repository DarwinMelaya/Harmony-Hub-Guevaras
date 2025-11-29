import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Layout from "../../components/Layout/Layout";
import { API_BASE_URL } from "../../config/api";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const MAX_FILE_SIZE_MB = 5;

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileUploadData, setProfileUploadData] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("You need to be logged in to view this page.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_BASE_URL}/users/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.data) {
          const data = response.data.data;
          setProfile(data);
          setUsername(data.username || "");
          setProfilePreview(data.profilePhoto || null);
          setError("");
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        const message =
          err.response?.data?.message ||
          "Failed to load profile information. Please try again later.";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const initials = useMemo(() => {
    const base =
      profile?.displayName || profile?.fullName || profile?.username || "User";
    const parts = base.trim().split(" ").filter(Boolean);

    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();

    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [profile]);

  const handleFileChange = (event) => {
    setError("");
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG or JPG).");
      return;
    }

    const maxSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(`Image must be smaller than ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
      setProfileUploadData(reader.result);
      setRemovePhoto(false);
    };
    reader.readAsDataURL(file);

    // Allow selecting the same file again later
    event.target.value = "";
  };

  const handleRemovePhoto = () => {
    setProfilePreview(null);
    setProfileUploadData(null);
    setRemovePhoto(true);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!profile) {
      setError("Profile information is not loaded yet.");
      return;
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Username cannot be empty.");
      return;
    }

    const payload = {};
    if (trimmedUsername !== profile.username) {
      payload.username = trimmedUsername;
    }

    if (profileUploadData) {
      payload.profilePhoto = profileUploadData;
    } else if (removePhoto) {
      payload.removeProfilePhoto = true;
    }

    if (Object.keys(payload).length === 0) {
      setSuccess("No changes detected.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("You need to be logged in to update your profile.");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.put(
        `${API_BASE_URL}/users/profile`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        const updatedUser = response.data.data;
        setProfile(updatedUser);
        setUsername(updatedUser.username || "");
        setProfilePreview(updatedUser.profilePhoto || null);
        setProfileUploadData(null);
        setRemovePhoto(false);
        setSuccess("Profile updated successfully.");

        try {
          localStorage.setItem("user", JSON.stringify(updatedUser));
        } catch (storageError) {
          console.warn("Failed to persist user data:", storageError);
        }
      }
    } catch (err) {
      console.error("Failed to update profile:", err);
      const message =
        err.response?.data?.message ||
        "Failed to update profile. Please try again later.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from current password.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPasswordError("You need to be logged in to change your password.");
      return;
    }

    try {
      setChangingPassword(true);
      const response = await axios.put(
        `${API_BASE_URL}/users/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.success) {
        setPasswordSuccess("Password changed successfully.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Auto-hide after 3 seconds
        setTimeout(() => {
          setShowPasswordChange(false);
          setPasswordSuccess("");
        }, 3000);
      }
    } catch (err) {
      console.error("Failed to change password:", err);
      const message =
        err.response?.data?.message ||
        "Failed to change password. Please try again later.";
      setPasswordError(message);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen text-white px-4 py-8 md:px-8 md:py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <header className="rounded-2xl border border-gray-700 bg-gray-800/80 px-6 py-6 shadow-lg">
            <h1 className="text-3xl font-bold tracking-tight">
              Profile Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-300 leading-relaxed">
              Keep your Harmony Hub identity up to date. Personalize how other
              clients, staff, and artists see you across bookings, messages, and
              dashboards.
            </p>
          </header>

          {error && (
            <div className="rounded-xl border border-red-600/60 bg-red-900/70 px-4 py-3 text-red-100 shadow">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-600/60 bg-emerald-900/70 px-4 py-3 text-emerald-100 shadow">
              {success}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center rounded-2xl border border-gray-700 bg-gray-800/70 px-6 py-16 text-gray-300 shadow-inner">
              Loading profile...
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-10 rounded-2xl border border-gray-700 bg-gray-800/80 p-6 md:p-8 shadow-xl"
            >
              <section className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Profile Photo
                  </h2>
                  <p className="text-sm text-gray-300">
                    This photo appears beside your name in messages, bookings,
                    and dashboards.
                  </p>
                </div>

                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-24 md:h-28 md:w-28 rounded-full border border-gray-600 bg-gray-900/70 flex items-center justify-center overflow-hidden shadow-inner">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-gray-400">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <label className="inline-flex items-center justify-center rounded-lg border border-blue-500/60 bg-blue-500/15 px-4 py-2 text-sm font-medium text-blue-100 transition hover:bg-blue-500/25 cursor-pointer shadow">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      Upload new photo
                    </label>
                    {profilePreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="block text-left text-sm font-medium text-red-300 hover:text-red-200 transition"
                      >
                        Remove current photo
                      </button>
                    )}
                    <p className="text-xs text-gray-400">
                      PNG or JPG, up to {MAX_FILE_SIZE_MB}MB.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-5">
                <div className="space-y-3">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-200"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your username"
                  />
                  <p className="text-xs text-gray-400">
                    Usernames must be unique. This is how we greet you and show
                    your profile across the platform.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-gray-600 bg-gray-900/80 px-4 py-3 shadow-sm">
                    <span className="block text-xs uppercase tracking-wide text-gray-400">
                      Email
                    </span>
                    <span className="mt-1 block text-sm font-medium text-gray-100">
                      {profile?.email || "—"}
                    </span>
                  </div>
                  {/* <div className="rounded-lg border border-gray-600 bg-gray-900/80 px-4 py-3 shadow-sm">
                    <span className="block text-xs uppercase tracking-wide text-gray-400">
                      Role
                    </span>
                    <span className="mt-1 block text-sm font-medium capitalize text-gray-100">
                      {profile?.role || "—"}
                    </span>
                  </div> */}
                </div>
              </section>

              {/* Password Change Section */}
              <section className="space-y-5 border-t border-gray-700 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Change Password
                    </h2>
                    <p className="text-sm text-gray-300 mt-1">
                      Update your password to keep your account secure.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordChange(!showPasswordChange);
                      setPasswordError("");
                      setPasswordSuccess("");
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                    }}
                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showPasswordChange ? "Cancel" : "Change Password"}
                  </button>
                </div>

                {showPasswordChange && (
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    {passwordError && (
                      <div className="rounded-lg border border-red-600/60 bg-red-900/70 px-4 py-3 text-red-100 text-sm">
                        {passwordError}
                      </div>
                    )}

                    {passwordSuccess && (
                      <div className="rounded-lg border border-emerald-600/60 bg-emerald-900/70 px-4 py-3 text-emerald-100 text-sm">
                        {passwordSuccess}
                      </div>
                    )}

                    <div className="space-y-3">
                      <label
                        htmlFor="currentPassword"
                        className="block text-sm font-semibold text-gray-200"
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {showCurrentPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                          ) : (
                            <FaEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label
                        htmlFor="newPassword"
                        className="block text-sm font-semibold text-gray-200"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter your new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {showNewPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                          ) : (
                            <FaEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">
                        Password must be at least 6 characters long.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label
                        htmlFor="confirmPassword"
                        className="block text-sm font-semibold text-gray-200"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 pr-12 text-white placeholder-gray-500 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Confirm your new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <FaEyeSlash className="w-5 h-5" />
                          ) : (
                            <FaEye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={changingPassword}
                        className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 shadow"
                      >
                        {changingPassword
                          ? "Changing password..."
                          : "Update Password"}
                      </button>
                    </div>
                  </form>
                )}
              </section>

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60 shadow"
                >
                  {saving ? "Saving changes..." : "Save changes"}
                </button>
                <span className="text-xs text-gray-400">
                  Changes update instantly across your Harmony Hub experience.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
