import { cn } from "@/lib/utils"

export function Sparkline({
  points,
  className,
  color = "#1e69ff",
  fill = true,
}: {
  points: number[]
  className?: string
  color?: string
  fill?: boolean
}) {
  const w = 88
  const h = 32
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min || 1
  const coords = points.map((p, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * w
    const y = h - ((p - min) / range) * (h - 6) - 3
    return [x, y] as const
  })
  const line = coords
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ")
  const area = `${line} L${w},${h} L0,${h} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full h-8", className)} preserveAspectRatio="none">
      {fill ? <path d={area} fill={color} opacity="0.18" /> : null}
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Trend({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const up = value >= 0
  return (
    <span className={cn("text-[12px] font-semibold", up ? "text-[#22c55e]" : "text-[#ef4444]")}>
      {up ? "+" : ""}
      {value}
      {suffix}
    </span>
  )
}

export function StatusDot({
  ok,
  label,
}: {
  ok?: boolean
  label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] font-medium">
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          ok !== false ? "bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.45)]" : "bg-[#ef4444]",
        )}
      />
      <span className={ok !== false ? "text-[#22c55e]" : "text-[#ef4444]"}>{label}</span>
    </span>
  )
}

export function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode
  tone?: "neutral" | "blue" | "red" | "green" | "amber"
}) {
  const tones = {
    neutral: "bg-white/[0.06] text-white/65 border border-white/[0.06]",
    blue: "bg-[#1e69ff]/15 text-[#6ba3ff] border border-[#1e69ff]/20",
    red: "bg-[#ef4444]/15 text-[#f87171] border border-[#ef4444]/20",
    green: "bg-[#22c55e]/15 text-[#4ade80] border border-[#22c55e]/20",
    amber: "bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/20",
  }
  return (
    <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", tones[tone])}>
      {children}
    </span>
  )
}

export function IconWell({
  children,
  className,
  color = "bg-[#1e69ff]/15 text-[#6ba3ff]",
}: {
  children: React.ReactNode
  className?: string
  color?: string
}) {
  return (
    <div
      className={cn(
        "h-10 w-10 rounded-[12px] flex items-center justify-center shrink-0",
        color,
        className,
      )}
    >
      {children}
    </div>
  )
}

export function Surface({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-[#0f131a] border border-white/[0.06]",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function MetricCard({
  label,
  value,
  trend,
  spark,
  icon,
  sparkColor,
  hint,
  footer,
}: {
  label: string
  value: React.ReactNode
  trend?: number
  spark?: number[]
  icon?: React.ReactNode
  sparkColor?: string
  hint?: string
  footer?: React.ReactNode
}) {
  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {icon}
          <p className="text-[12px] text-white/45 truncate">{label}</p>
        </div>
        {typeof trend === "number" ? <Trend value={trend} /> : null}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display font-semibold text-[24px] tracking-[-0.03em] leading-none truncate">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-[12px] text-white/35">{hint}</p> : null}
          {footer}
        </div>
        {spark ? (
          <div className="w-[80px] shrink-0 opacity-95">
            <Sparkline points={spark} color={sparkColor} />
          </div>
        ) : null}
      </div>
    </Surface>
  )
}

export function PageTitle({
  title,
  description,
  actions,
  icon,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
      <div className="flex items-start gap-3 min-w-0">
        {icon ? (
          <div className="h-11 w-11 rounded-[14px] bg-[#1e69ff]/15 text-[#6ba3ff] flex items-center justify-center shrink-0">
            {icon}
          </div>
        ) : null}
        <div className="min-w-0">
          <h1 className="font-display font-semibold text-[24px] md:text-[28px] tracking-[-0.03em]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-[14px] text-white/45 max-w-[560px] leading-relaxed">{description}</p>
          ) : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
    </div>
  )
}

export function SectionTitle({
  children,
  actions,
}: {
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3 px-0.5">
      <h2 className="font-display font-semibold text-[16px] tracking-[-0.02em]">{children}</h2>
      {actions}
    </div>
  )
}

export function DataTable({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full text-left text-[14px]">{children}</table>
    </div>
  )
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("px-4 py-3 font-medium text-[12px] text-white/40 whitespace-nowrap", className)}>
      {children}
    </th>
  )
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3.5 border-t border-white/[0.04]", className)}>{children}</td>
}

export function RingProgress({
  value,
  size = 72,
  color = "#1e69ff",
  label,
}: {
  value: number
  size?: number
  color?: string
  label?: string
}) {
  const r = 15
  const c = 2 * Math.PI * r
  const v = Math.min(100, Math.max(0, value))
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${(v / 100) * c} ${c}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">
        <span className="text-[13px] font-semibold">{Math.round(v)}%</span>
        {label ? <span className="text-[9px] text-white/35 px-1">{label}</span> : null}
      </span>
    </div>
  )
}

export function Pagination({
  page = 1,
  totalPages = 5,
  perPage = 10,
}: {
  page?: number
  totalPages?: number
  perPage?: number
}) {
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1)
  return (
    <div className="px-4 py-3 flex items-center justify-between gap-3 border-t border-white/[0.04]">
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={cn(
              "h-8 min-w-8 px-2 rounded-[8px] text-[13px] font-semibold",
              p === page ? "bg-[#1e69ff] text-white" : "text-white/40 hover:text-white hover:bg-white/[0.04]",
            )}
          >
            {p}
          </button>
        ))}
      </div>
      <select className="h-8 rounded-[8px] bg-[#0a0d14] border border-white/[0.06] px-2 text-[12px] text-white/50 outline-none">
        <option>{perPage} на странице</option>
        <option>25 на странице</option>
        <option>50 на странице</option>
      </select>
    </div>
  )
}

export function AreaChart({
  series,
  height = 180,
}: {
  series: { color: string; points: number[] }[]
  height?: number
}) {
  const w = 600
  const h = height
  const max = Math.max(...series.flatMap((s) => s.points), 1)

  function path(points: number[], fill = false) {
    const coords = points.map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w
      const y = h - (p / max) * (h - 20) - 10
      return [x, y] as const
    })
    const line = coords
      .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(" ")
    if (!fill) return line
    return `${line} L${w},${h} L0,${h} Z`
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {series.map((s, i) => (
        <g key={i}>
          <path d={path(s.points, true)} fill={s.color} opacity="0.12" />
          <path d={path(s.points)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}
