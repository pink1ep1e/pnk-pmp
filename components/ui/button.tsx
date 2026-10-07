import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[12px] text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-[family-name:var(--font-manrope)]",
  {
    variants: {
      variant: {
        default: "bg-[#0066ff] text-white hover:bg-[#0052cc]",
        destructive: "bg-[#ef4444] text-white hover:bg-[#dc2626]",
        outline: "bg-transparent text-white hover:bg-white/10",
        secondary: "bg-[#24262e] text-[#4d9fff] hover:bg-[#2a2d36]",
        ghost: "hover:bg-white/10 hover:text-white",
        link: "text-[#0066ff] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-8 rounded-[10px] px-3 text-xs",
        lg: "h-14 px-8 text-[17px]",
        icon: "h-10 w-10",
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
        {!loading ? children : <Loader2 className="w-5 h-5 animate-spin" />}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
