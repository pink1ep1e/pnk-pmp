import Link from "next/link"
import { cn } from "@/lib/utils"

/** Elevated surface — fill only, no border (pnk-id Card). */
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("rounded-[18px] bg-[#1a1c22] overflow-hidden", className)}>
      {children}
    </div>
  )
}

export function PanelTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <h2
      className={cn(
        "font-display font-semibold text-[17px] md:text-[18px] tracking-[-0.02em] px-4 pt-4 md:px-5 md:pt-5",
        className,
      )}
    >
      {children}
    </h2>
  )
}

export function Row({
  children,
  className,
  href,
}: {
  children: React.ReactNode
  className?: string
  href?: string
}) {
  const classes = cn(
    "min-h-[64px] px-4 md:px-5 flex items-center gap-3 transition-colors duration-100",
    href && "hover:bg-white/[0.03]",
    className,
  )
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }
  return <div className={classes}>{children}</div>
}
