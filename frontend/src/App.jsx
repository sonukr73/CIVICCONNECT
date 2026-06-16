import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import LanguageSelect from "./pages/LanguageSelect";
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
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
