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
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
      <div>
        <h1 className="font-display font-bold text-[28px] md:text-[36px] tracking-[-0.03em] leading-tight">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-[15px] md:text-[16px] text-white/50 font-[family-name:var(--font-manrope)] max-w-[640px]">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
