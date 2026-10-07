import React from "react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Props {
  className?: string
  href?: string | null
  variant?: "large" | "small"
  width?: number
  height?: number
  priority?: boolean
}

export const Logo: React.FC<Props> = ({
  className,
  href = "/",
  variant = "large",
  width,
  height,
  priority = false,
}) => {
  const src = variant === "small" ? "/pmp-small-logo.svg" : "/pmp-large-logo.svg"
  const size =
    variant === "small"
      ? { width: width ?? 40, height: height ?? 40 }
      : { width: width ?? 200, height: height ?? 56 }

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
