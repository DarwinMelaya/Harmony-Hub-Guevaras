import Layout from "../../components/Layout/Layout";
import { useState, useEffect } from "react";
import axios from "axios";
import {
  MessageSquare,
  Star,
  TrendingUp,
  TrendingDown,
  Package,
  Wrench,
  DollarSign,
  Heart,
  Users,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const OwnerFeedback = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const [allFeedback, setAllFeedback] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [responding, setResponding] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    minRating: "",
  });

  useEffect(() => {
    fetchInsights();
    fetchAllFeedback();
  }, [filters]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const url = `${API_BASE_URL}/feedback/insights/analytics${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setInsights(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch insights");
      console.error("Error fetching insights:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllFeedback = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.status) params.append("status", filters.status);
      if (filters.minRating) params.append("minRating", filters.minRating);

      const url = `${API_BASE_URL}/feedback${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setAllFeedback(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching feedback:", err);
    }
  };

  const handleRespondToFeedback = async (feedbackId) => {
    if (!responseMessage.trim()) {
      setError("Please enter a response message");
      return;
    }

    try {
      setResponding(true);
      setError(null);
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_BASE_URL}/feedback/${feedbackId}/respond`,
        { message: responseMessage },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setShowResponseModal(false);
        setResponseMessage("");
        setSelectedFeedback(null);
        fetchAllFeedback();
        fetchInsights();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to respond to feedback");
    } finally {
      setResponding(false);
    }
  };

  const handleUpdateStatus = async (feedbackId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/feedback/${feedbackId}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAllFeedback();
      fetchInsights();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update status");
    }
  };

  const StarDisplay = ({ rating, maxRating = 5, size = "w-5 h-5" }) => {
    return (
      <div className="flex gap-1">
        {[...Array(maxRating)].map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-500"
            }`}
          />
        ))}
      </div>
    );
  };

  const StatCard = ({ title, value, icon: Icon, trend, subtitle }) => {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-gray-400">{title}</h3>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 ${trend > 0 ? "text-green-400" : "text-red-400"}`}>
              {trend > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span className="text-xs">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        {subtitle && <div className="text-sm text-gray-400">{subtitle}</div>}
      </div>
    );
  };

  return (
    <Layout>
      <div className="bg-[#30343c] min-h-screen w-full text-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Client Feedback Insights</h1>
              <p className="text-gray-400">
                Insights into service usage, equipment status, revenue trends, and customer
                satisfaction
              </p>
            </div>
            <button
              onClick={() => {
                fetchInsights();
                fetchAllFeedback();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{error}</span>
            </div>
          )}

          {/* Filters */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-gray-400" />
              <h3 className="text-lg font-semibold">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters({ ...filters, startDate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters({ ...filters, endDate: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">All</option>
                  <option value="submitted">Submitted</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Min Rating</label>
                <select
                  value={filters.minRating}
                  onChange={(e) =>
                    setFilters({ ...filters, minRating: e.target.value })
                  }
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                >
                  <option value="">All</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3">3+ Stars</option>
                  <option value="2">2+ Stars</option>
                  <option value="1">1+ Stars</option>
                </select>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-4" />
              <p className="text-gray-400">Loading insights...</p>
            </div>
          )}

          {/* Insights Dashboard */}
          {!loading && insights && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                  title="Total Feedback"
                  value={insights.satisfaction?.totalFeedback || 0}
                  icon={MessageSquare}
                />
                <StatCard
                  title="Average Rating"
                  value={
                    insights.satisfaction?.averageRating
                      ? insights.satisfaction.averageRating.toFixed(1)
                      : "0.0"
                  }
                  icon={Star}
                  subtitle={`out of 5.0`}
                />
                <StatCard
                  title="NPS Score"
                  value={
                    insights.satisfaction?.npsScore
                      ? `${insights.satisfaction.npsScore.toFixed(0)}`
                      : "0"
                  }
                  icon={TrendingUp}
                  subtitle="Net Promoter Score"
                />
                <StatCard
                  title="Recommendation Rate"
                  value={
                    insights.value?.recommendationRate
                      ? `${(insights.value.recommendationRate * 100).toFixed(0)}%`
                      : "0%"
                  }
                  icon={Heart}
                />
              </div>

              {/* Detailed Statistics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Satisfaction Breakdown */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-orange-400" />
                    Customer Satisfaction
                  </h3>
                  {insights.satisfaction?.ratingDistribution && (
                    <div className="space-y-3">
                      {insights.satisfaction.ratingDistribution
                        .sort((a, b) => b._id - a._id)
                        .map((rating) => (
                          <div key={rating._id} className="flex items-center gap-3">
                            <div className="flex items-center gap-1 w-20">
                              <StarDisplay rating={rating._id} size="w-4 h-4" />
                            </div>
                            <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
                              <div
                                className="bg-orange-500 h-4 rounded-full"
                                style={{
                                  width: `${
                                    (rating.count /
                                      (insights.satisfaction.totalFeedback || 1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-300 w-12 text-right">
                              {rating.count}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Service Usage */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5 text-orange-400" />
                    Service Usage
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Average Rating</span>
                        <span className="text-lg font-semibold">
                          {insights.serviceUsage?.averageRating
                            ? insights.serviceUsage.averageRating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                      {insights.serviceUsage?.averageRating && (
                        <StarDisplay
                          rating={Math.round(insights.serviceUsage.averageRating)}
                        />
                      )}
                    </div>
                    {insights.trends?.serviceUsageBreakdown &&
                      insights.trends.serviceUsageBreakdown.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-400">
                            Services Used
                          </h4>
                          <div className="space-y-2">
                            {insights.trends.serviceUsageBreakdown.map((service) => (
                              <div
                                key={service._id}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm capitalize">{service._id}</span>
                                <span className="text-sm text-gray-400">
                                  {service.count} times
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Equipment Status */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-orange-400" />
                    Equipment Status
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Average Rating</span>
                        <span className="text-lg font-semibold">
                          {insights.equipment?.averageRating
                            ? insights.equipment.averageRating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                      {insights.equipment?.averageRating && (
                        <StarDisplay
                          rating={Math.round(insights.equipment.averageRating)}
                        />
                      )}
                    </div>
                    {insights.equipment?.itemsWithIssues > 0 && (
                      <div className="bg-yellow-500/20 border border-yellow-500/50 rounded p-3">
                        <p className="text-sm text-yellow-400">
                          {insights.equipment.itemsWithIssues} items reported with issues
                        </p>
                      </div>
                    )}
                    {insights.equipment?.issuesBreakdown &&
                      insights.equipment.issuesBreakdown.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-400">
                            Issues by Severity
                          </h4>
                          <div className="space-y-2">
                            {insights.equipment.issuesBreakdown.map((issue) => (
                              <div
                                key={issue._id}
                                className="flex items-center justify-between"
                              >
                                <span className="text-sm capitalize">{issue._id}</span>
                                <span className="text-sm text-gray-400">{issue.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                </div>

                {/* Value & Pricing */}
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-400" />
                    Value & Pricing
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Value Rating</span>
                        <span className="text-lg font-semibold">
                          {insights.value?.averageRating
                            ? insights.value.averageRating.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                      {insights.value?.averageRating && (
                        <StarDisplay rating={Math.round(insights.value.averageRating)} />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Price Satisfaction</span>
                        <span className="text-lg font-semibold">
                          {insights.value?.averagePriceSatisfaction
                            ? insights.value.averagePriceSatisfaction.toFixed(1)
                            : "N/A"}
                        </span>
                      </div>
                      {insights.value?.averagePriceSatisfaction && (
                        <StarDisplay
                          rating={Math.round(insights.value.averagePriceSatisfaction)}
                        />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Would Recommend</span>
                        <span className="text-lg font-semibold">
                          {insights.value?.recommendationRate
                            ? `${(insights.value.recommendationRate * 100).toFixed(0)}%`
                            : "0%"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Feedback */}
              {insights.recent && insights.recent.length > 0 && (
                <div className="bg-gray-800 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                    Recent Feedback
                  </h3>
                  <div className="space-y-4">
                    {insights.recent.map((feedback) => (
                      <div
                        key={feedback._id}
                        className="bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StarDisplay rating={feedback.overallSatisfaction.rating} />
                            <span className="text-sm text-gray-400">
                              {feedback.user?.fullName || "Anonymous"}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(feedback.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {feedback.overallSatisfaction.comment && (
                          <p className="text-gray-300 text-sm">
                            {feedback.overallSatisfaction.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* All Feedback List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-orange-400" />
              All Feedback ({allFeedback.length})
            </h3>
            <div className="space-y-4">
              {allFeedback.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No feedback found</p>
              ) : (
                allFeedback.map((feedback) => (
                  <div
                    key={feedback._id}
                    className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StarDisplay rating={feedback.overallSatisfaction.rating} />
                          <span className="font-semibold">
                            {feedback.user?.fullName || "Anonymous"}
                          </span>
                          {feedback.booking && (
                            <span className="text-xs text-gray-400">
                              Booking #{feedback.booking._id.slice(-6)}
                            </span>
                          )}
                        </div>
                        {feedback.overallSatisfaction.comment && (
                          <p className="text-gray-300 text-sm mb-2">
                            {feedback.overallSatisfaction.comment}
                          </p>
                        )}
                        {feedback.response && feedback.response.message && (
                          <div className="mt-2 pt-2 border-t border-gray-600">
                            <p className="text-xs text-gray-400 mb-1">
                              Response from {feedback.response.respondedBy?.fullName}:
                            </p>
                            <p className="text-gray-300 text-sm">
                              {feedback.response.message}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <select
                          value={feedback.status}
                          onChange={(e) =>
                            handleUpdateStatus(feedback._id, e.target.value)
                          }
                          className="bg-gray-600 border border-gray-500 rounded px-2 py-1 text-sm text-white"
                        >
                          <option value="submitted">Submitted</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="archived">Archived</option>
                        </select>
                        {!feedback.response && (
                          <button
                            onClick={() => {
                              setSelectedFeedback(feedback);
                              setShowResponseModal(true);
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Respond
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && selectedFeedback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Respond to Feedback</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">
                From: {selectedFeedback.user?.fullName}
              </p>
              <p className="text-sm text-gray-300">
                {selectedFeedback.overallSatisfaction.comment}
              </p>
            </div>
            <textarea
              value={responseMessage}
              onChange={(e) => setResponseMessage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mb-4"
              rows="4"
              placeholder="Enter your response..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResponseModal(false);
                  setResponseMessage("");
                  setSelectedFeedback(null);
                }}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRespondToFeedback(selectedFeedback._id)}
                disabled={responding || !responseMessage.trim()}
                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded transition-colors"
              >
                {responding ? "Sending..." : "Send Response"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default OwnerFeedback;

