import Home from "../../components/Home/Home";
import NavbarHome from "../../components/Home/NavbarHome";
import About from "../../components/Home/About";
import Service from "../../components/Home/Service";
import Gallery from "../../components/Home/Gallery";
import CalendarHome from "../../components/Home/CalendarHome";
import Contact from "../../components/Home/Contact";
import Feedback from "../../components/Home/Feedback";

const HomePage = () => {
  return (
    <div className="text-center">
      <NavbarHome />
      <div id="home">
        <Home />
      </div>
      <div
        id="calendar"
        className="bg-gradient-to-b from-gray-900 to-black py-16 px-4"
      >
        <div className="max-w-6xl mx-auto">
          <CalendarHome />
        </div>
      </div>
      <div id="feedback">
        <Feedback />
      </div>
      <div id="about">
        <About />
      </div>
      <div id="service">
        <Service />
      </div>
      <div id="gallery">
        <Gallery />
      </div>

      <div id="contact">
        <Contact />
      </div>
    </div>
  );
};

export default HomePage;
