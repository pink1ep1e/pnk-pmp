import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "rounded-[20px] bg-[#16181f] p-5 md:p-6 border border-white/[0.03]",
        className,
      )}
    >
      <p className="text-[13px] text-white/45 font-[family-name:var(--font-manrope)]">{label}</p>
      <p className="mt-2 font-display font-bold text-[28px] md:text-[32px] tracking-[-0.03em] leading-none">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[13px] text-white/35 font-[family-name:var(--font-manrope)]">{hint}</p>
      ) : null}
    </div>
  )
}
