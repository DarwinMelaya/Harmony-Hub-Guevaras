import { Music, Star, Calendar, Clock } from "lucide-react";

const ArtistCard = ({
  artist,
  onAdd,
  bookingDate,
  artistAvailability,
  checkingAvailability,
}) => {
  // Only consider date-specific availability; default to available when no date selected
  const isDateSpecificUnavailable =
    bookingDate && artistAvailability[`${artist._id}-${bookingDate}`] === false;

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group flex flex-col">
      <div className="p-4 md:p-6 flex-1 flex flex-col">
        <div className="flex items-center mb-4">
          <div
            id={`${artist._id}-img-artist`}
            className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4"
          >
            <Music className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors truncate">
              {artist.fullName || artist.name}
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300 border border-purple-700">
              {artist.genre}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className="text-purple-400 font-bold text-xl">
            ₱{Number(artist.booking_fee).toLocaleString()}
          </span>
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 text-sm">4.9</span>
          </div>
        </div>

        {/* Availability Status - only date-specific */}
        {isDateSpecificUnavailable && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-900/50 text-orange-300 border border-orange-700">
              <Calendar className="w-3 h-3 mr-1" />
              Booked on {bookingDate}
            </span>
          </div>
        )}

        {bookingDate && !isDateSpecificUnavailable && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300 border border-green-700">
              <Calendar className="w-3 h-3 mr-1" />
              Available on {bookingDate}
            </span>
          </div>
        )}

        <button
          onClick={() => onAdd(artist, `${artist._id}-img-artist`)}
          disabled={Boolean(bookingDate && isDateSpecificUnavailable)}
          className="mt-auto w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors"
        >
          {bookingDate && isDateSpecificUnavailable
            ? "Unavailable on selected date"
            : "Add to Selection"}
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
