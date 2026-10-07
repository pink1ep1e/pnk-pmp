import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "@/lib/icons"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 font-[family-name:var(--font-manrope)]",
  {
    variants: {
      variant: {
        default:
          "bg-[#1e69ff] text-white hover:bg-[#1557d6] shadow-[0_0_20px_rgba(30,105,255,0.25)]",
        destructive: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
        outline: "bg-transparent border border-white/[0.08] text-white hover:bg-white/[0.04]",
        secondary:
          "bg-[#0f131a] border border-white/[0.06] text-white hover:bg-[#121722]",
        soft: "bg-[#1e69ff]/15 text-[#6ba3ff] hover:bg-[#1e69ff]/25",
        ghost: "hover:bg-white/[0.04] hover:text-white text-white/70",
        link: "text-[#6ba3ff] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 rounded-full",
        sm: "h-9 rounded-full px-3.5 text-[13px]",
        lg: "h-12 px-8 text-[16px] rounded-full",
        auth: "h-[54px] px-8 text-[17px] rounded-[12px]",
        icon: "h-10 w-10 rounded-[12px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, disabled, loading, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {!loading ? children : <Loader2 className="w-5 h-5 animate-spin" size={20} />}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
