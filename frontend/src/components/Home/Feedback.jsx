import { useEffect, useState } from "react";
import axios from "axios";
import { Star, MessageSquare } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

const Feedback = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ averageRating: 0, totalFeedback: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Public endpoint: backend/routes/feedback.js -> getPublicHomeFeedback
        const res = await axios.get(
          `${API_BASE_URL}/feedback/public/home?minRating=3&limit=9`
        );

        const allFeedback = res.data?.data || [];

        const mapped = allFeedback.map((item) => ({
          _id: item._id,
          userName: item.user?.fullName || "Verified Client",
          rating: item.overallSatisfaction?.rating || 0,
          comment: item.overallSatisfaction?.comment || "",
          createdAt: item.createdAt,
        }));

        // Compute stats based directly on Feedback model data
        if (mapped.length > 0) {
          const totalFeedback = mapped.length;
          const sumRatings = mapped.reduce(
            (sum, r) => sum + (Number(r.rating) || 0),
            0
          );
          const averageRating = sumRatings / totalFeedback;

          setStats({
            averageRating,
            totalFeedback,
          });
        } else {
          setStats({
            averageRating: 0,
            totalFeedback: 0,
          });
        }

        setReviews(mapped);
      } catch (error) {
        // If API is not accessible, just show empty state
        setStats({
          averageRating: 0,
          totalFeedback: 0,
        });
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const renderStars = (rating, size = "w-4 h-4") => {
    return (
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            className={`${size} ${
              index < rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-500"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="bg-gradient-to-b from-black via-gray-900 to-black py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-2 rounded-full bg-orange-500/10 border border-orange-500/40">
            <MessageSquare className="w-6 h-6 text-orange-400" />
          </div>
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white">
              What Clients Say
            </h2>
            <p className="text-sm md:text-base text-gray-400">
              Real stories from events powered by Harmony Hub
            </p>
          </div>
        </div>

        {/* Rating summary */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 bg-gray-900/60 border border-gray-800 rounded-2xl px-5 py-4 shadow-lg shadow-black/40">
            <div className="text-4xl font-extrabold text-white leading-none">
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="space-y-1">
              {renderStars(Math.round(stats.averageRating || 0), "w-5 h-5")}
              <p className="text-xs md:text-sm text-gray-400 mt-1">
                Based on {stats.totalFeedback}{" "}
                {stats.totalFeedback === 1 ? "review" : "reviews"}
              </p>
              {stats.totalFeedback > 0 && (
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide font-semibold text-green-400 bg-green-500/10 border border-green-500/40 rounded-full px-2 py-0.5">
                  ★ Trusted by real event clients
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews list */}
        {loading ? (
          <div className="text-center text-gray-400">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-gray-400">
            No reviews available yet. Be the first to experience Harmony Hub!
          </div>
        ) : (
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review, index) => (
              <article
                key={review._id}
                className="relative bg-gradient-to-b from-gray-900/80 to-black/80 border border-gray-800 rounded-2xl p-4 md:p-5 shadow-lg hover:border-orange-500/70 hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                {/* Badge */}
                <div className="absolute -top-2 left-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/90 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 text-black shadow-sm shadow-black/40">
                    {index === 0 ? "Top Review" : "Verified Client"}
                  </span>
                </div>

                <div className="flex items-start justify-between mt-2 mb-3">
                  <div>
                    <p className="font-semibold text-white text-sm md:text-base">
                      {review.userName}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {review.createdAt
                        ? new Date(review.createdAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="inline-flex items-center gap-1 rounded-full bg-black/60 border border-yellow-500/40 px-2 py-0.5">
                      <span className="text-xs font-semibold text-yellow-400">
                        {review.rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-gray-300">
                        /5 Rating
                      </span>
                    </div>
                    <div className="mt-1">{renderStars(review.rating)}</div>
                  </div>
                </div>

                {review.comment && (
                  <p className="mt-1 text-sm text-gray-200 line-clamp-4 text-left italic">
                    “{review.comment}”
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Feedback;
