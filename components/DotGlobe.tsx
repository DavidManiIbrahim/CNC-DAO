"use client"

import { useEffect, useRef } from "react"
import landPointsRaw from "./land-points.json"
import { useAllTrees } from "@/lib/useTrees"

type LandPoint = { lng: number; lat: number }

const landPoints: LandPoint[] = (landPointsRaw as [number, number][]).map(([lng, lat]) => ({
  lng,
  lat,
}))

export default function DotGlobe({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const allTrees = useAllTrees()
  const highlightsRef = useRef<LandPoint[]>([])

  useEffect(() => {
    highlightsRef.current = allTrees.map((t) => ({ lng: t.lng, lat: t.lat }))
  }, [allTrees])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let raf = 0
    let w = 0
    let h = 0
    let rotation = 0.4

    function resize() {
      const parent = canvas!.parentElement
      if (!parent) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = parent.clientWidth
      h = parent.clientHeight
      canvas!.width = w * dpr
      canvas!.height = h * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener("resize", resize)

    function project(lng: number, lat: number, rot: number, R: number, cx: number, cy: number) {
      const lambda = ((lng + rot) * Math.PI) / 180
      const phi = (lat * Math.PI) / 180
      const x = Math.cos(phi) * Math.sin(lambda)
      const y = Math.sin(phi)
      const z = Math.cos(phi) * Math.cos(lambda)
      return { x: cx + x * R, y: cy - y * R, z, visible: z > -0.05 }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h)
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.46

      rotation += 0.06

      // Theme-aware rendering check
      const isDark = document.documentElement.classList.contains("dark")

      // Outline ring — Emerald/slate in light mode, crisp white in dark mode
      ctx!.beginPath()
      ctx!.arc(cx, cy, R, 0, Math.PI * 2)
      ctx!.strokeStyle = isDark ? "rgba(255,255,255,0.92)" : "rgba(29, 185, 84, 0.8)"
      ctx!.lineWidth = isDark ? 1.4 : 1.8
      ctx!.shadowColor = isDark ? "rgba(255,255,255,0.92)" : "rgba(29, 185, 84, 0.6)"
      ctx!.shadowBlur = isDark ? 22 : 14
      ctx!.stroke()
      ctx!.stroke()
      ctx!.shadowBlur = 0

      // Land dots
      for (const p of landPoints) {
        const { x, y, z, visible } = project(p.lng, p.lat, rotation, R, cx, cy)
        if (!visible) continue
        const alpha = Math.max(0.12, z)

        ctx!.fillStyle = isDark
          ? `rgba(255, 255, 255, ${alpha * 0.85})`
          : `rgba(15, 23, 42, ${Math.max(0.25, alpha * 0.9)})`

        ctx!.beginPath()
        ctx!.arc(x, y, isDark ? 1.1 : 1.25, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Highlighted verification points
      for (const p of highlightsRef.current) {
        const { x, y, z, visible } = project(p.lng, p.lat, rotation, R, cx, cy)
        if (!visible) continue
        const alpha = Math.max(0.3, z)
        const size = 4 + z * 3

        ctx!.fillStyle = isDark
          ? `rgba(216, 226, 55, ${alpha})`
          : `rgba(234, 88, 12, ${alpha})`

        ctx!.shadowColor = isDark ? "rgba(216, 226, 55, 0.9)" : "rgba(234, 88, 12, 0.9)"
        ctx!.shadowBlur = 10
        ctx!.beginPath()
        ctx!.arc(x, y, size, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.shadowBlur = 0
      }

      raf = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div
      className={className}
      style={{
        WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 62%, transparent 78%)",
        maskImage: "radial-gradient(circle at 50% 50%, black 62%, transparent 78%)",
      }}
    >
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  )
}
