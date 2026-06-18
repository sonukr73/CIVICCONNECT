import { useState, useEffect, useRef } from "react";
import axios from "axios";
import InputBox from "../components/InputBox";
import { useLanguage } from "../LanguageContext";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const containerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "8px",
  marginBottom: "15px"
};

const defaultCenter = {
  lat: 20.5937, // Default to India center
  lng: 78.9629
};

const Dashboard = () => {
  const { t } = useLanguage();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Roads");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setIsCameraOpen(true);
    setPreviewImage(null);
    setImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied or unavailable", err);
      setError("Camera access denied or unavailable.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dateString = new Date().toLocaleString();
      const lat = markerPosition.lat.toFixed(6);
      const lng = markerPosition.lng.toFixed(6);
      const textLine1 = `Date: ${dateString}`;
      const textLine2 = `Lat: ${lat}, Lng: ${lng}`;
      const textLine3 = `Loc: ${location.substring(0, 60)}`;

      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(10, canvas.height - 90, canvas.width - 20, 80);

      ctx.font = "16px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(textLine1, 20, canvas.height - 65);
      ctx.fillText(textLine2, 20, canvas.height - 40);
      ctx.fillText(textLine3, 20, canvas.height - 15);

      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setPreviewImage(dataUrl);

      canvas.toBlob((blob) => {
        const file = new File([blob], `complaint_${Date.now()}.jpg`, { type: "image/jpeg" });
        setImage(file);
      }, "image/jpeg", 0.9);

      stopCamera();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Maps state
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [markerPosition, setMarkerPosition] = useState(defaultCenter);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Fetch all complaints on mount
  const fetchComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/complaints`);
      setComplaints(res.data.complaints);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Reverse Geocoding helper
  const reverseGeocode = async (lat, lng) => {
    try {
      setLocation("Fetching location...");
      const res = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
        params: {
          latlng: `${lat},${lng}`,
          key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        }
      });
      if (res.data.results && res.data.results.length > 0) {
        setLocation(res.data.results[0].formatted_address);
      } else {
        setLocation(`${lat}, ${lng}`);
      }
    } catch (err) {
      console.error(err);
      setLocation("");
    }
  };

  useEffect(() => {
    fetchComplaints();

    // Trigger auto-location if logged in
    if (user && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setMapCenter({ lat, lng });
          setMarkerPosition({ lat, lng });
          reverseGeocode(lat, lng);
        },
        () => {
          console.warn("User denied geolocation.");
        }
      );
    }
  }, []);

  const handleMapClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarkerPosition({ lat, lng });
    reverseGeocode(lat, lng);
  };

  // Handle Submit
  const handleReportIssue = async (e) => {
    e.preventDefault();
    if (!title || !description || !location) return setError(t("error_fill_fields"));
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!user) {
      setError("You must be logged in to report an issue.");
      return;
    }

    try {
      const form = new FormData();
      form.append("title", title);
      form.append("description", description);
      form.append("category", category);
      form.append("location", location);
      form.append("userId", user._id);
      
      if (image) {
        form.append("image", image);
      }

      form.append("lat", markerPosition.lat);
      form.append("lng", markerPosition.lng);

      await submitForm(form);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
      setIsSubmitting(false);
    }
  };

  const submitForm = async (form) => {
    try {
      // Temporary Bypass for frontend testing since backend isn't running
      const newComplaint = {
        _id: Math.random().toString(36).substring(7),
        title,
        description,
        category,
        location,
        image: previewImage,
        user: { name: user?.name || "Test User" },
        status: "Pending",
        createdAt: new Date().toISOString()
      };
      
      setComplaints([newComplaint, ...complaints]);
      setSuccess("Complaint submitted successfully!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("Roads");
      setLocation("");
      setImage(null);
      setPreviewImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ marginTop: "30px", marginBottom: "50px" }}>
      
      {/* Report Form (Only visible if logged in) */}
      {user ? (
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto 30px" }}>
          <h2>{t("dash_report_title")}</h2>
          {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}
          {success && <p style={{ color: "green", marginBottom: "10px" }}>{success}</p>}
          
          <form onSubmit={handleReportIssue}>
            <InputBox label={t("dash_title_label")} value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("dash_title_placeholder")} />
            
            <div className="input-group">
              <label>{t("dash_desc_label")}</label>
              <textarea 
                className="input-box" 
                rows="3" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                required 
              />
            </div>

            <div className="input-group">
              <label>{t("dash_cat_label")}</label>
              <select className="input-box" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Roads">{t("dash_cat_roads")}</option>
                <option value="Water Supply">{t("dash_cat_water")}</option>
                <option value="Electricity">{t("dash_cat_elec")}</option>
                <option value="Sanitation">{t("dash_cat_sanitation")}</option>
                <option value="Other">{t("dash_cat_other")}</option>
              </select>
            </div>

            <InputBox label={t("dash_loc_label")} value={location} onChange={(e) => setLocation(e.target.value)} placeholder={t("dash_loc_placeholder")} />

            {/* Google Maps Preview */}
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={14}
                onClick={handleMapClick}
              >
                <Marker position={markerPosition} />
              </GoogleMap>
            ) : (
              <p style={{ textAlign: "center", color: "#666" }}>Loading Map...</p>
            )}

            <div className="input-group">
              <label>{t("dash_img_label")} (Camera Only)</label>
              
              {!isCameraOpen && !previewImage && (
                <button type="button" className="btn" style={{ backgroundColor: "#27ae60" }} onClick={startCamera}>
                  Open Camera
                </button>
              )}

              {isCameraOpen && (
                <div style={{ position: "relative", marginBottom: "15px", marginTop: "10px" }}>
                  <video ref={videoRef} autoPlay playsInline style={{ width: "100%", borderRadius: "8px", backgroundColor: "#000" }}></video>
                  <canvas ref={canvasRef} style={{ display: "none" }}></canvas>
                  <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                    <button type="button" className="btn" style={{ flex: 1 }} onClick={captureImage}>
                      Capture Image
                    </button>
                    <button type="button" className="btn" style={{ flex: 1, backgroundColor: "#e74c3c" }} onClick={stopCamera}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {previewImage && (
                <div style={{ position: "relative", marginBottom: "15px", marginTop: "10px" }}>
                  <img src={previewImage} alt="Captured preview" style={{ width: "100%", borderRadius: "8px" }} />
                  <button type="button" className="btn" style={{ marginTop: "10px", backgroundColor: "#f39c12" }} onClick={startCamera}>
                    Retake Image
                  </button>
                </div>
              )}
            </div>

            <button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting ? t("dash_submitting_btn") : t("dash_submit_btn")}
            </button>
            <p style={{fontSize: "12px", marginTop: "10px", color: "#555"}}>{t("dash_gps_note")}</p>
          </form>
        </div>
      ) : (
        <div className="card" style={{ maxWidth: "600px", margin: "0 auto 30px", textAlign: "center" }}>
          <h2>{t("dash_must_login_title")}</h2>
          <p>{t("dash_must_login_desc")}</p>
        </div>
      )}

      {/* Complaints List */}
      <h2>{t("dash_recent_title")}</h2>
      {loading ? (
        <p style={{ textAlign: "center", padding: "20px" }}>{t("dash_loading_complaints")}</p>
      ) : complaints.length === 0 ? (
        <div className="card" style={{ maxWidth: "100%", textAlign: "center", marginTop: "20px" }}>
          <p style={{ color: "#777" }}>{t("dash_no_complaints")}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "20px" }}>
          {complaints.map((c) => (
            <div key={c._id} className="card" style={{ maxWidth: "100%", display: "flex", gap: "20px" }}>
              {c.image && (
                 <img src={c.image} alt="Issue" style={{ width: "150px", height: "150px", objectFit: "cover", borderRadius: "8px" }} />
              )}
              <div style={{ flex: 1 }}>
                <h3>{c.title} <span style={{ fontSize: "14px", color: "white", padding: "3px 8px", borderRadius: "12px", backgroundColor: c.status === 'Resolved' ? 'green' : c.status === 'Pending' ? 'orange' : 'blue' }}>{c.status}</span></h3>
                <p style={{ color: "#555", marginTop: "5px" }}><strong>{t("dash_cat_prefix")}</strong> {c.category} | <strong>{t("dash_loc_prefix")}</strong> {c.location}</p>
                <p style={{ marginTop: "10px" }}>{c.description}</p>
                <p style={{ marginTop: "10px", fontSize: "13px", color: "#888" }}>{t("dash_reported_by")} {c.user?.name} on {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
