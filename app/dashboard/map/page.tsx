"use client"

import dynamic from "next/dynamic"

const AdminGlobalMap = dynamic(() => import("@/components/AdminGlobalMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[500px] w-full items-center justify-center rounded-2xl border border-white/10 bg-[#08080f] text-sm text-white/40">
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
