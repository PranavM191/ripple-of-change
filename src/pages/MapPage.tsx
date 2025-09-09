// src/pages/MapPage.tsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import { delhiNCRHotspots } from "../lib/hotspots";

// Build heat tuples and per‑point colors
function buildHeatData() {
  // leaflet.heat supports [lat, lng, intensity] tuples and a global gradient,
  // but not per-point colors. We’ll set intensity by severity and define a
  // global gradient mapping intensity→color (0.3=yellow, 0.6=orange, 1.0=red).
  const tuples: [number, number, number][] = delhiNCRHotspots.map((h) => {
    const intensity =
      h.severity === "high" ? 1.0 : h.severity === "medium" ? 0.6 : 0.3;
    return [h.lat, h.lng, intensity];
  });
  return tuples;
}

function HeatLayer() {
  const map = useMap();

  useEffect(() => {
    const points = buildHeatData();

    const layer = (L as any)
      .heatLayer(points, {
        // Keep heat visible across zooms
        // Set maxZoom low so intensity doesn’t fade when zooming in
        maxZoom: 25,
        // Make the weighting independent of zoom by disabling the built‑in scaling:
        // leaflet.heat scales radius with zoom; using a relatively large radius
        // and low blur keeps it visible when zooming.
        radius: 30,
        blur: 12,
        minOpacity: 0.4,
        // Map intensity to colors: low=yellow, mid=orange, high=red
        gradient: {
          0.3: "#ffff00", // yellow
          0.6: "#ffa500", // orange
          1.0: "#ff0000", // red
        },
      })
      .addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map]);

  return null;
}

export default function MapPage() {
  const center: [number, number] = [28.6139, 77.209]; // Delhi

  return (
    <div style={{ height: "70vh", width: "100%" }}>
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <HeatLayer />
        {/* No markers */}
      </MapContainer>
    </div>
  );
}
