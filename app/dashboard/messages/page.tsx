"use client"

import { useState, useMemo, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useSessionUser } from "@/lib/useAuth"
import {
  getStoredMessages,
  updateStoredMessageStatus,
  removeStoredMessage,
  type ContactMessageItem,
} from "@/lib/messagesStorage"
import {
  Mail,
  MailOpen,
  CheckCircle,
  Clock,
  Trash2,
  Reply,
  Search,
  Shield,
  Eye,
} from "lucide-react"

export default function AdminMessagesPage() {
  const user = useSessionUser()
  const isAdmin = user?.role === "admin"
  const adminId = user?.userId

  // Local fallback state
  const [localMessages, setLocalMessages] = useState<ContactMessageItem[]>(() => getStoredMessages())

  useEffect(() => {
    const handler = () => setLocalMessages(getStoredMessages())
    window.addEventListener("messages:change", handler)
    return () => window.removeEventListener("messages:change", handler)
  }, [])

  // Try querying Convex if available
  let convexMessages: any[] | undefined = undefined
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    convexMessages = useQuery(api.users.listMessages, {})
  } catch {
    convexMessages = undefined
  }

  // Mutations
  let updateStatusMut: any = null
  let removeMessageMut: any = null
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    updateStatusMut = useMutation(api.users.updateMessageStatus)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    removeMessageMut = useMutation(api.users.removeMessage)
  } catch {
    // Graceful fallback to local handler
  }

  // Active messages source
  const messages: ContactMessageItem[] =
    convexMessages && Array.isArray(convexMessages) && convexMessages.length > 0
      ? convexMessages
      : localMessages

  const [activeTab, setActiveTab] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageItem | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  // Safe formatting helpers
  function formatDate(d?: string) {
    if (!d) return "—"
    try {
      return new Date(d).toLocaleDateString()
    } catch {
      return "—"
    }
  }

  function formatDateTime(d?: string) {
    if (!d) return "—"
    try {
      return new Date(d).toLocaleString()
    } catch {
      return "—"
    }
  }

  // Filter messages
  const filteredMessages = useMemo(() => {
    return (messages || []).filter((m: any) => {
      if (!m) return false
      if (activeTab !== "all" && m.status !== activeTab) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = m.name ? String(m.name).toLowerCase().includes(q) : false
        const matchEmail = m.email ? String(m.email).toLowerCase().includes(q) : false
        const matchBody = m.message ? String(m.message).toLowerCase().includes(q) : false
        return matchName || matchEmail || matchBody
      }
      return true
    })
  }, [messages, activeTab, searchQuery])

  // Stats
  const counts = {
    total: (messages || []).length,
    unread: (messages || []).filter((m: any) => m?.status === "unread").length,
    read: (messages || []).filter((m: any) => m?.status === "read").length,
    resolved: (messages || []).filter((m: any) => m?.status === "resolved").length,
  }

  async function handleStatusChange(messageId: string, status: "unread" | "read" | "resolved") {
    setActionLoadingId(messageId)
    try {
      if (updateStatusMut) {
        await updateStatusMut({
          adminId: adminId ? String(adminId) : undefined,
          messageId: messageId as any,
          status,
        })
      }
    } catch {
      // Fallback
    } finally {
      updateStoredMessageStatus(messageId, status)
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage({ ...selectedMessage, status })
      }
      setActionLoadingId(null)
    }
  }

  async function handleDelete(messageId: string) {
    if (!confirm("Are you sure you want to permanently delete this inquiry?")) return
    setActionLoadingId(messageId)
    try {
      if (removeMessageMut) {
        await removeMessageMut({
          adminId: adminId ? String(adminId) : undefined,
          messageId: messageId as any,
        })
      }
    } catch {
      // Fallback
    } finally {
      removeStoredMessage(messageId)
      if (selectedMessage && selectedMessage._id === messageId) {
        setSelectedMessage(null)
      }
      setActionLoadingId(null)
    }
  }

  function handleOpenMessage(m: ContactMessageItem) {
    if (!m) return
    setSelectedMessage(m)
    if (m.status === "unread") {
      handleStatusChange(m._id, "read")
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 text-red-500 mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="font-[family-name:var(--font-syne)] text-xl font-bold text-foreground">
          Administrator Access Required
        </h1>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          This inbox is strictly restricted to CNC DAO System Administrators.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
            Contact Inquiries & Messages
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View, manage, and respond to incoming inquiries submitted via the public Get In Touch page.
          </p>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "all"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-foreground">
            {counts.total}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Total Inquiries</div>
        </div>

        <div
          onClick={() => setActiveTab("unread")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "unread"
              ? "border-[#f0a830] bg-[#f0a830]/10"
              : "border-border bg-card hover:border-[#f0a830]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#f0a830]">
              {counts.unread}
            </span>
            <Mail className="h-4 w-4 text-[#f0a830]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Unread Inquiries</div>
        </div>

        <div
          onClick={() => setActiveTab("read")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "read"
              ? "border-[#a78bfa] bg-[#a78bfa]/10"
              : "border-border bg-card hover:border-[#a78bfa]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#a78bfa]">
              {counts.read}
            </span>
            <MailOpen className="h-4 w-4 text-[#a78bfa]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Read / In-Progress</div>
        </div>

        <div
          onClick={() => setActiveTab("resolved")}
          className={`cursor-pointer rounded-2xl border p-4 transition-all ${
            activeTab === "resolved"
              ? "border-[#1db954] bg-[#1db954]/10"
              : "border-border bg-card hover:border-[#1db954]/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold font-[family-name:var(--font-space-mono)] text-[#1db954]">
              {counts.resolved}
            </span>
            <CheckCircle className="h-4 w-4 text-[#1db954]" />
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Resolved</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: `All (${counts.total})` },
            { id: "unread", label: `Unread (${counts.unread})` },
            { id: "read", label: `Read (${counts.read})` },
            { id: "resolved", label: `Resolved (${counts.resolved})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? "bg-[#1db954] text-black font-bold"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sender, email, message..."
            className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-xs text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-[#1db954]/60"
          />
        </div>
      </div>

      {/* Messages Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Adjusted Polished Table Header */}
        <div className="hidden grid-cols-[1.4fr_1.4fr_2fr_1fr_auto] items-center gap-4 border-b border-border bg-muted/70 px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground md:grid">
          <span>Sender Name</span>
          <span>Contact Email</span>
          <span>Message Snippet</span>
          <span>Received Date</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="flex flex-col divide-y divide-border">
          {filteredMessages.length === 0 ? (
            <div className="px-5 py-12 text-center text-sm text-muted-foreground">
              {searchQuery
                ? "No inquiries matched your search."
                : "No inquiries in this category."}
            </div>
          ) : (
            filteredMessages.map((m: ContactMessageItem) => {
              if (!m) return null
              const isUnread = m.status === "unread"
              const isResolved = m.status === "resolved"
              const dateStr = formatDate(m.createdAt)
              const isLoading = actionLoadingId === m._id
              const initials = m.name ? String(m.name).slice(0, 2).toUpperCase() : "??"

              return (
                <div
                  key={m._id}
                  onClick={() => handleOpenMessage(m)}
                  className={`grid cursor-pointer grid-cols-1 gap-3 p-5 transition-colors hover:bg-card-hover md:grid-cols-[1.4fr_1.4fr_2fr_1fr_auto] md:items-center md:gap-4 ${
                    isUnread ? "bg-[#f0a830]/5" : ""
                  }`}
                >
                  {/* Sender */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        isUnread
                          ? "bg-[#f0a830]/20 text-[#f0a830]"
                          : isResolved
                            ? "bg-[#1db954]/20 text-[#1db954]"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`truncate text-sm ${isUnread ? "font-bold text-foreground" : "font-medium text-foreground"}`}>
                          {m.name || "Anonymous"}
                        </span>
                        {isUnread && (
                          <span className="h-2 w-2 rounded-full bg-[#f0a830]" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-muted-foreground md:hidden">Email:</div>
                    <span className="truncate text-xs font-mono text-muted-foreground hover:text-foreground">
                      {m.email || "—"}
                    </span>
                  </div>

                  {/* Message Snippet */}
                  <div className="min-w-0">
                    <div className="text-[11px] font-medium text-muted-foreground md:hidden">Message:</div>
                    <p className="truncate text-xs text-muted-foreground">
                      {m.message || "—"}
                    </p>
                  </div>

                  {/* Date & Status */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{dateStr}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isUnread
                          ? "bg-[#f0a830]/15 text-[#f0a830]"
                          : isResolved
                            ? "bg-[#1db954]/15 text-[#1db954]"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {m.status || "unread"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center justify-end gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleOpenMessage(m)}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Inspect full message"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <a
                      href={`mailto:${m.email || ""}?subject=Reply from CNC DAO Coordinator&body=Hi ${m.name || ""},%0D%0A%0D%0AThank you for reaching out to CNC DAO regarding your inquiry.%0D%0A%0D%0A`}
                      className="rounded-xl p-2 text-[#1db954] transition-colors hover:bg-[#1db954]/10"
                      title="Reply via Email"
                    >
                      <Reply className="h-4 w-4" />
                    </a>

                    {m.status !== "resolved" ? (
                      <button
                        disabled={isLoading}
                        onClick={() => handleStatusChange(m._id, "resolved")}
                        className="rounded-xl p-2 text-[#1db954] transition-colors hover:bg-[#1db954]/10 disabled:opacity-50"
                        title="Mark as Resolved"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        disabled={isLoading}
                        onClick={() => handleStatusChange(m._id, "unread")}
                        className="rounded-xl p-2 text-[#f0a830] transition-colors hover:bg-[#f0a830]/10 disabled:opacity-50"
                        title="Mark as Unread"
                      >
                        <Clock className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      disabled={isLoading}
                      onClick={() => handleDelete(m._id)}
                      className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                      title="Delete inquiry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Full Message Inspector Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-overlay p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">
                    {selectedMessage.name || "Anonymous"}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      selectedMessage.status === "unread"
                        ? "bg-[#f0a830]/15 text-[#f0a830]"
                        : selectedMessage.status === "resolved"
                          ? "bg-[#1db954]/15 text-[#1db954]"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {selectedMessage.status}
                  </span>
                </div>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="mt-0.5 block font-mono text-xs text-[#1db954] hover:underline"
                >
                  {selectedMessage.email}
                </a>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>

            <div className="my-4 max-h-[300px] overflow-y-auto rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Inquiry Message
              </p>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                {selectedMessage.message}
              </p>
            </div>

            <div className="mb-4 text-[11px] text-muted-foreground">
              Received: {formatDateTime(selectedMessage.createdAt)}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() =>
                  handleStatusChange(
                    selectedMessage._id,
                    selectedMessage.status === "resolved" ? "unread" : "resolved"
                  )
                }
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
              >
                {selectedMessage.status === "resolved" ? "Mark as Unread" : "Mark as Resolved"}
              </button>

              <a
                href={`mailto:${selectedMessage.email}?subject=Reply from CNC DAO&body=Hi ${selectedMessage.name},%0D%0A%0D%0A`}
                className="flex items-center gap-1.5 rounded-xl bg-[#1db954] px-5 py-2 text-xs font-bold text-black hover:bg-[#1db954]/90"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>Reply via Email</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
