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
    <div className={`relative bg-card ${className}`}>
      <MapContainer
        center={center}
        zoom={liveTrees.length > 1 ? 5 : 8}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", background: "transparent" }}
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
              <div className="p-1 font-sans text-xs text-black">
                <div className="font-bold text-sm text-gray-900">{t.name}</div>
                <div className="text-gray-600 font-medium">{t.species} &bull; {t.location}</div>
                <div className="text-gray-500 font-mono text-[10px] mt-0.5">
                  {t.lat.toFixed(4)}, {t.lng.toFixed(4)}
                </div>
                <button
                  onClick={() => setSatelliteView(t)}
                  className="mt-2 rounded-lg bg-[#1db954] px-2.5 py-1 text-[11px] font-bold text-black hover:bg-[#1db954]/90"
                >
                  View satellite close-up
                </button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {satelliteView && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-overlay shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-sm font-bold text-foreground">{satelliteView.name}</div>
                <div className="text-xs text-muted-foreground">{satelliteView.location}</div>
              </div>
              <button
                onClick={() => setSatelliteView(null)}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
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
            <div className="border-t border-border px-4 py-2 text-center text-[10px] text-muted-foreground">
              Satellite imagery &copy; Esri &bull; Resolution varies by region
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
