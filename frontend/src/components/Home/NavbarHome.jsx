import { useNavigate } from "react-router-dom";
import { useState } from "react";

const NavbarHome = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Close mobile menu after clicking a link
    setIsMenuOpen(false);
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <div className="flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold">
            <span className="text-white">HARMONY</span>{" "}
            <span className="text-red-500 no-underline">HUB</span>
          </h1>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, "home")}
            className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer"
          >
            HOME
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, "about")}
            className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer"
          >
            ABOUT
          </a>
          <a
            href="#service"
            onClick={(e) => handleNavClick(e, "service")}
            className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer"
          >
            SERVICE
          </a>
          <a
            href="#gallery"
            onClick={(e) => handleNavClick(e, "gallery")}
            className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer"
          >
            GALLERY
          </a>
          <a
            href="#contact"
            onClick={(e) => handleNavClick(e, "contact")}
            className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer"
          >
            CONTACT
          </a>
        </nav>

        {/* Desktop Login Button */}
        <div className="hidden md:block flex-shrink-0">
          <button
            onClick={handleLoginClick}
            className="bg-black/30 backdrop-blur-md border border-white/20 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300 hover:bg-black/50 hover:border-white/40 shadow-lg"
          >
            LOGIN
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-4">
          <button
            onClick={handleLoginClick}
            className="bg-black/30 backdrop-blur-md border border-white/20 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:bg-black/50 hover:border-white/40 shadow-lg text-sm"
          >
            LOGIN
          </button>

          {/* Burger Menu Button */}
          <button
            onClick={toggleMenu}
            className="text-white p-2 rounded-lg hover:bg-black/20 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 ${
                  isMenuOpen ? "rotate-45 translate-y-1" : ""
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${
                  isMenuOpen ? "opacity-0" : ""
                }`}
              ></span>
              <span
                className={`block w-5 h-0.5 bg-white transition-all duration-300 mt-1 ${
                  isMenuOpen ? "-rotate-45 -translate-y-1" : ""
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        {/* Mobile Menu Content */}
        <div
          className={`absolute top-20 left-4 right-4 bg-black/90 backdrop-blur-md rounded-lg p-6 transition-transform duration-300 ${
            isMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col space-y-4">
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, "home")}
              className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer py-2 border-b border-white/10"
            >
              HOME
            </a>
            <a
              href="#about"
              onClick={(e) => handleNavClick(e, "about")}
              className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer py-2 border-b border-white/10"
            >
              ABOUT
            </a>
            <a
              href="#service"
              onClick={(e) => handleNavClick(e, "service")}
              className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer py-2 border-b border-white/10"
            >
              SERVICE
            </a>
            <a
              href="#gallery"
              onClick={(e) => handleNavClick(e, "gallery")}
              className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer py-2 border-b border-white/10"
            >
              GALLERY
            </a>
            <a
              href="#contact"
              onClick={(e) => handleNavClick(e, "contact")}
              className="text-white hover:text-gray-300 transition-colors duration-200 font-semibold uppercase tracking-wide cursor-pointer py-2"
            >
              CONTACT
            </a>
          </nav>
        </div>
      </div>

      {/* Main Navbar Container with Frosted Glass Effect */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-md rounded-full mx-4 -z-10"></div>
    </div>
  );
};

export default NavbarHome;
