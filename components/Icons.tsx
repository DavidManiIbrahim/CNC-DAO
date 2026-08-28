// Icons ported directly from the SVG path data embedded in the live Framer
// site's markup (the <svg id="..."> template defs). These are generic UI
// icons (checkmarks, GPS pin, clock, link, social glyphs), not stylized
// illustration or branded artwork.

export function IconGPS({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      <rect width="36" height="36" rx="8" fill="#C8DEC9" />
      <path
        d="M18 19C19.6569 19 21 17.6569 21 16C21 14.3431 19.6569 13 18 13C16.3431 13 15 14.3431 15 16C15 17.6569 16.3431 19 18 19Z"
        stroke="#2D6A30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 10C14.7 10 12 12.7 12 16C12 20.5 18 26 18 26C18 26 24 20.5 24 16C24 12.7 21.3 10 18 10Z"
        stroke="#2D6A30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconRealtime({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      <rect width="36" height="36" rx="8" fill="#C8DEC9" />
      <path
        d="M18 10V15M22.2 13.8L18.7 17.3M26 18H21M22.2 22.2L18.7 18.7M18 26V21M13.8 22.2L17.3 18.7M10 18H15M13.8 13.8L17.3 17.3"
        stroke="#2D6A30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconOnChain({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" fill="none" className={className}>
      <rect width="36" height="36" rx="8" fill="#C8DEC9" />
      <path
        d="M23 14H13C11.8954 14 11 14.8954 11 16V22C11 23.1046 11.8954 24 13 24H23C24.1046 24 25 23.1046 25 22V16C25 14.8954 24.1046 14 23 14Z"
        stroke="#2D6A30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 14V13C14 11.9391 14.4214 10.9217 15.1716 10.1716C15.9217 9.42143 16.9391 9 18 9C19.0609 9 20.0783 9.42143 20.8284 10.1716C21.5786 10.9217 22 11.9391 22 13V14"
        stroke="#2D6A30"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="18" cy="19" r="1" fill="#2D6A30" />
    </svg>
  )
}

