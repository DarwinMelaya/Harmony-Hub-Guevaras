const Contact = () => {
  return (
    <section className="w-full bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Header */}
      <div className="py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs tracking-[0.3em] text-orange-400 uppercase mb-3">
            Get In Touch
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Let&apos;s Light Up Your Next Event
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            Talk to Harmony Hub Guevarra&apos;s Light and Sound for bookings, inquiries,
            and custom event setups across Marinduque.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1 - Services */}
            <div className="space-y-6">
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-800 shadow-lg shadow-black/40">
                <h3 className="text-white text-sm font-semibold uppercase mb-4 tracking-[0.2em]">
                  Rental Services
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm uppercase">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Lighting
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Sound System
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Stage &amp; Trusser
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Band Equipment
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    LED Wall
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-800 shadow-lg shadow-black/40">
                <h3 className="text-white text-sm font-semibold uppercase mb-4 tracking-[0.2em]">
                  Talent
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm uppercase">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Freelancer
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Musician / Artist
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 2 - Event Types & Info */}
            <div className="space-y-6">
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-800 shadow-lg shadow-black/40">
                <h3 className="text-white text-sm font-semibold uppercase mb-4 tracking-[0.2em]">
                  Events We Support
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm uppercase">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Wedding
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Concert
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Corporate
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Birthday
                  </li>
                </ul>
              </div>

              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-800 shadow-lg shadow-black/40">
                <h3 className="text-white text-sm font-semibold uppercase mb-4 tracking-[0.2em]">
                  About Harmony Hub
                </h3>
                <ul className="space-y-2 text-gray-300 text-sm uppercase">
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Testimonial
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Our Team
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    Blog
                  </li>
                  <li className="hover:text-white transition-colors duration-200 cursor-pointer">
                    FAQs
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3 - Company Information */}
            <div className="lg:col-span-1">
              <div className="bg-gray-900/70 rounded-2xl p-7 border border-gray-800 shadow-lg shadow-black/40 h-full">
                <div className="text-center lg:text-left">
                  <h2 className="text-white text-2xl md:text-3xl font-bold uppercase mb-3 tracking-[0.2em]">
                    <span className="text-white">Harmony</span>{" "}
                    <span className="text-orange-400">Hub</span>
                  </h2>
                  <p className="text-gray-300 uppercase text-xs md:text-sm mb-5 leading-relaxed">
                    Harmony Hub Guevarra&apos;s Light and Sound
                  </p>
                  <div className="text-gray-300 uppercase text-xs md:text-sm space-y-2">
                    <p className="flex items-center justify-center lg:justify-start">
                      <span className="w-2 h-2 bg-orange-400 rounded-full mr-3" />
                      Santol, Boac, Marinduque, Philippines
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 4 - Follow Us & Contact */}
            <div className="space-y-6">
              <div className="bg-gray-900/70 rounded-2xl p-6 border border-gray-800 shadow-lg shadow-black/40">
                <h3 className="text-white text-sm font-semibold uppercase mb-4 tracking-[0.2em]">
                  Follow Us
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-200 cursor-pointer shadow-lg shadow-black/40">
                    <span className="text-white text-lg font-bold">f</span>
                  </div>
                  <div className="text-gray-300">
                    <p className="text-xs uppercase tracking-[0.2em]">Facebook</p>
                    <p className="text-[11px] text-gray-400">
                      Follow us for setup previews and event highlights.
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-4 shadow-md shadow-orange-500/40">
                  <p className="text-white text-base md:text-lg font-semibold text-center">
                    📞 0939 377 5101
                  </p>
                  <p className="text-xs text-white/80 text-center mt-1 uppercase tracking-[0.15em]">
                    Call Us For Bookings &amp; Inquiries
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
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6 border border-gray-800">
            <p className="text-white uppercase text-xs md:text-sm tracking-[0.2em] leading-relaxed">
              Harmony Hub Guevarra&apos;s Light and Sound · Santol, Boac, Marinduque,
              Philippines · 0939 377 5101
            </p>
            <div className="w-24 h-0.5 bg-orange-400 mx-auto mt-4" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
