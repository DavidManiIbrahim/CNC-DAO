"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { latLngToXY, type RegisteredTree } from "@/lib/registeredTrees"
import { useAllTrees } from "@/lib/useTrees"

/**
 * TreeMap — ported from the custom code component on the live Framer site
 * (the canvas/pin-based registry map embedded under the "Global Registry"
 * section of the homepage, and presumably reused on /map).
 *
 * Original was static Framer-exported HTML with inline styles and no real
 * interactivity beyond CSS hover. This version adds actual state: working
 * filters, search, pan (drag), zoom, and a synced sidebar list <-> map.
 *
 * Tree data below is placeholder matching what's currently live (2 trees,
 * both minted, 0 formally "verified" yet). Swap `trees` for a real fetch
 * once you've got an API/DB behind this — the shape is (id, name, species,
 * location, country, status, x%, y%).
 */

type TreeStatus = "verified" | "minted" | "pending"

type Tree = {
  id: string
  name: string
  location: string
  country: string
  status: TreeStatus
  x: number // position as % of map width
  y: number // position as % of map height
}

const statusColor: Record<TreeStatus, string> = {
  verified: "#22c55e",
  minted: "#a78bfa",
  pending: "#f5a800",
}

const filters = [
  { key: "all", label: "All trees", dot: "#a0a0a0" },
  { key: "verified", label: "Verified", dot: "#22c55e" },
  { key: "minted", label: "Minted", dot: "#a78bfa" },
  { key: "pending", label: "Pending", dot: "#f5a800" },
  { key: "nigeria", label: "Nigeria", dot: null, flag: "🇳🇬" },
] as const

