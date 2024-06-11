import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "~~/utils/xchange/cn"

export interface DotsProps extends React.ButtonHTMLAttributes<HTMLSpanElement> {
  asChild?: boolean
  children?: React.ReactNode
  className?: string
}

const Dots = React.forwardRef<HTMLButtonElement, DotsProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "span"

    return (
      <Comp
        ref={ref}
        className={cn(
          "after:animate-ellipsis after:inline-block after:w-4 after:text-left",
          className
        )}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)

Dots.displayName = "Dots"

export { Dots }
