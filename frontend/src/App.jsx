import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import TrackComplaint from "./pages/TrackComplaint";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LanguageSelect from "./pages/LanguageSelect";
import ContactUs from "./pages/ContactUs";
import DesignatedOfficer from "./pages/DesignatedOfficer";
import SiteMap from "./pages/SiteMap";
import AdminDashboard from "./pages/AdminDashboard";
import { useLanguage } from "./LanguageContext";

// This replaces the default Vite App component.
function App() {
  const { language } = useLanguage();

  // If language hasn't been set, intercept all routes!
  if (!language) {
    return <LanguageSelect />;
  }

  return (
    <BrowserRouter>
      {/* Navbar is outside of Routes so it renders on every page */}
      <Navbar />
      
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/track-complaint" element={<TrackComplaint />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/designated-officer" element={<DesignatedOfficer />} />
          <Route path="/site-map" element={<SiteMap />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
