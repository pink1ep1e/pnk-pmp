import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-[18px] bg-[#1a1c22] p-4 md:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] text-white/45 font-[family-name:var(--font-manrope)]">{label}</p>
        {icon ? (
          <div className="h-9 w-9 rounded-[12px] bg-[#24262e] flex items-center justify-center text-white/55">
            {icon}
          </div>
        ) : null}
      </div>
      <p className="mt-3 font-display font-semibold text-[26px] md:text-[30px] tracking-[-0.03em] leading-none">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[13px] text-white/35 font-[family-name:var(--font-manrope)]">{hint}</p>
      ) : null}
    </div>
  )
}
