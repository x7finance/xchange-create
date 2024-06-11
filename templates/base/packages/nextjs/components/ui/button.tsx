import * as React from "react"
import type { IconComponent, IconProps } from "./types"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
import { cn } from "~~/utils/xchange/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background focus-visible:ring-green-600",
  {
    variants: {
      variant: {
        default:
          "bg-primary border border-transparent hover:border-primary hover:text-primary text-primary-foreground hover:bg-transparent",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border dark:border-zinc-600 border-zinc-400 dark:hover:border-zinc-200 hover:border-zinc-800",
        primary:
          "dark:bg-green-700/70 bg-green-700/90 border-2 border-green-700 text-white hover:bg-green-900 hover:text-white",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        border: "border border-accent hover:border-primary hover:text-primary",
        ghost: "hover:bg-white/10 hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-green-500",
        warning:
          "bg-amber-400 hover:bg-amber-500 focus:bg-amber-600 active:bg-amber-500 text-amber-900",
      },
      size: {
        xs: "min-h-[26px] h-[26px] px-2 text-xs rounded-lg",
        default: "h-10 py-2 px-4",
        sm: "h-8 px-3 rounded-md",
        lg: "h-14 px-6 py-3 rounded-md text-[16px]",
        xl: "h-20 px-6 py-4 rounded-md text-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const buttonLoaderVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "w-4 h-4",
      sm: "w-[18px] h-[18px]",
      default: "w-5 h-5",
      lg: "w-5 h-5 stroke-[2px]",
      xl: "w-5 h-5 stroke-[2px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

const buttonIconVariants = cva("", {
  variants: {
    size: {
      xs: "w-4 h-4",
      sm: "w-[18px] h-[18px]",
      default: "w-5 h-5",
      lg: "w-5 h-5",
      xl: "w-5 h-5",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  icon?: IconComponent
  iconProps?: IconProps
  iconPosition?: "start" | "end"
  asChild?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      fullWidth,
      icon: Icon,
      iconProps,
      iconPosition = "start",
      disabled = false,
      className,
      variant,
      size,
      children,
      asChild = false,
      loading = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        disabled={loading ? true : disabled}
        className={cn(
          buttonVariants({
            variant,
            size,
            className: cn(className, fullWidth ? "w-full flex-1" : ""),
          })
        )}
        ref={ref}
        {...props}
      >
        <ButtonContent asChild={asChild}>
          {loading ? (
            <Loader2 className={cn(buttonLoaderVariants({ size }))} />
          ) : Icon && iconPosition === "start" ? (
            <Icon
              {...iconProps}
              className={buttonIconVariants({
                size,
                className: iconProps?.className,
              })}
            />
          ) : null}
          {children}
          {Icon && iconPosition === "end" ? (
            <Icon
              {...iconProps}
              className={buttonIconVariants({
                size,
                className: iconProps?.className,
              })}
            />
          ) : null}
        </ButtonContent>
      </Comp>
    )
  }
)

Button.displayName = "Button"

interface ButtonContentProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean
}

const ButtonContent = React.forwardRef<HTMLDivElement, ButtonContentProps>(
  function Button({ asChild, children, ...props }, ref) {
    if (asChild) {
      return (
        <div className="inline-flex gap-1" ref={ref} {...props}>
          {children}
        </div>
      )
    }

    return <>{children}</>
  }
)

export { Button, buttonIconVariants, buttonLoaderVariants, buttonVariants }
