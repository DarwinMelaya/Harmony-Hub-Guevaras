const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      image: "/images/gallery/engweek-event.webp",
      description:
        "Indoor stage setup with illuminated 'ENGWEEK' letters and professional lighting",
    },
    {
      id: 2,
      image: "/images/gallery/guevarra-presentation.webp",
      description:
        "Formal event with speaker and LED screen displaying 'GUEVARRA'",
    },
    {
      id: 3,
      image: "/images/gallery/dancing-event.webp",
      description: "Energetic outdoor social event with people dancing",
    },
    {
      id: 4,
      image: "/images/gallery/technical-crew.webp",
      description: "Event technicians operating sound and video equipment",
    },
    {
      id: 5,
      image: "/images/gallery/control-panel.webp",
      description:
        "Close-up of sound/lighting control panel with illuminated buttons",
    },
    {
      id: 6,
      image: "/images/gallery/live-band.webp",
      description:
        "Live band performance with female vocalist and stage decorations",
    },
  ];

  return (
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            GALLERY
          </h1>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((item) => (
            <div
              key={item.id}
              className="relative h-80 rounded-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:scale-105 shadow-lg"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.description}
                className="w-full h-full object-cover"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                <p className="text-white text-center text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Optional: Add a subtle border on hover */}
              <div className="absolute inset-0 border-2 border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Gallery;
