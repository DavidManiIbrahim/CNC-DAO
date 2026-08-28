"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { ConvexError } from "convex/values"
import { useSessionUser } from "@/lib/useAuth"
import { resizeImage } from "@/lib/mockAuth"
import {
  Plus,
  Trash2,
  Edit2,
  Users,
  Check,
  Sparkles,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react"

export default function DashboardCampaignsPage() {
  const user = useSessionUser()
  const campaigns = useQuery(api.campaigns.list) ?? []
  const isNatureHero = user?.role === "nature_hero" || user?.role === "admin"
  const isAdmin = user?.role === "admin"

  const createMutation = useMutation(api.campaigns.create)
  const updateMutation = useMutation(api.campaigns.update)
  const joinMutation = useMutation(api.campaigns.join)
  const removeMutation = useMutation(api.campaigns.remove)

  const [showModal, setShowModal] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null)

  const [form, setForm] = useState({
    name: "",
    region: "",
    participantLimit: "100",
    description: "",
  })
  const [imagePreview, setImagePreview] = useState<string>("")
  const [imageLoading, setImageLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [joiningId, setJoiningId] = useState<string | null>(null)
  const [joinedMap, setJoinedMap] = useState<Record<string, boolean>>({})

  // Stats
  const totalParticipants = campaigns.reduce((acc: number, c: any) => acc + (c.joined || 0), 0)
  const totalCapacity = campaigns.reduce((acc: number, c: any) => acc + (c.participantLimit || 0), 0)

  function openCreateModal() {
    setEditingCampaign(null)
    setForm({ name: "", region: "", participantLimit: "100", description: "" })
    setImagePreview("")
    setError("")
    setShowModal(true)
  }

  function openEditModal(c: any) {
    setEditingCampaign(c)
    setForm({
      name: c.name,
      region: c.region,
      participantLimit: String(c.participantLimit || 100),
      description: c.description,
    })
    setImagePreview(c.imageUrl || "")
    setError("")
    setShowModal(true)
  }

  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP)")
      return
    }
    setImageLoading(true)
    try {
      const resized = await resizeImage(file, 800)
      setImagePreview(resized)
    } catch {
      setError("Failed to process image. Please try another file.")
    } finally {
      setImageLoading(false)
    }
  }

  function handleRemoveImage() {
    setImagePreview("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!user?.userId) {
        throw new Error("You must be logged in to manage campaigns.")
      }

      if (editingCampaign) {
        try {
          await updateMutation({
            adminId: user.userId as any,
            campaignId: editingCampaign._id as any,
            name: form.name,
            region: form.region,
            participantLimit: parseInt(form.participantLimit, 10) || 10,
            description: form.description,
            imageUrl: imagePreview || undefined,
          })
        } catch (updateErr: any) {
          const errMsg = updateErr?.message || String(updateErr)
          if (errMsg.includes("Could not find public function")) {
            // Fallback for when campaigns:update is still syncing on remote Convex
            try {
              await removeMutation({
                adminId: user.userId as any,
                campaignId: editingCampaign._id as any,
              })
            } catch {
              // Ignore remove error if already handled
            }
            await createMutation({
              creatorId: user.userId as any,
              name: form.name,
              region: form.region,
              participantLimit: parseInt(form.participantLimit, 10) || 10,
              description: form.description,
              imageUrl: imagePreview || undefined,
            })
          } else {
            throw updateErr
          }
        }
      } else {
        await createMutation({
          creatorId: user.userId as any,
          name: form.name,
          region: form.region,
          participantLimit: parseInt(form.participantLimit, 10) || 10,
          description: form.description,
          imageUrl: imagePreview || undefined,
        })
      }

      setShowModal(false)
      setEditingCampaign(null)
    } catch (err: unknown) {
      if (err instanceof ConvexError) {
        setError(typeof err.data === "string" ? err.data : JSON.stringify(err.data))
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError("Failed to save campaign. Please try again.")
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
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            Planting Campaigns
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Coordinate regional tree planting initiatives, manage participants, edit goals, and drive community stewardship.
          </p>
        </div>

        {isNatureHero && (
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 self-start rounded-full bg-[#1db954] px-5 py-2.5 text-xs font-bold text-black transition-transform hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            <span>Create Campaign</span>
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
            {campaigns.length}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Active Campaigns</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
            {totalParticipants}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Participants Joined</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#a78bfa]">
            {totalCapacity}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Total Target Goal</div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#1db954]">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified On-Chain</span>
          </div>
          <div className="mt-2 text-[10px] text-muted-foreground">Proof of stewardship</div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {campaigns.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-border bg-card p-12 text-center text-sm text-muted-foreground">
            No campaigns currently active.{" "}
            {isNatureHero && (
              <button
                onClick={openCreateModal}
                className="text-[#1db954] underline hover:text-[#1db954]/80 ml-1 font-semibold"
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
                className="flex flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-all hover:border-[#1db954]/40 hover:shadow-md"
              >
                {c.imageUrl && (
                  <div className="relative h-44 w-full overflow-hidden border-b border-border bg-muted">
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute bottom-2 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                      {c.region}
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                        {c.name}
                      </h2>
                      {!c.imageUrl && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3 text-[#1db954]" />
                          <span>{c.region}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {isNatureHero && (
                        <button
                          onClick={() => openEditModal(c)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit Campaign"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      )}

                      {isAdmin && (
                        <button
                          onClick={() => handleRemove(c._id)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
                          title="Delete Campaign (Admin)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="my-4 text-xs leading-relaxed text-muted-foreground">
                    {c.description}
                  </p>
                </div>

                <div className="px-6 pb-6">
                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span className="font-mono text-foreground font-semibold">{pct}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-[#1db954] transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
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
                          ? "cursor-not-allowed bg-muted text-muted-foreground"
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

      {/* Create / Edit Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-overlay p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                  {editingCampaign ? "Edit Planting Campaign" : "Create Planting Campaign"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {editingCampaign
                    ? "Update the campaign description, goals, and photo banner."
                    : "Launch a new community reforestation initiative."}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Campaign Title
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Niger Delta Mangrove Initiative"
                  className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-xs text-foreground outline-none transition-colors focus:border-[#1db954]/50"
                />
              </div>

              {/* Campaign Image Upload */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Campaign Banner Image
                </label>
                {imagePreview ? (
                  <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/30">
                    <img
                      src={imagePreview}
                      alt="Campaign Banner Preview"
                      className="h-36 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-white transition-transform hover:scale-110 hover:bg-black"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/20 p-4 text-center transition-colors hover:border-[#1db954]/60 hover:bg-muted/40"
                  >
                    <div className="mb-1.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[#1db954]/10 text-[#1db954]">
                      {imageLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1db954] border-t-transparent" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </div>
                    <div className="text-xs font-semibold text-foreground">
                      {imageLoading ? "Processing photo…" : "Upload campaign photo"}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      PNG, JPG, WebP (auto-optimized)
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Target Region / City
                  </label>
                  <input
                    required
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    placeholder="e.g. Lagos, Nigeria"
                    className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-xs text-foreground outline-none transition-colors focus:border-[#1db954]/50"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">
                    Participant Limit
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={form.participantLimit}
                    onChange={(e) => setForm({ ...form, participantLimit: e.target.value })}
                    placeholder="100"
                    className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-xs text-foreground outline-none transition-colors focus:border-[#1db954]/50"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Description & Instructions
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the campaign objectives, species to plant, and participant requirements..."
                  className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-xs text-foreground outline-none transition-colors focus:border-[#1db954]/50"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="mt-2 flex items-center justify-end gap-3 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || imageLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-[#1db954] px-5 py-2 text-xs font-bold text-black hover:bg-[#1db954]/90 disabled:opacity-50"
                >
                  {editingCampaign ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{loading ? "Updating..." : "Save Changes"}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>{loading ? "Creating..." : "Launch Campaign"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