export default function TreeMap() {
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showList, setShowList] = useState(true)
  const dragRef = useRef<{ startX: number; startY: number; panX: number; panY: number } | null>(null)
  const allTrees = useAllTrees()
  const trees: Tree[] = allTrees.map((t: RegisteredTree) => {
    const { x, y } = latLngToXY(t.lat, t.lng)
    const country = t.location.split(",").pop()?.trim() ?? t.location
    return { id: t.id, name: t.name, location: t.location, country, status: t.status, x, y }
  })

  const filteredTrees = trees.filter((t) => {
    if (activeFilter === "pending" && t.status !== "pending") return false
    if (activeFilter === "verified" && t.status !== "verified" && t.status !== "minted") return false
    if (activeFilter === "minted" && t.status !== "minted") return false
    if (activeFilter === "nigeria" && t.country !== "Nigeria") return false
    if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.location.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const counts = {
    total: trees.length,
    verified: trees.filter((t) => t.status === "verified" || t.status === "minted").length,
    minted: trees.filter((t) => t.status === "minted").length,
    pending: trees.filter((t) => t.status === "pending").length,
  }

  const onMapMouseDown = useCallback(
    (e: React.MouseEvent) => {
      dragRef.current = { startX: e.clientX, startY: e.clientY, panX: pan.x, panY: pan.y }
    },
    [pan]
  )

  const onMapMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy })
  }, [])

  const onMapMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-[#222] bg-[#0a0a0a] font-[family-name:var(--font-space-grotesk)] text-white">
      {/* ---------- Toolbar ---------- */}
      <div className="flex h-14 flex-shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[#222] bg-[#0d0d0d] px-5">
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[#f5a800]">
            <svg width="13" height="13" viewBox="0 0 16 16" fill="#0a0a0a">
              <path d="M8 1.5C6 4 4 5 4 8C4 10.2 5.8 12 8 12C10.2 12 12 10.2 12 8C12 5 10 4 8 1.5Z" />
              <line x1="8" y1="12" x2="8" y2="14.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="5.5" y1="14.5" x2="10.5" y2="14.5" stroke="#0a0a0a" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-sm font-bold tracking-[-0.02em]">CNC DAO</span>
          <div className="h-5 w-px bg-[#2e2e2e]" />
          <span className="text-xs font-medium text-[#a0a0a0]">Global tree map</span>
        </div>

        <div className="flex flex-1 flex-wrap items-center justify-center gap-1.5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#555]">
            Filter
          </span>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-medium transition-colors"
              style={{
                borderColor: activeFilter === f.key ? "#a0a0a0" : "#222",
                color: activeFilter === f.key ? "#a0a0a0" : "#a0a0a0",
                background: activeFilter === f.key ? "#a0a0a024" : "transparent",
              }}
            >
              {f.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.dot }} />}
              {"flag" in f && f.flag && <span>{f.flag}</span>}
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e33] bg-[#22c55e14] px-3 py-1 font-[family-name:var(--font-space-mono)] text-[10px] font-semibold text-[#22c55e]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
            1,240 live
          </div>
          <Link href="/tree-reg" className="rounded-lg bg-[#f5a800] px-4 py-1.5 text-[11px] font-bold text-[#0a0a0a] transition-transform hover:scale-105">
            + Plant a tree
          </Link>
        </div>
      </div>

      {/* ---------- Body ---------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div
          className="relative flex-1 select-none overflow-hidden bg-[#0d1117]"
          style={{ cursor: dragRef.current ? "grabbing" : "grab" }}
          onMouseDown={onMapMouseDown}
          onMouseMove={onMapMouseMove}
          onMouseUp={onMapMouseUp}
          onMouseLeave={onMapMouseUp}
        >
          <div
            className="absolute inset-0"
            style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
          >
            {/* grid */}
            <div
              className="pointer-events-none absolute -inset-[1000px]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            {/* crosshair */}
            <div className="pointer-events-none absolute left-[-1000px] right-[-1000px] top-1/2 h-px bg-[#f5a80014]" />
            <div className="pointer-events-none absolute bottom-[-1000px] top-[-1000px] left-1/2 w-px bg-[#f5a80014]" />
            {/* glows */}
            <div className="pointer-events-none absolute left-[15%] top-[20%] h-[400px] w-[400px] rounded-full bg-[#f5a80008] blur-[60px]" />
            <div className="pointer-events-none absolute bottom-[10%] right-[20%] h-[300px] w-[300px] rounded-full bg-[#22c55e08] blur-[60px]" />

            {/* cluster */}
            <div className="absolute z-[15] -translate-x-1/2 -translate-y-1/2 cursor-pointer" style={{ top: "42%", left: "49%" }}>
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-[1.5px] border-[#f5a80066] bg-[#f5a80026] text-[11px] font-bold text-[#f5a800]">
                18
              </div>
            </div>

            {/* pins */}
            {filteredTrees.map((t) => (
              <div
                key={t.id}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                style={{ top: `${t.y}%`, left: `${t.x}%` }}
                onMouseEnter={() => setHoveredId(t.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSelectedId(t.id)}
              >
                <div
                  className="relative z-[2] h-3 w-3 rounded-full border-2 border-[#0d1117] transition-transform"
                  style={{
                    background: statusColor[t.status],
                    boxShadow: `0 0 10px ${statusColor[t.status]}80`,
                    transform: selectedId === t.id ? "scale(1.4)" : "scale(1)",
                  }}
                />
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border"
                  style={{ borderColor: `${statusColor[t.status]}66` }}
                />
                {hoveredId === t.id && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#222] bg-[#0a0a0ae6] px-2 py-0.5 text-[9px] text-white">
                    {t.name} · {t.location.split(",")[0]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* zoom controls */}
          <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-[#111111e6] text-sm font-bold text-[#a0a0a0]"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-[#111111e6] text-sm font-bold text-[#a0a0a0]"
            >
              −
            </button>
            <button
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-[#111111e6] text-[10px] font-bold text-[#a0a0a0]"
            >
              ⌖
            </button>
            <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#222] bg-[#111111e6] text-[10px] font-bold text-[#a0a0a0]">
              ◎
            </button>
          </div>

          {/* legend */}
          <div className="absolute left-4 top-4 z-20 rounded-xl border border-[#222] bg-[#111111eb] px-3.5 py-2.5">
            <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-[#555]">
              Tree status
            </div>
            {[
              { c: "#a78bfa", l: "NFT minted" },
              { c: "#22c55e", l: "Verified on-chain" },
              { c: "#f5a800", l: "Pending validation" },
            ].map((s) => (
              <div key={s.l} className="mb-1.5 flex items-center gap-1.5 text-[10px] text-[#a0a0a0] last:mb-0">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.c }} />
                {s.l}
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[10px] text-[#a0a0a0]">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#f5a8004d] bg-[#f5a8001f] text-[9px] font-bold text-[#f5a800]">
                N
              </div>
              Cluster of trees
            </div>
          </div>

          <button
            onClick={() => setShowList((v) => !v)}
            className="absolute bottom-5 left-4 z-20 flex items-center gap-1.5 rounded-lg border border-[#222] bg-[#111111e6] px-3 py-1.5 text-[10px] font-semibold text-[#a0a0a0]"
          >
            <span>{showList ? "◀" : "▶"}</span>
            <span>{showList ? "Hide list" : "Show list"}</span>
          </button>

          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full border border-[#222] bg-[#111111d9] px-3.5 py-1 font-[family-name:var(--font-space-mono)] text-[9px] text-[#555]">
            Hover map to see coordinates
          </div>
        </div>

        {/* Sidebar */}
        {showList && (
          <div className="flex w-[300px] flex-shrink-0 flex-col overflow-hidden border-l border-[#222] bg-[#111111]">
            <div className="flex-shrink-0 border-b border-[#222] px-4 pb-3 pt-4">
              <div className="mb-0.5 font-[family-name:var(--font-space-grotesk)] text-[15px] font-bold">
                Tree registry
              </div>
              <div className="text-[10px] text-[#a0a0a0]">
                Click a tree to locate it on the map
              </div>
            </div>

            <div className="flex-shrink-0 border-b border-[#222] px-3.5 py-2.5">
              <div className="relative">
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[#555]">
                  🔍
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  type="text"
                  placeholder="Search trees, species, location..."
                  className="w-full rounded-lg border border-[#222] bg-[#161616] py-2 pl-8 pr-3 text-[11px] text-white outline-none placeholder:text-[#555]"
                />
              </div>
            </div>

            <div className="grid flex-shrink-0 grid-cols-3 gap-px border-b border-[#222] bg-[#222]">
              <div className="bg-[#161616] px-2 py-2.5 text-center">
                <div className="text-lg font-bold leading-none text-[#f5a800]">{counts.total}</div>
                <div className="mt-0.5 text-[9px] text-[#a0a0a0]">Total</div>
              </div>
              <div className="bg-[#161616] px-2 py-2.5 text-center">
                <div className="text-lg font-bold leading-none text-[#22c55e]">{counts.verified}</div>
                <div className="mt-0.5 text-[9px] text-[#a0a0a0]">Verified</div>
              </div>
              <div className="bg-[#161616] px-2 py-2.5 text-center">
                <div className="text-lg font-bold leading-none text-[#a78bfa]">{counts.minted}</div>
                <div className="mt-0.5 text-[9px] text-[#a0a0a0]">Minted</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredTrees.length === 0 && (
                <div className="px-2 py-6 text-center text-xs text-[#555]">No trees match.</div>
              )}
              {filteredTrees.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="mb-1 flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors"
                  style={{
                    borderColor: selectedId === t.id ? "#f5a80066" : "transparent",
                    background: selectedId === t.id ? "#f5a8000f" : "transparent",
                  }}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-[#1e1e1e] text-[15px]">
                    🌳
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-semibold">{t.name}</div>
                    <div className="truncate text-[10px] text-[#a0a0a0]">{t.location}</div>
                  </div>
                  <span
                    className="ml-auto flex-shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-semibold capitalize"
                    style={{
                      background: `${statusColor[t.status]}1a`,
                      color: statusColor[t.status],
                      borderColor: `${statusColor[t.status]}33`,
                    }}
                  >
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ---------- Status bar ---------- */}
      <div className="flex h-10 flex-shrink-0 items-center gap-6 border-t border-[#222] bg-[#0d0d0d] px-5 font-[family-name:var(--font-space-mono)] text-[10px] text-[#555]">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#a78bfa]" />
          {counts.minted} minted
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" />
          {counts.verified} verified
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f5a800]" />
          {counts.pending} pending
        </div>
        <div className="ml-auto flex gap-4">
          <span>38 countries</span>
          <span>124 Nature Heroes</span>
          <span className="text-[#22c55e]">Solana mainnet</span>
        </div>
      </div>
    </div>
  )
}
