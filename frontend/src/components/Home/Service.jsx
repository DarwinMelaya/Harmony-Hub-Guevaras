const Service = () => {
  const services = [
    {
      id: 1,
      title: "LIGHTING EQUIPMENT",
      image: "/images/lighting-equipment.jpg",
      description:
        "Professional stage lighting with moving head lights and dramatic effects",
    },
    {
      id: 2,
      title: "SOUND SYSTEM",
      image: "/images/sound-system.jpg",
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
    <div className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Main Heading */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mb-4">
            SERVICES
          </h1>
          <div className="w-24 h-1 bg-blue-800 mx-auto"></div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div
              key={service.id}
              className="relative h-80 rounded-lg overflow-hidden group cursor-pointer transform transition-transform duration-300 hover:scale-105"
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: `url(${service.image})`,
                }}
              >
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
              </div>

              {/* Text Overlay */}
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <h3 className="text-white text-2xl md:text-3xl font-bold text-center uppercase leading-tight">
                  {service.title}
                </h3>
              </div>

              {/* Hover Effect - Description */}
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-lg text-center">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Service;
