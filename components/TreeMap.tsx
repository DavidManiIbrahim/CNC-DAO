"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import { latLngToXY, type RegisteredTree } from "@/lib/registeredTrees"
import { useAllTrees } from "@/lib/useTrees"
import { useTheme } from "next-themes"

type TreeStatus = "verified" | "minted" | "pending"

type Tree = {
  id: string
  name: string
  location: string
  country: string
  status: TreeStatus
  x: number
  y: number
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
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

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

  const onMapMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      setPan({ x: dragRef.current.panX + dx, y: dragRef.current.panY + dy })
    },
    []
  )

  const onMapMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-card text-foreground select-none">
      {/* ---------- Top toolbar ---------- */}
      <div className="flex h-14 flex-shrink-0 items-center justify-between border-b border-border bg-card/90 px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#22c55e] animate-pulse" />
          <span className="font-[family-name:var(--font-space-grotesk)] text-xs font-bold uppercase tracking-wider text-foreground">
            Registry Map
          </span>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                activeFilter === f.key
                  ? "bg-[#1db954] text-black border-[#1db954]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: f.dot }} />}
              {"flag" in f && f.flag && <span>{f.flag}</span>}
              <span>{f.label}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/30 bg-[#22c55e]/10 px-3 py-1 font-[family-name:var(--font-space-mono)] text-[10px] font-bold text-[#22c55e]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#22c55e]" />
            {counts.total} on-chain
          </div>
          <Link href="/tree-reg" className="rounded-xl bg-[#1db954] px-4 py-1.5 text-xs font-bold text-black transition-transform hover:scale-105">
            + Plant a tree
          </Link>
        </div>
      </div>

      {/* ---------- Body ---------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map Canvas View */}
        <div
          className="relative flex-1 select-none overflow-hidden bg-slate-100 dark:bg-[#0d1117] transition-colors"
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
                backgroundImage: isDark
                  ? "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)"
                  : "linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)",
                backgroundSize: "48px 48px",
              }}
            />
            {/* crosshair */}
            <div
              className="pointer-events-none absolute left-[-1000px] right-[-1000px] top-1/2 h-px"
              style={{ background: isDark ? "rgba(245,168,0,0.08)" : "rgba(0,0,0,0.08)" }}
            />
            <div
              className="pointer-events-none absolute bottom-[-1000px] top-[-1000px] left-1/2 w-px"
              style={{ background: isDark ? "rgba(245,168,0,0.08)" : "rgba(0,0,0,0.08)" }}
            />

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
                  className="relative z-[2] h-3.5 w-3.5 rounded-full border-2 border-card shadow-md transition-transform"
                  style={{
                    background: statusColor[t.status],
                    boxShadow: `0 0 10px ${statusColor[t.status]}80`,
                    transform: selectedId === t.id ? "scale(1.5)" : "scale(1)",
                  }}
                />
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full border"
                  style={{ borderColor: `${statusColor[t.status]}66` }}
                />
                {hoveredId === t.id && (
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-card/95 px-3 py-1 text-xs text-foreground shadow-xl">
                    <span className="font-bold">{t.name}</span> &bull; {t.location.split(",")[0]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* zoom controls */}
          <div className="absolute right-4 top-1/2 z-20 flex -translate-y-1/2 flex-col gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card/90 text-sm font-bold text-foreground shadow backdrop-blur-sm hover:bg-muted"
            >
              +
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card/90 text-sm font-bold text-foreground shadow backdrop-blur-sm hover:bg-muted"
            >
              −
            </button>
            <button
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
              }}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card/90 text-xs font-bold text-foreground shadow backdrop-blur-sm hover:bg-muted"
              title="Reset center"
            >
              ⌖
            </button>
          </div>

          {/* legend */}
          <div className="absolute left-4 top-4 z-20 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-md">
            <div className="mb-2 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
              Tree status
            </div>
            {[
              { c: "#a78bfa", l: "NFT minted" },
              { c: "#22c55e", l: "Verified on-chain" },
              { c: "#f5a800", l: "Pending validation" },
            ].map((s) => (
              <div key={s.l} className="mb-1.5 flex items-center gap-2 text-xs font-medium text-foreground last:mb-0">
                <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: s.c }} />
                <span>{s.l}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setShowList((v) => !v)}
            className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3 py-1.5 text-xs font-semibold text-foreground shadow backdrop-blur-sm hover:bg-muted"
          >
            <span>{showList ? "◀" : "▶"}</span>
            <span>{showList ? "Hide list" : "Show list"}</span>
          </button>
        </div>

        {/* Sidebar */}
        {showList && (
          <div className="flex w-[300px] flex-shrink-0 flex-col overflow-hidden border-l border-border bg-card">
            <div className="flex-shrink-0 border-b border-border px-4 pb-3 pt-4">
              <div className="mb-0.5 font-[family-name:var(--font-space-grotesk)] text-sm font-bold text-foreground">
                Tree registry
              </div>
              <div className="text-xs text-muted-foreground">
                Click a tree to locate on canvas
              </div>
            </div>

            <div className="flex-shrink-0 border-b border-border p-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search trees, location..."
                className="w-full rounded-xl border border-border bg-input py-1.5 px-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:border-[#1db954]/60"
              />
            </div>

            <div className="grid flex-shrink-0 grid-cols-3 gap-px border-b border-border bg-border">
              <div className="bg-card p-2 text-center">
                <div className="text-base font-bold text-[#f5a800]">{counts.total}</div>
                <div className="text-[10px] text-muted-foreground">Total</div>
              </div>
              <div className="bg-card p-2 text-center">
                <div className="text-base font-bold text-[#22c55e]">{counts.verified}</div>
                <div className="text-[10px] text-muted-foreground">Verified</div>
              </div>
              <div className="bg-card p-2 text-center">
                <div className="text-base font-bold text-[#a78bfa]">{counts.minted}</div>
                <div className="text-[10px] text-muted-foreground">Minted</div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {filteredTrees.length === 0 && (
                <div className="px-2 py-6 text-center text-xs text-muted-foreground">No trees match.</div>
              )}
              {filteredTrees.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`mb-1 flex w-full items-center gap-2.5 rounded-xl border p-2.5 text-left transition-colors ${
                    selectedId === t.id
                      ? "border-[#1db954] bg-[#1db954]/10"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-sm">
                    🌳
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-bold text-foreground">{t.name}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{t.location}</div>
                  </div>
                  <span
                    className="ml-auto flex-shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-bold capitalize"
                    style={{
                      background: `${statusColor[t.status]}20`,
                      color: statusColor[t.status],
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
      <div className="flex h-10 flex-shrink-0 items-center gap-6 border-t border-border bg-card px-5 font-[family-name:var(--font-space-mono)] text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#a78bfa]" />
          <span>{counts.minted} minted</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
          <span>{counts.verified} verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#f5a800]" />
          <span>{counts.pending} pending</span>
        </div>
        <div className="ml-auto hidden sm:flex gap-4">
          <span className="text-[#22c55e] font-semibold">Solana Network</span>
        </div>
      </div>
    </div>
  )
}
