"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  routes: Array<Array<[number, number]>>;
  center: [number, number];
  masked?: boolean;
}

export function FootprintMap({ routes, center, masked }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [center[1], center[0]],
      zoom: 12,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    for (const r of routes) {
      const latlngs: L.LatLngExpression[] = r.map(([lng, lat]) => [lat, lng]);
      L.polyline(latlngs, {
        color: "#10b981",
        weight: 6,
        opacity: 0.2,
        lineCap: "round",
      }).addTo(map);
      L.polyline(latlngs, {
        color: "#047857",
        weight: 2.5,
        opacity: 0.9,
        lineCap: "round",
      }).addTo(map);
    }

    if (masked) {
      L.circle([center[1], center[0]], {
        radius: 400,
        color: "#047857",
        weight: 1.5,
        opacity: 0.5,
        fillColor: "#000000",
        fillOpacity: 0.1,
        dashArray: "4 4",
      }).addTo(map);
    }

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [routes, center, masked]);

  return (
    <div
      ref={containerRef}
      className="w-full h-80 md:h-[28rem] bg-surface-muted"
      aria-label="Your running footprint"
    />
  );
}
