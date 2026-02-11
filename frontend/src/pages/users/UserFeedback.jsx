import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  Star,
  Package,
  Wrench,
  DollarSign,
  Heart,
  Send,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const UserFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [myFeedback, setMyFeedback] = useState([]);

  // Form states
  const [selectedBooking, setSelectedBooking] = useState("");
  const [serviceUsage, setServiceUsage] = useState({
    rating: 0,
    comment: "",
    servicesUsed: [],
  });
  const [equipmentStatus, setEquipmentStatus] = useState({
    rating: 0,
    comment: "",
    equipmentIssues: [],
  });
  const [valueFeedback, setValueFeedback] = useState({
    rating: 0,
    comment: "",
    priceSatisfaction: 0,
    wouldRecommend: false,
  });
  const [overallSatisfaction, setOverallSatisfaction] = useState({
    rating: 0,
    comment: "",
    improvements: [],
    highlights: [],
  });
  const [additionalComments, setAdditionalComments] = useState("");

  // Equipment issue form
  const [newIssue, setNewIssue] = useState({
    itemName: "",
    issue: "",
    severity: "minor",
  });

  useEffect(() => {
    fetchBookings();
    fetchMyFeedback();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Only show completed bookings for feedback
      const completedBookings = (res.data?.data || []).filter(
        (b) => b.status === "completed"
      );
      setBookings(completedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchMyFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/feedback/my-feedback`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyFeedback(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const handleAddEquipmentIssue = () => {
    if (newIssue.itemName && newIssue.issue) {
      setEquipmentStatus({
        ...equipmentStatus,
        equipmentIssues: [...equipmentStatus.equipmentIssues, { ...newIssue }],
      });
      setNewIssue({ itemName: "", issue: "", severity: "minor" });
    }
  };

  const handleRemoveEquipmentIssue = (index) => {
    setEquipmentStatus({
      ...equipmentStatus,
      equipmentIssues: equipmentStatus.equipmentIssues.filter((_, i) => i !== index),
    });
  };

  const handleAddImprovement = (improvement) => {
    if (improvement && !overallSatisfaction.improvements.includes(improvement)) {
      setOverallSatisfaction({
        ...overallSatisfaction,
        improvements: [...overallSatisfaction.improvements, improvement],
      });
    }
  };

  const handleRemoveImprovement = (index) => {
    setOverallSatisfaction({
      ...overallSatisfaction,
      improvements: overallSatisfaction.improvements.filter((_, i) => i !== index),
    });
  };

  const handleAddHighlight = (highlight) => {
    if (highlight && !overallSatisfaction.highlights.includes(highlight)) {
      setOverallSatisfaction({
        ...overallSatisfaction,
        highlights: [...overallSatisfaction.highlights, highlight],
      });
    }
  };

  const handleRemoveHighlight = (index) => {
    setOverallSatisfaction({
      ...overallSatisfaction,
      highlights: overallSatisfaction.highlights.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!overallSatisfaction.rating) {
      setError("Please provide an overall satisfaction rating");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/feedback/submit`,
        {
          bookingId: selectedBooking || null,
          serviceUsage: serviceUsage.rating > 0 ? serviceUsage : null,
          equipmentStatus: equipmentStatus.rating > 0 ? equipmentStatus : null,
          valueFeedback: valueFeedback.rating > 0 ? valueFeedback : null,
          overallSatisfaction,
          additionalComments,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setSuccess(true);
        // Reset form
        setSelectedBooking("");
        setServiceUsage({ rating: 0, comment: "", servicesUsed: [] });
        setEquipmentStatus({ rating: 0, comment: "", equipmentIssues: [] });
        setValueFeedback({ rating: 0, comment: "", priceSatisfaction: 0, wouldRecommend: false });
        setOverallSatisfaction({ rating: 0, comment: "", improvements: [], highlights: [] });
        setAdditionalComments("");
        fetchMyFeedback();
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ rating, setRating, maxRating = 5 }) => {
    return (
      <div className="flex gap-1">
        {[...Array(maxRating)].map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setRating(i + 1)}
            className={`transition-colors ${
              i < rating ? "text-yellow-400" : "text-gray-500"
            } hover:text-yellow-400`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Client Feedback</h1>
            <p className="text-gray-400">
              Share your experience and help us improve our services
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400">Feedback submitted successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Feedback Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Booking Selection */}
            <div className="bg-gray-800 rounded-lg p-6">
              <label className="block text-sm font-semibold mb-2">
                Related Booking (Optional)
              </label>
              <select
                value={selectedBooking}
                onChange={(e) => setSelectedBooking(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="">No specific booking</option>
                {bookings.map((booking) => (
                  <option key={booking._id} value={booking._id}>
                    Booking #{booking._id.slice(-6)} - {new Date(booking.bookingDate).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            {/* Service Usage Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Service Usage</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rating</label>
                  <StarRating
                    rating={serviceUsage.rating}
                    setRating={(rating) =>
                      setServiceUsage({ ...serviceUsage, rating })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Comment</label>
                  <textarea
                    value={serviceUsage.comment}
                    onChange={(e) =>
                      setServiceUsage({ ...serviceUsage, comment: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows="3"
                    placeholder="How was your experience with our services?"
                  />
                </div>
              </div>
            </div>

            {/* Equipment Status Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Equipment Status</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Rating</label>
                  <StarRating
                    rating={equipmentStatus.rating}
                    setRating={(rating) =>
                      setEquipmentStatus({ ...equipmentStatus, rating })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Comment</label>
                  <textarea
                    value={equipmentStatus.comment}
                    onChange={(e) =>
                      setEquipmentStatus({ ...equipmentStatus, comment: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows="3"
                    placeholder="How was the condition and performance of the equipment?"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Equipment Issues (if any)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newIssue.itemName}
                      onChange={(e) =>
                        setNewIssue({ ...newIssue, itemName: e.target.value })
                      }
                      placeholder="Item name"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                    <input
                      type="text"
                      value={newIssue.issue}
                      onChange={(e) =>
                        setNewIssue({ ...newIssue, issue: e.target.value })
                      }
                      placeholder="Issue description"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                    <select
                      value={newIssue.severity}
                      onChange={(e) =>
                        setNewIssue({ ...newIssue, severity: e.target.value })
                      }
                      className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    >
                      <option value="minor">Minor</option>
                      <option value="moderate">Moderate</option>
                      <option value="major">Major</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddEquipmentIssue}
                      className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded"
                    >
                      Add
                    </button>
                  </div>
                  {equipmentStatus.equipmentIssues.length > 0 && (
                    <div className="space-y-2">
                      {equipmentStatus.equipmentIssues.map((issue, index) => (
                        <div
                          key={index}
                          className="bg-gray-700 rounded px-3 py-2 flex items-center justify-between"
                        >
                          <span className="text-sm">
                            <strong>{issue.itemName}</strong>: {issue.issue} (
                            {issue.severity})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveEquipmentIssue(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Value Feedback */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Value & Pricing</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Value Rating</label>
                  <StarRating
                    rating={valueFeedback.rating}
                    setRating={(rating) =>
                      setValueFeedback({ ...valueFeedback, rating })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Price Satisfaction
                  </label>
                  <StarRating
                    rating={valueFeedback.priceSatisfaction}
                    setRating={(rating) =>
                      setValueFeedback({ ...valueFeedback, priceSatisfaction: rating })
                    }
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={valueFeedback.wouldRecommend}
                      onChange={(e) =>
                        setValueFeedback({
                          ...valueFeedback,
                          wouldRecommend: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-400">
                      Would you recommend our services?
                    </span>
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Comment</label>
                  <textarea
                    value={valueFeedback.comment}
                    onChange={(e) =>
                      setValueFeedback({ ...valueFeedback, comment: e.target.value })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows="3"
                    placeholder="Your thoughts on pricing and value..."
                  />
                </div>
              </div>
            </div>

            {/* Overall Satisfaction */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-orange-400" />
                <h3 className="text-lg font-semibold">Overall Satisfaction *</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Overall Rating *
                  </label>
                  <StarRating
                    rating={overallSatisfaction.rating}
                    setRating={(rating) =>
                      setOverallSatisfaction({ ...overallSatisfaction, rating })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Comment</label>
                  <textarea
                    value={overallSatisfaction.comment}
                    onChange={(e) =>
                      setOverallSatisfaction({
                        ...overallSatisfaction,
                        comment: e.target.value,
                      })
                    }
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    rows="4"
                    placeholder="Share your overall experience..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    What could we improve?
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddImprovement(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  {overallSatisfaction.improvements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {overallSatisfaction.improvements.map((imp, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 rounded px-3 py-1 text-sm flex items-center gap-2"
                        >
                          {imp}
                          <button
                            type="button"
                            onClick={() => handleRemoveImprovement(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    What did you like most?
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddHighlight(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      placeholder="Type and press Enter"
                      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                    />
                  </div>
                  {overallSatisfaction.highlights.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {overallSatisfaction.highlights.map((hl, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 rounded px-3 py-1 text-sm flex items-center gap-2"
                        >
                          {hl}
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div className="bg-gray-800 rounded-lg p-6">
              <label className="block text-sm font-semibold mb-2">
                Additional Comments
              </label>
              <textarea
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                rows="4"
                placeholder="Any other feedback or suggestions..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !overallSatisfaction.rating}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 transition-colors font-semibold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>

          {/* My Previous Feedback */}
          {myFeedback.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4">My Previous Feedback</h2>
              <div className="space-y-4">
                {myFeedback.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="bg-gray-800 rounded-lg p-6"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="text-lg font-semibold">
                          {feedback.overallSatisfaction.rating}/5
                        </span>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(feedback.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {feedback.overallSatisfaction.comment && (
                      <p className="text-gray-300 mb-2">
                        {feedback.overallSatisfaction.comment}
                      </p>
                    )}
                    {feedback.response && feedback.response.message && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className="text-sm text-gray-400 mb-1">Response from owner:</p>
                        <p className="text-gray-300">{feedback.response.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserFeedback;