export function IconCheck({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" className={className}>
      <circle cx="14" cy="14" r="14" fill="#C8DEC9" />
      <path d="M9 14L12 17L19 10" stroke="#2D6A30" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const stepIconPaths: Record<number, string> = {
  1: "M33 27V31C33 31.5304 32.7893 32.0391 32.4142 32.4142C32.0391 32.7893 31.5304 33 31 33H17C16.4696 33 15.9609 32.7893 15.5858 32.4142C15.2107 32.0391 15 31.5304 15 31V27M19 20L24 15L29 20M24 15V27",
  2: "M29.5181 33V31C29.5181 29.9391 29.0966 28.9217 28.3465 28.1716C27.5963 27.4214 26.5789 27 25.5181 27H17.5181C16.4572 27 15.4398 27.4214 14.6896 28.1716C13.9395 28.9217 13.5181 29.9391 13.5181 31V33M35.5181 33V31C35.5174 30.1137 35.2224 29.2528 34.6794 28.5523C34.1364 27.8519 33.3762 27.3516 32.5181 27.13M28.5181 15.13C29.3785 15.3503 30.1411 15.8507 30.6857 16.5523C31.2303 17.2539 31.5259 18.1168 31.5259 19.005C31.5259 19.8932 31.2303 20.7561 30.6857 21.4577C30.1411 22.1593 29.3785 22.6597 28.5181 22.88M21.5181 23C22.5789 23 23.5963 22.5786 24.3465 21.8284C25.0966 21.0783 25.5181 20.0609 25.5181 19C25.5181 17.9391 25.0966 16.9217 24.3465 16.1716C23.5963 15.4214 22.5789 15 21.5181 15C20.4572 15 19.4398 15.4214 18.6896 16.1716C17.9395 16.9217 17.5181 17.9391 17.5181 19C17.5181 20.0609 17.9395 21.0783 18.6896 21.8284C19.4398 22.5786 20.4572 23 21.5181 23Z",
  3: "M24.5181 27C26.1749 27 27.5181 25.6569 27.5181 24C27.5181 22.3431 26.1749 21 24.5181 21C22.8612 21 21.5181 22.3431 21.5181 24C21.5181 25.6569 22.8612 27 24.5181 27ZM24.5181 13V17M24.5181 31V35M16.7381 16.22L19.5681 19.05M29.4681 28.95L32.2981 31.78M13.5181 24H17.5181M31.5181 24H35.5181M16.7381 31.78L19.5681 28.95M29.4681 19.05L32.2981 16.22",
  4: "M31.5181 23H17.5181C16.4135 23 15.5181 23.8954 15.5181 25V32C15.5181 33.1046 16.4135 34 17.5181 34H31.5181C32.6226 34 33.5181 33.1046 33.5181 32V25C33.5181 23.8954 32.6226 23 31.5181 23ZM19.5181 23V19C19.5181 17.6739 20.0449 16.4021 20.9825 15.4645C21.9202 14.5268 23.192 14 24.5181 14C25.8441 14 27.1159 14.5268 28.0536 15.4645C28.9913 16.4021 29.5181 17.6739 29.5181 19V23",
  5: "M24.5181 34C30.0409 34 34.5181 29.5228 34.5181 24C34.5181 18.4772 30.0409 14 24.5181 14C18.9952 14 14.5181 18.4772 14.5181 24C14.5181 29.5228 18.9952 34 24.5181 34ZM14.5181 24H34.5181M24.5181 14C27.0193 16.7384 28.4408 20.292 28.5181 24C28.4408 27.708 27.0193 31.2616 24.5181 34C22.0168 31.2616 20.5953 27.708 20.5181 24C20.5953 20.292 22.0168 16.7384 24.5181 14Z",
  6: "M32 15H16C14.8954 15 14 15.8954 14 17V27C14 28.1046 14.8954 29 16 29H32C33.1046 29 34 28.1046 34 27V17C34 15.8954 33.1046 15 32 15ZM20 33H28M24 29V33M19 20L22 23L29 16",
}

export function StepIcon({ step, className = "" }: { step: 1 | 2 | 3 | 4 | 5 | 6; className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className}>
      <rect width="48" height="48" rx="8" fill="white" fillOpacity="0.1" />
      <path
        d={stepIconPaths[step]}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
export function IconArrow({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const socialPaths: Record<string, string> = {
  linkedin:
    "M6 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM4 9h4v13H4V9Zm6 0h4v2a4 4 0 0 1 4-2c3 0 5 2 5 6v9h-4v-9a2 2 0 0 0-4 0v9h-4V9Z",
  x: "M7.1 3H3l6.7 9-6.4 9h3.9l4.6-6.4 4.9 6.4H21l-7-9.4L20 3h-3.9l-4.1 5.7L7.1 3Z",
  instagram:
    "M6 2h12a4 4 0 0 1 4 4v12a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Zm10.4 3.6a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM12 7.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z",
  facebook:
    "M13 3h3v4h-2c-1 0-1 1-1 1.6V11h3l-.5 4H13v8h-4v-8H7v-4h2V7.5C9 5 10.5 3 13 3Z",
  youtube:
    "M22.5 6.5a3 3 0 0 0-2.1-2.1C18.6 4 12 4 12 4s-6.6 0-8.4.4A3 3 0 0 0 1.5 6.5 31 31 0 0 0 1 12a31 31 0 0 0 .5 5.5 3 3 0 0 0 2.1 2.1C5.4 20 12 20 12 20s6.6 0 8.4-.4a3 3 0 0 0 2.1-2.1A31 31 0 0 0 23 12a31 31 0 0 0-.5-5.5ZM9.8 15.5v-7l6 3.5-6 3.5Z",
}

export function SocialIcon({ name, className = "" }: { name: keyof typeof socialPaths; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d={socialPaths[name]} />
    </svg>
  )
}

const badgePaths: Record<string, string> = {
  seed: "M12 21c-4.4 0-8-3.6-8-8 0-6 8-11 8-11s8 5 8 11c0 4.4-3.6 8-8 8Z",
  leaf: "M4 20c8-1 13-6 14-14-8 1-13 6-14 14Zm0 0c2-4 4-6 8-8",
  shield: "M12 3l7 3v6c0 4.5-3 8.5-7 9-4-.5-7-4.5-7-9V6l7-3Zm-3 9l2 2 4-4",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18",
  star: "M12 2l2.9 6.3 6.9.7-5.2 4.7 1.6 6.8L12 17l-6.2 3.5 1.6-6.8L2.2 9l6.9-.7L12 2Z",
  crown: "M3 8l4 3 5-6 5 6 4-3-2 11H5L3 8Zm2 13h14",
  sparkles: "M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4L12 2Z",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
}

export function BadgeIcon({
  name,
  className = "",
}: {
  name: keyof typeof badgePaths
  className?: string
}) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path d={badgePaths[name]} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
