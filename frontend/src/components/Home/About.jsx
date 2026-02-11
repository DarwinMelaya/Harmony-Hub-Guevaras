const About = () => {
  return (
    <section className="bg-gradient-to-b from-black via-gray-900 to-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] text-orange-400 uppercase mb-3">
            About Harmony Hub
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Bringing Harmony To Every Event
          </h1>
          <p className="text-sm md:text-base text-gray-400 max-w-2xl mx-auto">
            The official service management platform for Guevarra&apos;s Services,
            built to make reservations, coordination, and payments feel effortless.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg shadow-black/40">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Seamless Event Management
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              At Harmony Hub, we believe in making every event seamless and stress‑free.
              As the official service management platform for Guevarra&apos;s Services,
              Harmony Hub was designed to simplify how clients book services, manage
              reservations, and process payments—all in one unified, easy‑to‑use system.
            </p>
          </article>

          <article className="bg-gray-900/70 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-lg shadow-black/40">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4">
              Built For Memorable Occasions
            </h2>
            <p className="text-sm md:text-base text-gray-300 leading-relaxed">
              Rooted in reliability, professionalism, and efficiency, Harmony Hub helps
              bring harmony to every occasion. Whether you&apos;re planning a birthday,
              wedding, or corporate event, our platform connects you with trusted
              services—from sound systems and lighting to performers and more—without
              the hassle.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
};

export default About;
