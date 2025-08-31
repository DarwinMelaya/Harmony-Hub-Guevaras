import Home from "../../components/Home/Home";
import NavbarHome from "../../components/Home/NavbarHome";
import About from "../../components/Home/About";
import Service from "../../components/Home/Service";
import Gallery from "../../components/Home/Gallery";
import Contact from "../../components/Home/Contact";

const HomePage = () => {
  return (
    <div className="text-center">
      <NavbarHome />
      <div id="home">
        <Home />
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
