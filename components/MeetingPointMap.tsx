"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  name: string;
}

export function MeetingPointMap({ lat, lng, name }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    const icon = L.divIcon({
      className: "pacers-marker",
      html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:var(--primary);border:3px solid var(--surface);box-shadow:0 2px 10px rgba(0,0,0,0.3);"></span>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    L.marker([lat, lng], { icon, title: name })
      .bindPopup(`<strong>${name}</strong>`)
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, name]);

  return (
    <div
      ref={containerRef}
      className="w-full h-56 md:h-72 bg-surface-muted"
      aria-label={`Map centered on ${name}`}
    />
  );
}
