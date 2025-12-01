const Service = () => {
  const services = [
    {
      id: 1,
      title: "LIGHTING EQUIPMENT",
      image: "/images/lighting-equipment.webp",
      description:
        "Professional stage lighting with moving head lights and dramatic effects",
    },
    {
      id: 2,
      title: "SOUND SYSTEM",
      image: "/images/sound-system.webp",
      description:
        "High-quality audio mixing consoles and professional sound equipment",
    },
    {
      id: 3,
      title: "STAGE AND TRUSSER",
      image: "/images/stage-trusser.jpg",
      description:
        "Complete stage setup with metal truss structures and professional staging",
    },
    {
      id: 4,
      title: "LED WALL",
      image: "/images/led-wall.jpg",
      description:
        "Large LED screens and vertical panels for stunning visual displays",
    },
    {
      id: 5,
      title: "BAND SETUP",
      image: "/images/band-setup.jpg",
      description:
        "Complete band equipment including drums, keyboards, and microphones",
    },
    {
      id: 6,
      title: "FREELANCER MUSICIAN ARTIST",
      image: "/images/freelancer-musician.jpg",
      description: "Professional musicians and artists for your events",
    },
  ];

  return (
    <section className="bg-gradient-to-b from-black via-gray-900 to-black py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <p className="text-xs tracking-[0.3em] text-orange-400 uppercase mb-3">
            Our Services
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Everything Your Event Needs
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            From concert‑grade sound systems to full band setups, Harmony Hub brings
            professional equipment and talent together in one place.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service) => (
            <article
              key={service.id}
              className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer border border-gray-800 bg-gray-900/70 shadow-lg shadow-black/40 hover:border-orange-500/70 hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${service.image})`,
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-all duration-300" />
              </div>

              {/* Text Overlay */}
              <div className="relative z-10 flex flex-col justify-end h-full p-6">
                <h3 className="text-white text-2xl font-semibold uppercase leading-tight mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {service.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Service;
