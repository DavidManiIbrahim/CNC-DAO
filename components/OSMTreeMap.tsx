"use client"

import { useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { type RegisteredTree } from "@/lib/registeredTrees"
import { useAllTrees } from "@/lib/useTrees"

export type { RegisteredTree }

const statusColor: Record<RegisteredTree["status"], string> = {
  verified: "#22c55e",
  minted: "#a78bfa",
  pending: "#f5a800",
}

export default function OSMTreeMap({
  trees,
  className = "",
}: {
  trees?: RegisteredTree[]
  className?: string
}) {
  const [satelliteView, setSatelliteView] = useState<RegisteredTree | null>(null)
  const dbLiveTrees = useAllTrees()
  const liveTrees = trees ?? dbLiveTrees

  const center: [number, number] =
    liveTrees.length > 0 ? [liveTrees[0].lat, liveTrees[0].lng] : [9.082, 8.6753]

  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={liveTrees.length > 1 ? 5 : 8}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "#0b0a12" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {liveTrees.map((t) => (
          <CircleMarker
            key={t.id}
            center={[t.lat, t.lng]}
            radius={9}
            pathOptions={{
              color: statusColor[t.status],
              fillColor: statusColor[t.status],
              fillOpacity: 0.85,
              weight: 2,
            }}
            eventHandlers={{ click: () => setSatelliteView(t) }}
          >
            <Popup>
              <div style={{ fontFamily: "sans-serif", fontSize: 13 }}>
                <strong>{t.name}</strong>
                <br />
                {t.species} — {t.location}
                <br />
                <span style={{ textTransform: "capitalize" }}>{t.status}</span>
                <br />
                <button
                  onClick={() => setSatelliteView(t)}
                  style={{
                    marginTop: 6,
                    background: "#1db954",
                    color: "white",
                    border: "none",
                    borderRadius: 6,
                    padding: "4px 10px",
                    fontSize: 12,
                    cursor: "pointer",
                  }}
                >
                  View satellite close-up
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {satelliteView && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0b0a12]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-bold text-white">{satelliteView.name}</div>
                <div className="text-xs text-white/50">{satelliteView.location}</div>
              </div>
              <button
                onClick={() => setSatelliteView(null)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/20"
              >
                Close
              </button>
            </div>
            <div className="h-[360px] w-full">
              <MapContainer
                key={satelliteView.id}
                center={[satelliteView.lat, satelliteView.lng]}
                zoom={18}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                {/* Free satellite imagery, no API key required. Higher-
                    resolution alternatives (Sentinel-2, Google Earth Engine)
                    both require API keys/auth setup — worth swapping in once
                    the backend team has those credentials. */}
                <TileLayer
                  attribution="Tiles &copy; Esri"
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <CircleMarker
                  center={[satelliteView.lat, satelliteView.lng]}
                  radius={8}
                  pathOptions={{ color: "#1db954", fillColor: "#1db954", fillOpacity: 0.6, weight: 2 }}
                />
              </MapContainer>
            </div>
            <div className="border-t border-white/10 px-4 py-2 text-center text-[10px] text-white/30">
              Satellite imagery © Esri — resolution varies by region
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
