import React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  href?: string | null
  /** text+badge as in mock; mark = icon only */
  variant?: "mark" | "full" | "large" | "small"
  width?: number
  height?: number
  priority?: boolean
}

export const Logo: React.FC<Props> = ({
  className,
  href = "/",
  variant = "full",
  width,
  height,
  priority = false,
}) => {
  if (variant === "full" || variant === "large") {
    const inner = (
      <span className={cn("inline-flex items-center gap-2", className)}>
        <Image
          src="/pmp-small-logo.svg"
          alt=""
          width={width ?? 28}
          height={height ?? 28}
          priority={priority}
          className="select-none object-contain"
        />
        <span className="font-display font-semibold text-[18px] tracking-[-0.02em] text-white">
          pnk
        </span>
        <span className="rounded-full bg-[#0066ff] px-2 py-0.5 text-[11px] font-bold tracking-wide text-white">
          PMP
        </span>
      </span>
    )
    if (href === null) return inner
    return (
      <Link href={href} className="inline-flex shrink-0 items-center" aria-label="pmp">
        {inner}
      </Link>
    )
  }

  const src = "/pmp-small-logo.svg"
  const size = { width: width ?? 32, height: height ?? 32 }
  const image = (
    <Image
      src={src}
      alt="pmp"
      width={size.width}
      height={size.height}
      priority={priority}
      className={cn("select-none object-contain", className)}
    />
  )
  if (href === null) return image
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="pmp">
      {image}
    </Link>
  )
}
