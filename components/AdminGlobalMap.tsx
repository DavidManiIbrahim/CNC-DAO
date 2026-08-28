"use client"

import { useState, useMemo, useEffect } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"
import {
  Search,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  Eye,
  Layers,
} from "lucide-react"

type TreeStatus = "verified" | "minted" | "pending"

const statusColor: Record<TreeStatus, string> = {
  verified: "#1db954",
  minted: "#a78bfa",
  pending: "#f0a830",
}

// Controller component to smoothly pan/zoom map to selected tree
function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (target) {
      map.flyTo(target, 12, { duration: 1.2 })
    }
  }, [target, map])
  return null
}

export default function AdminGlobalMap() {
  const user = useSessionUser()
  const verifierId = user?.userId
  const isVerifier = user?.role === "nature_hero" || user?.role === "admin"

  const dbTrees = useQuery(api.trees.listAll) ?? []
  const updateTreeStatus = useMutation(api.trees.updateStatus)

  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedTree, setSelectedTree] = useState<any | null>(null)
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null)
  const [satelliteView, setSatelliteView] = useState<any | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [mapLayer, setMapLayer] = useState<"standard" | "satellite">("standard")

  // Filtered list
  const filteredTrees = useMemo(() => {
    return dbTrees.filter((t: any) => {
      if (activeFilter !== "all" && t.status !== activeFilter) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchName = t.name?.toLowerCase().includes(q)
        const matchSpecies = t.species?.toLowerCase().includes(q)
        const matchLocation = t.location?.toLowerCase().includes(q)
        const matchWallet = t.walletAddress?.toLowerCase().includes(q)
        return matchName || matchSpecies || matchLocation || matchWallet
      }
      return true
    })
  }, [dbTrees, activeFilter, search])

  // Counts
  const counts = {
    total: dbTrees.length,
    pending: dbTrees.filter((t: any) => t.status === "pending").length,
    verified: dbTrees.filter((t: any) => t.status === "verified").length,
    minted: dbTrees.filter((t: any) => t.status === "minted").length,
  }

  const mapCenter: [number, number] =
    dbTrees.length > 0 && typeof dbTrees[0].lat === "number"
      ? [dbTrees[0].lat, dbTrees[0].lng]
      : [9.082, 8.6753]

  function handleSelectTree(tree: any) {
    setSelectedTree(tree)
    if (typeof tree.lat === "number" && typeof tree.lng === "number") {
      setFlyTarget([tree.lat, tree.lng])
    }
  }

  async function handleStatusChange(treeId: string, status: "pending" | "verified" | "minted") {
    if (!verifierId) return
    setActionLoadingId(treeId)
    try {
      await updateTreeStatus({
        verifierId: verifierId as any,
        treeId: treeId as any,
        status,
      })
      if (selectedTree && selectedTree._id === treeId) {
        setSelectedTree({ ...selectedTree, status })
      }
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Stats */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            Admin Global Map & Registry
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Geographical registry mapping with live database coordinates and administrative controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMapLayer(mapLayer === "standard" ? "satellite" : "standard")}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#08080f] px-3.5 py-2 text-xs font-semibold text-white/70 transition-colors hover:border-white/20 hover:text-white"
          >
            <Layers className="h-4 w-4 text-[#1db954]" />
            <span>Layer: {mapLayer === "standard" ? "Street Map" : "Satellite"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setActiveFilter("all")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeFilter === "all"
              ? "border-[#1db954]/50 bg-[#1db954]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-white">
            {counts.total}
          </div>
          <div className="mt-1 text-xs text-white/50">Total in Database</div>
        </div>

        <div
          onClick={() => setActiveFilter("pending")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeFilter === "pending"
              ? "border-[#f0a830]/50 bg-[#f0a830]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#f0a830]">
              {counts.pending}
            </span>
            <Clock className="h-4 w-4 text-[#f0a830]/70" />
          </div>
          <div className="mt-1 text-xs text-white/50">Pending Review</div>
        </div>

        <div
          onClick={() => setActiveFilter("verified")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeFilter === "verified"
              ? "border-[#1db954]/50 bg-[#1db954]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
              {counts.verified}
            </span>
            <CheckCircle className="h-4 w-4 text-[#1db954]/70" />
          </div>
          <div className="mt-1 text-xs text-white/50">Verified</div>
        </div>

        <div
          onClick={() => setActiveFilter("minted")}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            activeFilter === "minted"
              ? "border-[#a78bfa]/50 bg-[#a78bfa]/10"
              : "border-white/10 bg-[#08080f] hover:border-white/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#a78bfa]">
              {counts.minted}
            </span>
            <Sparkles className="h-4 w-4 text-[#a78bfa]/70" />
          </div>
          <div className="mt-1 text-xs text-white/50">NFT Minted</div>
        </div>
      </div>

      {/* Main Split Layout: Interactive Map + Registry Panel */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Map View (7 cols) */}
        <div className="relative h-[560px] overflow-hidden rounded-2xl border border-white/10 bg-[#08080f] lg:col-span-7">
          <MapContainer
            center={mapCenter}
            zoom={dbTrees.length > 1 ? 5 : 7}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%", background: "#0b0a12" }}
          >
            <MapFlyTo target={flyTarget} />

            {mapLayer === "standard" ? (
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            ) : (
              <TileLayer
                attribution="Tiles &copy; Esri"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            )}

            {filteredTrees.map((t: any) => {
              const isSelected = selectedTree?._id === t._id
              const color = statusColor[t.status as TreeStatus] || "#1db954"

              return (
                <CircleMarker
                  key={t._id}
                  center={[t.lat, t.lng]}
                  radius={isSelected ? 13 : 9}
                  pathOptions={{
                    color: isSelected ? "#ffffff" : color,
                    fillColor: color,
                    fillOpacity: isSelected ? 1 : 0.85,
                    weight: isSelected ? 3 : 2,
                  }}
                  eventHandlers={{
                    click: () => handleSelectTree(t),
                  }}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs text-black">
                      <div className="font-bold text-sm text-gray-900">{t.name}</div>
                      <div className="text-gray-600 font-medium">{t.species}</div>
                      <div className="text-gray-500 mt-1">{t.location}</div>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5">
                        {t.lat?.toFixed(4)}, {t.lng?.toFixed(4)}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 border-t pt-2">
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            color,
                            backgroundColor: `${color}20`,
                          }}
                        >
                          {t.status}
                        </span>
                        <button
                          onClick={() => setSatelliteView(t)}
                          className="rounded bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700"
                        >
                          Satellite View
                        </button>
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}
          </MapContainer>

          {/* Map Legend Overlay */}
          <div className="absolute left-4 top-4 z-[400] rounded-xl border border-white/10 bg-[#08080f]/90 p-3 backdrop-blur-md">
            <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-white/40">
              Live Map Legend
            </div>
            <div className="flex flex-col gap-1.5 text-xs text-white/70">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1db954]" />
                <span>Verified ({counts.verified})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#a78bfa]" />
                <span>NFT Minted ({counts.minted})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f0a830]" />
                <span>Pending ({counts.pending})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Synced Tree Registry & Inspector (5 cols) */}
        <div className="flex h-[560px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#08080f] lg:col-span-5">
          {/* Registry Header & Search */}
          <div className="border-b border-white/10 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-syne)] text-base font-bold text-white">
                Tree Registry ({filteredTrees.length})
              </h2>
              <span className="text-xs text-white/40">Click row to locate</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, species, city, wallet..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white placeholder-white/30 outline-none transition-colors focus:border-[#1db954]/40"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "verified", label: "Verified" },
                { id: "minted", label: "Minted" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                    activeFilter === tab.id
                      ? "bg-white/15 text-white"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Registry List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2">
            {filteredTrees.length === 0 ? (
              <div className="py-12 text-center text-xs text-white/40">
                {search ? "No trees match your search." : "No trees in this filter category."}
              </div>
            ) : (
              filteredTrees.map((t: any) => {
                const isSelected = selectedTree?._id === t._id
                const isLoading = actionLoadingId === t._id
                const color = statusColor[t.status as TreeStatus] || "#1db954"

                return (
                  <div
                    key={t._id}
                    onClick={() => handleSelectTree(t)}
                    className={`cursor-pointer rounded-xl p-3 transition-all ${
                      isSelected
                        ? "border border-[#1db954]/40 bg-[#1db954]/10"
                        : "hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-white">{t.name}</div>
                        <div className="truncate text-xs text-white/50">{t.species}</div>
                        <div className="mt-1 flex items-center gap-1 text-[11px] text-white/70">
                          <MapPin className="h-3 w-3 text-[#1db954]" />
                          <span className="truncate">{t.location}</span>
                        </div>
                      </div>

                      <span
                        className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          color,
                          backgroundColor: `${color}1f`,
                        }}
                      >
                        {t.status}
                      </span>
                    </div>

                    {/* Coordinates & Actions */}
                    <div className="mt-2.5 flex items-center justify-between border-t border-white/5 pt-2 text-[10px] text-white/40">
                      <span className="font-mono">
                        {typeof t.lat === "number" ? t.lat.toFixed(4) : "—"},{" "}
                        {typeof t.lng === "number" ? t.lng.toFixed(4) : "—"}
                      </span>

                      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSatelliteView(t)}
                          className="flex items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/80 hover:bg-white/20"
                          title="View close-up satellite imagery"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Satellite</span>
                        </button>

                        {isVerifier && t.status === "pending" && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(t._id, "verified")}
                            className="rounded-full bg-[#1db954] px-2.5 py-0.5 text-[10px] font-bold text-black hover:scale-105 disabled:opacity-50"
                          >
                            {isLoading ? "..." : "Approve"}
                          </button>
                        )}

                        {isVerifier && t.status === "verified" && (
                          <button
                            disabled={isLoading}
                            onClick={() => handleStatusChange(t._id, "minted")}
                            className="rounded-full bg-[#a78bfa]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#a78bfa] hover:bg-[#a78bfa]/30 disabled:opacity-50"
                          >
                            {isLoading ? "..." : "Mint"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Selected Tree Inspector Footer */}
          {selectedTree && (
            <div className="border-t border-white/10 bg-black/40 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-white">Selected: {selectedTree.name}</span>
                <span className="font-mono text-[10px] text-white/50 truncate max-w-[160px]">
                  {selectedTree.walletAddress}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close-up Satellite Modal */}
      {satelliteView && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b0a12] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <div className="text-base font-bold text-white">{satelliteView.name}</div>
                <div className="text-xs text-white/50">
                  {satelliteView.species} &bull; {satelliteView.location}
                </div>
              </div>
              <button
                onClick={() => setSatelliteView(null)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70 hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="h-[380px] w-full">
              <MapContainer
                key={satelliteView._id}
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
                  radius={10}
                  pathOptions={{
                    color: "#1db954",
                    fillColor: "#1db954",
                    fillOpacity: 0.7,
                    weight: 3,
                  }}
                />
              </MapContainer>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-5 py-3 text-xs text-white/40">
              <span>
                Coordinates: {satelliteView.lat?.toFixed(5)}, {satelliteView.lng?.toFixed(5)}
              </span>
              <span>Satellite Imagery &copy; Esri</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
