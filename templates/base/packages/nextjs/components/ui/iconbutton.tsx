import * as React from "react"
import type { buttonVariants } from "./button"
import { buttonIconVariants } from "./button"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"
import type { ExtractProps, IconComponent } from "./types"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"
import { cn } from "~~/utils/xchange/cn"

const iconButtonVariants = cva(
  "rounded-full cursor-pointer whitespace-nowrap inline-flex gap-2 items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-green-500",
  {
    variants: {
      variant: {
        default:
          "bg-green-500 hover:bg-green-600 focus:bg-green-700 active:bg-green-600 text-white",
        destructive:
          "bg-red-500 hover:bg-red-600 focus:bg-red-700 active:bg-red-600 text-white",
        warning:
          "bg-amber-400 hover:bg-amber-500 focus:bg-amber-600 active:bg-amber-500 text-amber-900",
        outline:
          "border dark:border-zinc-200/5 border-zinc-900/5 hover:bg-muted focus:bg-accent",
        primary:
          "bg-green-700 border border-transparent text-white hover:bg-green-900",
        border: "",
        secondary: "bg-secondary dark:hover:bg-muted focus:bg-accent",
        ghost: "hover:bg-secondary focus:bg-accent",
        link: "text-green-500 hover:text-green-700 font-semibold !p-0 !h-[unset] !min-h-[unset]",
      },
      size: {
        xs: "min-h-[26px] h-[26px] min-w-[26px] w-[26px] text-xs",
        sm: "min-h-[36px] h-[36px] min-w-[36px] w-[36px] text-sm",
        default: "min-h-[40px] h-[40px] min-w-[40px] w-[40px] text-sm",
        lg: "min-h-[44px] h-[44px] min-w-[44px] w-[44px",
        xl: "min-h-[52px] h-[52px] min-w-[52px] w-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon: IconComponent | string | LucideIcon
  iconProps?: ExtractProps<React.ElementType<IconComponent>> & {
    width?: number
    height?: number
    className?: string
  }
  name: string
  description?: string
  asChild?: boolean
  children?: React.ReactNode
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      children,
      asChild,
      icon: Icon,
      iconProps,
      description,
      size,
      variant = "secondary",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "span"

    const button = (
      <Comp
        role="button"
        className={iconButtonVariants({ variant, size, className })}
        ref={ref}
        {...props}
      >
        {typeof Icon === "string" ? (
          <span
            className={cn(
              buttonIconVariants({
                size,
                className: iconProps?.className,
              }),
              "flex items-center justify-center"
            )}
          >
            {Icon}
          </span>
        ) : (
          <Icon
            className={buttonIconVariants({
              size,
              className: iconProps?.className,
            })}
            {...iconProps}
          />
        )}
        {children ? children : null}
      </Comp>
    )

    if (description) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{description}</p>
          </TooltipContent>
        </Tooltip>
      )
    }

    return button
  }
)

IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
