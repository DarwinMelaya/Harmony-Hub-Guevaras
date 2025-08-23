const Contact = () => {
  return (
    <div className="w-full">
      {/* Top Section - White Header */}
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 uppercase tracking-wider">
            CONTACT
          </h1>
          <div className="w-24 h-1 bg-red-500 mx-auto mt-4"></div>
        </div>
      </div>

      {/* Middle Section - Dark Gray Content Area */}
      <div className="bg-gradient-to-br from-gray-700 to-gray-800 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Column 1 - Navigation/Services */}
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-bold uppercase mb-6 tracking-wider border-b border-white/20 pb-2">
                  HOME
                </h3>
                <ul className="space-y-3 text-gray-300 uppercase text-sm">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    RENTAL
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    LIGHTING
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    SOUNDS
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    STAGE AND TRUSSER
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    BAND EQUIPMENT
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    LED WALL
                  </li>
                </ul>
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-bold uppercase mb-6 tracking-wider border-b border-white/20 pb-2">
                  SERVICES
                </h3>
                <ul className="space-y-3 text-gray-300 uppercase text-sm">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    FREELANCER
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    MUSICIAN/ ARTIST
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 2 - Event Types & About */}
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-bold uppercase mb-6 tracking-wider border-b border-white/20 pb-2">
                  BIRTHDAY
                </h3>
                <ul className="space-y-3 text-gray-300 uppercase text-sm">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    WEDDING
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    CONCERT
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    CORPORATE
                  </li>
                </ul>
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-bold uppercase mb-6 tracking-wider border-b border-white/20 pb-2">
                  ABOUT US
                </h3>
                <ul className="space-y-3 text-gray-300 uppercase text-sm">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    TESTIMONIAL
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    OUR TEAM
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    BLOG
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    FAQS
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3 - Company Information */}
            <div className="lg:col-span-1">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-8 border border-white/10 h-full">
                <div className="text-center lg:text-left">
                  <h2 className="text-white text-3xl font-bold uppercase mb-4 tracking-wider">
                    <span className="text-white">HARMONY</span>{" "}
                    <span className="text-red-500">HUB</span>
                  </h2>
                  <p className="text-gray-300 uppercase text-sm mb-6 leading-relaxed">
                    HARMONY HUB GEUVARRA'S LIGHT AND SOUND
                  </p>
                  <div className="text-gray-300 uppercase text-sm space-y-2">
                    <p className="flex items-center justify-center lg:justify-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-3"></span>
                      SANTOL, BOAC, MARINDUQUE, PHILIPPINE
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4 - Follow Us & Contact */}
            <div className="space-y-8">
              <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/10">
                <h3 className="text-white text-xl font-bold uppercase mb-6 tracking-wider border-b border-white/20 pb-2">
                  FOLLOW US
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer shadow-lg">
                    <span className="text-white text-xl font-bold">f</span>
                  </div>
                  <div className="text-gray-300">
                    <p className="text-sm uppercase tracking-wider">Facebook</p>
                    <p className="text-xs text-gray-400">
                      Follow us for updates
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4">
                  <p className="text-white text-lg font-semibold text-center">
                    📞 09393775101
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Black Footer */}
      <div className="bg-gradient-to-r from-black to-gray-900 py-8">
        <div className="max-w-7xl mx-auto text-center px-4">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <p className="text-white uppercase text-sm md:text-base tracking-wider leading-relaxed">
              HARMONY HUB GEUVARRA'S LIGHT AND SOUND, SANTOL, BOAC, MARINDUQUE,
              PHILIPPINE 09393775101
            </p>
            <div className="w-32 h-0.5 bg-red-500 mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
