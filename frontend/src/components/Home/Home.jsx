import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/images/bg.jpg')" }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="text-white">HARMONY</span>{" "}
            <span className="text-red-500 no-underline">HUB</span>
          </h1>
        </div>

        {/* Main Text */}
        <div className="mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            WE BRING YOU
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-2 mb-2">
            <span className="text-3xl md:text-5xl font-bold text-red-500 no-underline">
              GUEVARRA
            </span>
            <span className="text-3xl md:text-5xl font-bold text-white">
              LIGHT AND
            </span>
          </div>
          <h3 className="text-3xl md:text-5xl font-bold text-white">
            SOUND SERVICES NEEDS
          </h3>
        </div>

        {/* Book Now Button */}
        <button
          onClick={() => navigate("/login")}
          className="bg-black/50 backdrop-blur-sm border border-white/20 text-white font-bold py-4 px-8 rounded-lg text-xl md:text-2xl transition-all duration-300 hover:bg-black/70 hover:border-white/40 shadow-2xl"
        >
          BOOK NOW
        </button>
      </div>
    </div>
  );
};

export default Home;
