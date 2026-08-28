"use client"

import dynamic from "next/dynamic"

const AdminGlobalMap = dynamic(() => import("@/components/AdminGlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-3xl border border-border bg-card text-sm text-muted-foreground">
      Loading global map & registry…
    </div>
  ),
})

export default function AdminMapPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <AdminGlobalMap />
    </div>
  )
}
