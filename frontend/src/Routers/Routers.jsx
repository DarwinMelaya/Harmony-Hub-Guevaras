import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login, Home } from "../pages";

export const Routers = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};
