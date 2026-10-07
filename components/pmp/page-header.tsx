export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 md:mb-7">
      <div>
        <h1 className="font-display font-semibold text-[22px] md:text-[28px] tracking-[-0.03em] leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-[14px] md:text-[15px] text-white/45 font-[family-name:var(--font-manrope)] max-w-[560px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
