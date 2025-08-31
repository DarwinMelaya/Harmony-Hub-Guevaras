const About = () => {
  return (
    <div className="min-h-screen bg-[#282c34] flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto text-center">
        {/* Main Heading */}
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8 uppercase">
          ABOUT US
        </h1>

        {/* First Sub-heading */}
        <h2 className="text-2xl md:text-3xl text-white mb-6 uppercase font-normal">
          WELCOME TO HARMONY HUB
        </h2>

        {/* Second Sub-heading */}
        <h3 className="text-2xl md:text-3xl text-white mb-8 uppercase font-normal">
          GUEVARRA'S SERVICES RESERVATION
        </h3>

        {/* First Paragraph */}
        <p className="text-lg md:text-xl text-white mb-8 leading-relaxed max-w-3xl mx-auto">
          AT HARMONY HUB, WE BELIEVE IN MAKING EVERY EVENT SEAMLESS AND
          STRESS-FREE. AS THE OFFICIAL SERVICE MANAGEMENT PLATFORM FOR
          GUEVARRA'S SERVICES, HARMONY HUB WAS DESIGNED TO SIMPLIFY HOW CLIENTS
          BOOK SERVICES, MANAGE RESERVATIONS, AND PROCESS PAYMENTS—ALL IN ONE
          UNIFIED SYSTEM.
        </p>

        {/* Second Paragraph */}
        <p className="text-lg md:text-xl text-white leading-relaxed max-w-3xl mx-auto">
          ROOTED IN THE VALUES OF RELIABILITY, PROFESSIONALISM, AND EFFICIENCY,
          HARMONY HUB HELPS BRING HARMONY TO EVERY OCCASION. WHETHER YOU'RE
          PLANNING A BIRTHDAY, WEDDING, OR CORPORATE EVENT, OUR PLATFORM ENSURES
          YOU CAN EASILY RESERVE TRUSTED SERVICES—FROM SOUND SYSTEMS AND
          CATERING TO EVENT HOSTS AND MORE—WITHOUT THE HASSLE.
        </p>
      </div>
    </div>
  );
};

export default About;
