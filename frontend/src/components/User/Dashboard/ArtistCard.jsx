import { Music, Star } from "lucide-react";

const ArtistCard = ({ artist, onAdd }) => {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-purple-500 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20 group">
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div
            id={`${artist._id}-img-artist`}
            className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4"
          >
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg group-hover:text-purple-400 transition-colors">
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

        {!artist.isAvailable && (
          <div className="mb-3">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/50 text-red-300 border border-red-700">
              Unavailable
            </span>
          </div>
        )}

        <button
          onClick={() => onAdd(artist, `${artist._id}-img-artist`)}
          disabled={!artist.isAvailable}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 px-4 rounded font-medium transition-colors"
        >
          {artist.isAvailable ? "Add to Cart" : "Unavailable"}
        </button>
      </div>
    </div>
  );
};

export default ArtistCard;
