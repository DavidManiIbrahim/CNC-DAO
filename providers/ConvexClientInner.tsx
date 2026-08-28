"use client"

import { ConvexProvider, ConvexReactClient } from "convex/react"
import type { ReactNode } from "react"

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null

export default function ConvexClientInner({ children }: { children: ReactNode }) {
  if (!convex) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0b0a12",
        color: "white",
        fontFamily: "system-ui, sans-serif",
        padding: "2rem",
        textAlign: "center",
      }}>
        <div style={{
          maxWidth: 480,
          borderRadius: 16,
          border: "1px solid rgba(29,185,84,0.2)",
          padding: "2rem",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Convex backend not configured</h2>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>
            Create a <code style={{ color: "#1db954" }}>.env.local</code> file in your project root with:
          </p>
          <pre style={{
            marginTop: 12,
            padding: "0.75rem 1rem",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: 13,
            color: "#1db954",
            overflowX: "auto",
          }}>
            NEXT_PUBLIC_CONVEX_URL=&lt;your-convex-url&gt;
          </pre>
          <p style={{ marginTop: 12, color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
            Find your URL by running <code>npx convex dev</code> or checking your Convex dashboard.
          </p>
        </div>
      </div>
    )
  }
  return <ConvexProvider client={convex}>{children}</ConvexProvider>
}
