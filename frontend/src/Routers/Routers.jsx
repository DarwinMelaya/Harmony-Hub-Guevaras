import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login, Home, Signup } from "../pages";

export const Routers = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
};
