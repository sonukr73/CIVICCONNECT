import { useEffect, useRef } from "react";

export default function LeafletMap({ lat, lng, onChangeLocation, zoom = 14, height = "200px", readOnly = false }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!window.L || !mapContainerRef.current) return;

    // Center coordinates
    const center = [lat || 28.6139, lng || 77.209];

    // Initialize map
    const map = window.L.map(mapContainerRef.current).setView(center, zoom);
    mapRef.current = map;

    // Load OpenStreetMap tiles
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom SVG Pin Icon
    const pinIcon = window.L.divIcon({
      html: `<svg width="32" height="32" viewBox="0 0 24 24" fill="#ef4444" stroke="#ffffff" stroke-width="2" style="filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
      className: "custom-leaflet-svg-pin",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });

    // Create marker
    const marker = window.L.marker(center, { icon: pinIcon }).addTo(map);
    markerRef.current = marker;

    // Add popup link to Google Maps
    marker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; text-align: center;">
        <strong>Captured Coordinates</strong><br/>
        Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}<br/>
        <a href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" target="_blank" style="display: inline-block; margin-top: 6px; color: #3b82f6; text-decoration: underline; font-weight: bold;">
          Open in Google Maps ↗
        </a>
      </div>
    `).openPopup();

    // Map Click Handler for editing coordinates
    if (!readOnly && onChangeLocation) {
      map.on("click", (e) => {
        const newLat = e.latlng.lat;
        const newLng = e.latlng.lng;
        onChangeLocation({ lat: newLat, lng: newLng });
      });
    }

    // Resize map when it is rendered
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
    };
  }, [lat, lng, readOnly, zoom]);

  const handleOpenGoogleMaps = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
  };

  return (
    <div style={{ position: "relative", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1.5px solid #cbd5e1" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height }} />
      <button
        type="button"
        onClick={handleOpenGoogleMaps}
        style={{
          position: "absolute",
          bottom: "10px",
          right: "10px",
          background: "white",
          color: "#334155",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          padding: "5px 10px",
          fontSize: "11px",
          fontWeight: "700",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          gap: "4px"
        }}
      >
        🗺️ Google Maps ↗
      </button>
    </div>
  );
}
