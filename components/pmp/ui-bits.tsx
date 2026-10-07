import { cn } from "@/lib/utils"

export function Sparkline({
  points,
  className,
  color = "#0066ff",
}: {
  points: number[]
  className?: string
  color?: string
}) {
  const w = 80
  const h = 28
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const range = max - min || 1
  const d = points
    .map((p, i) => {
      const x = (i / Math.max(points.length - 1, 1)) * w
      const y = h - ((p - min) / range) * (h - 4) - 2
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn("w-full h-7", className)} preserveAspectRatio="none">
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function Trend({ value }: { value: number }) {
  const up = value >= 0
  return (
    <span className={cn("text-[12px] font-semibold", up ? "text-[#3dd68c]" : "text-[#ff5c5c]")}>
      {up ? "+" : ""}
      {value}%
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
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium">
      <span
        className={cn("h-1.5 w-1.5 rounded-full", ok !== false ? "bg-[#3dd68c]" : "bg-[#ff5c5c]")}
      />
      <span className={ok !== false ? "text-[#3dd68c]" : "text-[#ff5c5c]"}>{label}</span>
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
    neutral: "bg-white/10 text-white/70",
    blue: "bg-[#0066ff]/20 text-[#4d9fff]",
    red: "bg-[#ff5c5c]/15 text-[#ff8a8a]",
    green: "bg-[#3dd68c]/15 text-[#3dd68c]",
    amber: "bg-[#f5a524]/15 text-[#f5a524]",
  }
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", tones[tone])}>
      {children}
    </span>
  )
}

export function IconWell({
  children,
  className,
  color = "bg-[#0066ff]/15 text-[#4d9fff]",
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
    <div className={cn("rounded-[16px] bg-[#12151c]", className)}>{children}</div>
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
}: {
  label: string
  value: React.ReactNode
  trend?: number
  spark?: number[]
  icon?: React.ReactNode
  sparkColor?: string
  hint?: string
}) {
  return (
    <Surface className="p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] text-white/45">{label}</p>
        {icon}
      </div>
      <div className="mt-2 flex items-end justify-between gap-2">
        <div>
          <p className="font-display font-semibold text-[22px] tracking-[-0.03em] leading-none">
            {value}
          </p>
          {hint ? <p className="mt-1.5 text-[12px] text-white/35">{hint}</p> : null}
          {typeof trend === "number" ? (
            <div className="mt-1.5">
              <Trend value={trend} />
            </div>
          ) : null}
        </div>
        {spark ? (
          <div className="w-[72px] opacity-90">
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
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="font-display font-semibold text-[24px] md:text-[28px] tracking-[-0.03em]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-[14px] text-white/45 max-w-[520px]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
    </div>
  )
}
