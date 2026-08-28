"use client"

import { useState } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ConvexError } from "convex/values"
import { useSessionUser } from "@/lib/useAuth"
import {
  Plus,
  Trash2,
  Users,
  Check,
  Sparkles,
  MapPin,
  Calendar,
  ShieldCheck,
  AlertCircle,
} from "lucide-react"

export default function DashboardCampaignsPage() {
  const user = useSessionUser()
  const campaigns = useQuery(api.campaigns.list) ?? []
  const isNatureHero = user?.role === "nature_hero" || user?.role === "admin"
  const isAdmin = user?.role === "admin"

  const createMutation = useMutation(api.campaigns.create)
  const joinMutation = useMutation(api.campaigns.join)
  const removeMutation = useMutation(api.campaigns.remove)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [form, setForm] = useState({
    name: "",
    region: "",
    participantLimit: "100",
    description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({})

  // Stats
  const totalParticipants = campaigns.reduce((acc: number, c: any) => acc + (c.joined || 0), 0)
  const totalCapacity = campaigns.reduce((acc: number, c: any) => acc + (c.participantLimit || 0), 0)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      if (!user?.userId) {
        throw new Error("You must be logged in to create a campaign.")
      }
      await createMutation({
        creatorId: user.userId as any,
        name: form.name,
        region: form.region,
        participantLimit: parseInt(form.participantLimit, 10) || 10,
        description: form.description,
      })
      setSuccess("Campaign created successfully!")
      setForm({ name: "", region: "", participantLimit: "100", description: "" })
      setShowCreateModal(false)
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(typeof err.data === "string" ? err.data : JSON.stringify(err.data))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to create campaign. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(campaignId: string) {
    setJoiningId(campaignId)
    try {
      await joinMutation({ campaignId: campaignId as any })
      setJoinedMap((prev) => ({ ...prev, [campaignId]: true }))
    } catch (err) {
      console.error("Failed to join", err)
    } finally {
      setJoiningId(null)
    }
  }

  async function handleRemove(campaignId: string) {
    if (!user?.userId || !isAdmin) return
    if (!confirm("Are you sure you want to delete this campaign?")) return
    try {
      await removeMutation({
        adminId: user.userId as any,
        campaignId: campaignId as any,
      })
    } catch (err) {
      console.error("Failed to delete", err)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold">
            Planting Campaigns
          </h1>
          <p className="mt-1 text-sm text-white/50">
            Coordinate regional tree planting initiatives, manage participants, and drive community stewardship.
          </p>
        </div>

        {isNatureHero && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 self-start rounded-full bg-[#1db954] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4">
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-white">
            {campaigns.length}
          </div>
          <div className="mt-1 text-xs text-white/50">Active Campaigns</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4">
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
            {totalParticipants}
          </div>
          <div className="mt-1 text-xs text-white/50">Participants Joined</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4">
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#a78bfa]">
            {totalCapacity}
          </div>
          <div className="mt-1 text-xs text-white/50">Total Target Goal</div>
        </div>

        <div className="rounded-xl border border-white/10 bg-[#08080f] p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1db954]">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified On-Chain</span>
          </div>
          <div className="mt-2 text-[10px] text-white/40">Proof of stewardship</div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campaigns.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-white/10 bg-[#08080f] p-12 text-center text-sm text-white/40">
            No campaigns currently active.{" "}
            {isNatureHero && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-[#1db954] underline hover:text-[#1db954]/80 ml-1"
              >
                Create the first campaign
              </button>
            )}
          </div>
        ) : (
          campaigns.map((c: any) => {
            const pct = Math.min(100, Math.round((c.joined / c.participantLimit) * 100))
            const isJoined = joinedMap[c._id]
            const isFull = c.joined >= c.participantLimit

            return (
              <div
                key={c._id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#08080f] p-6 transition-all hover:border-[#1db954]/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-white">
                        {c.name}
                      </h2>
                      <div className="mt-1 flex items-center gap-1 text-xs text-white/50">
                        <MapPin className="h-3 w-3 text-[#1db954]" />
                        <span>{c.region}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleRemove(c._id)}
                        className="rounded-lg p-1.5 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Delete Campaign (Admin)"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="my-4 text-xs leading-relaxed text-white/70">
                    {c.description}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[11px] text-white/50 mb-1">
                      <span>Progress</span>
                      <span className="font-mono text-white/70">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#1db954] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between border-t border-white/5 pt-3 text-[11px] text-white/40">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-white/60" />
                      <span>
                        {c.joined} / {c.participantLimit} joined
                      </span>
                    </span>
                    <span className="truncate max-w-[140px]">By {c.createdBy}</span>
                  </div>

                  <button
                    disabled={isFull || isJoined || joiningId === c._id}
                    onClick={() => handleJoin(c._id)}
                    className={`flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
                      isJoined
                        ? "bg-[#1db954]/20 text-[#1db954]"
                        : isFull
                          ? "cursor-not-allowed bg-white/10 text-white/30"
                          : "bg-[#1db954] text-black hover:bg-[#1db954]/90 hover:scale-[1.02]"
                    }`}
                  >
                    {isJoined ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Joined Campaign</span>
                      </>
                    ) : isFull ? (
                      "Capacity Reached"
                    ) : joiningId === c._id ? (
                      "Joining..."
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        <span>Join Campaign</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0c0c14] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-white">
                  Create Planting Campaign
                </h2>
                <p className="text-xs text-white/50">
                  Launch a new community reforestation initiative.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/20"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/70">
                  Campaign Title
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Niger Delta Mangrove Initiative"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none transition-colors focus:border-[#1db954]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/70">
                    Target Region / City
                  </label>
                  <input
                    required
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none transition-colors focus:border-[#1db954]/50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-white/70">
                    Participant Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.participantLimit}
                    onChange={(e) => setForm({ ...form, participantLimit: e.target.value })}
                    placeholder="100"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none transition-colors focus:border-[#1db954]/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-white/70">
                  Description & Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the campaign objectives, species to plant, and participant requirements..."
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-xs text-white outline-none transition-colors focus:border-[#1db954]/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-white/15 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1db954] px-5 py-2 text-xs font-bold text-black hover:bg-[#1db954]/90 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{loading ? "Creating..." : "Launch Campaign"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
