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
    <section className="bg-gradient-to-b from-black via-gray-900 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-orange-400 uppercase mb-3">
            Event Moments
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            A Glimpse Of Our Setups
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            From intimate gatherings to large‑scale productions, here&apos;s how
            Harmony Hub transforms venues into unforgettable experiences.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryImages.map((item) => (
            <article
              key={item.id}
              className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer border border-gray-800 bg-gray-900/70 shadow-lg shadow-black/40 hover:border-orange-500/70 hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.description}
                className="w-full h-full object-cover"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <p className="text-white text-sm md:text-base leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Subtle border accent */}
              <div className="absolute inset-0 border border-orange-500/0 group-hover:border-orange-500/70 transition-colors duration-300 rounded-2xl" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
