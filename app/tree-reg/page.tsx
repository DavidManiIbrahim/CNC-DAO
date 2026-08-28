"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { Reveal } from "@/components/Reveal"
import { IconArrow, IconGPS, IconCheck } from "@/components/Icons"
import { useSessionUser } from "@/lib/useAuth"

const speciesOptions = [
  "Neem",
  "Mango",
  "Baobab",
  "Mahogany",
  "Iroko",
  "Gmelina",
  "Cashew",
  "Other",
]

const landOwnership = [
  "I own this land",
  "Community/communal land",
  "Government/public land",
  "I have permission from the owner",
]

export default function TreeRegPage() {
  const router = useRouter()
  const { data: googleSession } = useSession()
  const registerTree = useMutation(api.trees.register)
  const user = useSessionUser()
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [step, setStep] = useState(1)
  const [coords, setCoords] = useState<{ lat: string; lng: string }>({ lat: "", lng: "" })
  const [treeName, setTreeName] = useState("")
  const [species, setSpecies] = useState("")
  const [city, setCity] = useState("")
  const [country, setCountry] = useState("")
  const [geoStatus, setGeoStatus] = useState<"idle" | "locating" | "granted" | "denied" | "unsupported">(
    "idle"
  )

  function requestLocation() {
    if (!("geolocation" in navigator)) {
      setGeoStatus("unsupported")
      return
    }
    setGeoStatus("locating")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
        })
        setGeoStatus("granted")
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true }
    )
  }

  return (
    <main className="bg-background text-foreground font-[family-name:var(--font-space-grotesk)]">
      <Header />

      <section className="px-6 pb-16 pt-20 text-center md:px-16 md:pt-28">
        <Reveal>
          <p className="mb-4 font-[family-name:var(--font-space-mono)] text-xs font-bold uppercase tracking-[0.15em] text-[#f0a830]">
            Tree Registration
          </p>
          <h1 className="mx-auto mb-6 max-w-2xl font-[family-name:var(--font-dm-sans)] text-[36px] font-medium leading-tight tracking-[-0.02em] md:text-[52px]">
            Put your tree on record
          </h1>
          <p className="mx-auto max-w-xl leading-[1.6] text-muted-foreground">
            Complete the details below to submit your planting. Once verified by two
            Nature Heroes, your tree will be minted permanently on Solana.
          </p>
        </Reveal>
      </section>

      <section className="px-6 pb-24 md:px-16">
        <Reveal>
          <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-6 shadow-xl md:p-10">
            {submitted ? (
              <div className="py-12 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1db954]/15">
                  <IconCheck className="h-7 w-7 text-[#1db954]" />
                </div>
                <h2 className="mb-2 font-[family-name:var(--font-syne)] text-2xl font-bold text-foreground">
                  Tree submitted for verification
                </h2>
                <p className="mx-auto max-w-md text-sm text-muted-foreground">
                  Your submission has entered the validation queue. Two Nature Heroes
                  will review your tree in person before it is written on-chain.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                  <Link
                    href="/dashboard/verification"
                    className="rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black hover:bg-[#1db954]/90"
                  >
                    View in Queue
                  </Link>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setStep(1)
                      setTreeName("")
                      setSpecies("")
                      setCity("")
                      setCountry("")
                      setCoords({ lat: "", lng: "" })
                    }}
                    className="rounded-full border border-border bg-muted px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted/80"
                  >
                    Register another
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Step indicator */}
                <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
                  {[
                    { n: 1, label: "Details" },
                    { n: 2, label: "Location" },
                    { n: 3, label: "Photos" },
                    { n: 4, label: "Planter" },
                  ].map((s) => (
                    <div key={s.n} className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full font-[family-name:var(--font-space-mono)] text-xs font-bold ${
                          step >= s.n
                            ? "bg-[#1db954] text-black"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {s.n}
                      </div>
                      <span
                        className={`hidden text-xs font-semibold sm:inline ${
                          step >= s.n ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (step < 4) {
                      setStep(step + 1)
                      return
                    }
                    setSubmitError("")
                    setSubmitting(true)
                    try {
                      const walletAddress =
                        user?.walletAddress ??
                        (googleSession?.user?.email
                          ? `google:${googleSession.user.email}`
                          : "no-wallet")
                      const lat = parseFloat(coords.lat)
                      const lng = parseFloat(coords.lng)
                      if (isNaN(lat) || isNaN(lng)) {
                        setSubmitError("Please provide valid coordinates")
                        return
                      }
                      await registerTree({
                        walletAddress,
                        name: treeName || "Unnamed tree",
                        species: species || "Unspecified",
                        location: `${city}, ${country}`.replace(/^, |, $/, ""),
                        lat,
                        lng,
                      })
                      setSubmitted(true)
                    } catch (err) {
                      setSubmitError(
                        err instanceof Error ? err.message : "Something went wrong"
                      )
                    } finally {
                      setSubmitting(false)
                    }
                  }}
                  className="flex flex-col gap-6"
                >
                  {step === 1 && (
                    <div className="flex flex-col gap-5">
                      <SectionHeading title="Tree Details" subtitle="What did you plant?" />
                      <Field
                        label="Tree name"
                        placeholder="Give this tree a name, e.g. Grandma's Neem"
                        required
                        value={treeName}
                        onChange={setTreeName}
                      />
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground">
                          Species / type
                        </label>
                        <input
                          list="species-suggestions"
                          placeholder="Type a species — e.g. Neem, Mango, or anything else"
                          required
                          value={species}
                          onChange={(e) => setSpecies(e.target.value)}
                          className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
                        />
                        <datalist id="species-suggestions">
                          {speciesOptions.map((s) => (
                            <option key={s} value={s} />
                          ))}
                        </datalist>
                      </div>
                      <Field label="Planting date" type="date" required />
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Approx. height (m)"
                          type="number"
                          placeholder="1.5"
                          value={formData.height}
                          onChange={(v) => handleChange("height", v)}
                        />
                        <Field
                          label="Approx. age"
                          placeholder="e.g. 6 months"
                          value={formData.age}
                          onChange={(v) => handleChange("age", v)}
                        />
                      </div>
                      <TextArea
                        label="Additional notes"
                        placeholder="Anything else Nature Heroes should know — soil type, nearby landmarks, etc."
                        value={formData.notes}
                        onChange={(v) => handleChange("notes", v)}
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="flex flex-col gap-5">
                      <SectionHeading title="Location" subtitle="Where is it planted?" />
                      <button
                        type="button"
                        onClick={requestLocation}
                        className="flex items-center justify-center gap-2 rounded-xl border border-[#1db954]/40 bg-[#1db954]/10 py-3 text-sm font-bold text-[#1db954] transition-colors hover:bg-[#1db954]/20"
                      >
                        <IconGPS className="h-4 w-4" />
                        {geoStatus === "locating" ? "Locating…" : "Use my current location"}
                      </button>
                      {geoStatus === "denied" && (
                        <p className="rounded-xl border border-[#f0a830]/30 bg-[#f0a830]/10 px-4 py-3 text-xs text-[#f0a830]">
                          Location access is turned off. Enable location permissions
                          for this site in your browser settings, then try again — or
                          enter coordinates manually below.
                        </p>
                      )}
                      {geoStatus === "unsupported" && (
                        <p className="rounded-xl border border-border bg-muted px-4 py-3 text-xs text-muted-foreground">
                          Location isn't available on this device/browser. Enter
                          coordinates manually below.
                        </p>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <Field
                          label="Latitude"
                          placeholder="6.5244"
                          required
                          value={coords.lat}
                          onChange={(v) => setCoords((c) => ({ ...c, lat: v }))}
                        />
                        <Field
                          label="Longitude"
                          placeholder="3.3792"
                          required
                          value={coords.lng}
                          onChange={(v) => setCoords((c) => ({ ...c, lng: v }))}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="City/Town" placeholder="Lagos" required value={city} onChange={setCity} />
                        <Field label="Country" placeholder="Nigeria" required value={country} onChange={setCountry} />
                      </div>
                      <Select
                        label="Land ownership"
                        options={landOwnership}
                        value={formData.landOwnership}
                        onChange={(v) => handleChange("landOwnership", v)}
                        required
                      />
                    </div>
                  )}

                  {step === 3 && (
                    <div className="flex flex-col gap-5">
                      <SectionHeading
                        title="Photo Evidence"
                        subtitle="Clear photos help Nature Heroes verify faster"
                      />
                      <UploadBox label="Full tree photo" required />
                      <UploadBox label="Close-up of leaves/trunk" />
                      <UploadBox label="Photo showing surrounding landmarks" />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="flex flex-col gap-5">
                      <SectionHeading
                        title="Planter Info"
                        subtitle="Who gets credit for this tree?"
                      />
                      <Field
                        label="Full name"
                        value={formData.planterName}
                        onChange={(v) => handleChange("planterName", v)}
                        required
                      />
                      <Field
                        label="Email"
                        type="email"
                        value={formData.planterEmail}
                        onChange={(v) => handleChange("planterEmail", v)}
                        required
                      />
                      <div>
                        <label className="mb-2 block text-sm font-semibold text-foreground">
                          Wallet address
                        </label>
                        <input
                          placeholder="Connect your wallet to auto-fill"
                          disabled
                          value={user?.walletAddress ?? ""}
                          className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-mono text-muted-foreground outline-none"
                        />
                      </div>
                      <label className="flex items-start gap-3 text-sm text-muted-foreground">
                        <input type="checkbox" required className="mt-1" />
                        <span>
                          I confirm this information is accurate and understand that
                          verified submissions are permanently recorded on-chain.
                        </span>
                      </label>
                    </div>
                  )}

                  <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={() => setStep(step - 1)}
                        className="text-sm font-semibold text-muted-foreground hover:text-foreground"
                      >
                        Back
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center gap-2 rounded-full bg-[#1db954] px-6 py-3 text-sm font-bold text-black transition-transform duration-200 hover:scale-105 disabled:opacity-50"
                    >
                      {step < 4 ? "Continue" : submitting ? "Submitting…" : "Submit for verification"}
                      <IconArrow className="h-4 w-4 rotate-45" />
                    </button>
                  </div>
                  {submitError && (
                    <p className="mt-3 text-center text-sm text-red-400">{submitError}</p>
                  )}
                </form>
              </>
            )}
          </div>
        </Reveal>
      </section>

      <Footer />
    </main>
  )
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-2">
      <h2 className="font-[family-name:var(--font-syne)] text-lg font-bold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  )
}

function Field({
  label,
  placeholder,
  type = "text",
  required = false,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
      />
    </div>
  )
}

function TextArea({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">{label}</label>
      <textarea
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
      />
    </div>
  )
}

function Select({
  label,
  options,
  required = false,
  value,
  onChange,
}: {
  label: string
  options: string[]
  required?: boolean
  value?: string
  onChange?: (value: string) => void
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">{label}</label>
      <select
        required={required}
        defaultValue=""
        className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-[#1db954]/60"
      >
        <option value="" disabled>
          Select an option
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function UploadBox({ label, required = false }: { label: string; required?: boolean }) {
  const [fileName, setFileName] = useState("")
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-[#f0a830]">*</span>}
      </label>
      <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-sm text-muted-foreground transition-colors hover:border-[#1db954]/50 hover:text-foreground">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          required={required}
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        {fileName ? (
          <span className="max-w-full truncate px-4 font-semibold text-[#1db954]">{fileName}</span>
        ) : (
          "Tap to upload"
        )}
      </label>
    </div>
  )
}
