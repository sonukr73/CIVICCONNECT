import { useLanguage } from "../LanguageContext";

const LanguageSelect = () => {
  const { changeLanguage } = useLanguage();

  return (
    <div className="page-center" style={{ flexDirection: "column" }}>
      <h1 style={{ marginBottom: "10px", color: "#2c3e50" }}>Select Your Language</h1>
      <h2 style={{ marginBottom: "30px", color: "#7f8c8d" }}>अपनी भाषा चुनें</h2>

      <div style={{ display: "flex", gap: "20px" }}>
        <button 
          className="btn" 
          style={{ width: "200px", padding: "15px", fontSize: "18px" }} 
          onClick={() => changeLanguage("en")}
        >
          English
        </button>
        <button 
          className="btn" 
          style={{ width: "200px", padding: "15px", fontSize: "18px" }} 
          onClick={() => changeLanguage("hi")}
        >
          हिन्दी
        </button>
      </div>
    </div>
  );
};

export default LanguageSelect;
