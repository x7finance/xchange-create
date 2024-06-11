/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
"use client"

import * as React from "react"
import type { Dispatch, FC, ReactNode, SetStateAction } from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { IconButton } from "./iconbutton"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { cva } from "class-variance-authority"
import type { VariantProps } from "class-variance-authority"
import { XIcon } from "lucide-react"
import { cn } from "~~/utils/xchange/cn"

const dialogVariants = cva(
  "duration-200 border dark:border-green-900 border-green-300 overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
  {
    variants: {
      variant: {
        default:
          "rounded-b-none md:rounded-b-2xl bottom-0 md:bottom-[unset] fixed left-[50%] md:top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] md:translate-y-[-50%] gap-4 bg-zinc-50/90 dark:bg-zinc-800/60 shadow-lg rounded-2xl md:w-full data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-bottom-[48%] md:data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-bottom-[48%] md:data-[state=open]:slide-in-from-top-[48%]",
        opaque: "px-4 fixed z-50 top-4 grid w-full max-w-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const dialogOverlayVariants = cva(
  "fixed inset-0 z-50 transition-all duration-100 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=open]:fade-in",
  {
    variants: {
      variant: {
        default: "bg-black/10 dark:backdrop-blur-xl backdrop-blur",
        opaque: "bg-zinc-100 dark:bg-zinc-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const dialogCloseVariants = cva("", {
  variants: {
    variant: {
      default: "absolute top-6 right-6",
      opaque: "hidden",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogClose = DialogPrimitive.Close

const DialogPortal = ({
  children,
  ...props
}: DialogPrimitive.DialogPortalProps) => (
  <DialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

interface DialogOverlay
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>,
    VariantProps<typeof dialogOverlayVariants> {}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  DialogOverlay
>(({ className, variant, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={dialogOverlayVariants({ variant, className })}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

interface DialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof dialogVariants> {
  hideClose?: boolean
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(({ className, variant, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay variant={variant} />
    <DialogPrimitive.Content
      ref={ref}
      className={dialogVariants({ variant, className })}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        asChild
        className={dialogCloseVariants({ variant })}
      >
        <IconButton variant={"secondary"} icon={XIcon} name="Close" />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col space-y-1.5 px-6 pt-6 text-left", className)}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse border-t border-zinc-300 bg-zinc-100 p-6 sm:flex-row sm:justify-end sm:space-x-2 dark:border-zinc-700 dark:bg-zinc-800",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "mr-[64px] text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-muted-foreground mr-[64px] text-sm", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

interface DialogReviewProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
    "children" | "open"
  > {
  children: ({ confirm }: { confirm(): void }) => ReactNode
}

const DialogReview: FC<DialogReviewProps> = ({ children, ...props }) => {
  const { confirm, open, setOpen } = useDialog(DialogType.Review)
  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      {children({ confirm })}
    </Dialog>
  )
}
DialogReview.displayName = "DialogReview"

interface DialogCustomProps {
  children: ReactNode
  dialogType: DialogType
}

const DialogCustom: FC<DialogCustomProps> = ({ children, ...props }) => {
  const { open, setOpen } = useDialog(DialogType.Confirm)
  return (
    <Dialog {...props} open={open} onOpenChange={setOpen}>
      {children}
    </Dialog>
  )
}
DialogCustom.displayName = "DialogCustom"

enum DialogType {
  Review = 0,
  Confirm = 1,
}

interface DialogContext {
  state: Record<DialogType, boolean>

  confirm(): void

  setState: Dispatch<SetStateAction<Record<DialogType, boolean>>>
}

const DialogContext = createContext<DialogContext | undefined>(undefined)

interface DialogProviderProps {
  children: ReactNode
}

const DialogProvider: FC<DialogProviderProps> = ({ children }) => {
  const [state, setState] = useState<Record<DialogType, boolean>>({
    [DialogType.Review]: false,
    [DialogType.Confirm]: false,
  })

  const confirm = useCallback(() => {
    setState({
      [DialogType.Review]: false,
      [DialogType.Confirm]: true,
    })
  }, [])

  return (
    <DialogContext.Provider value={{ state, confirm, setState }}>
      {children}
    </DialogContext.Provider>
  )
}

type UseDialog<T> = T extends DialogType.Review
  ? {
      open: boolean
      setOpen(open: boolean): void
      confirm(): void
    }
  : {
      open: boolean
      setOpen(open: boolean): void
    }

const useDialog = <T extends DialogType>(type: T): UseDialog<T> => {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error("Hook can only be used inside Modal Context")
  }

  const { state, setState, confirm } = context

  return useMemo(() => {
    if (type === DialogType.Review) {
      return {
        open: Boolean(state[type]),
        setOpen: val =>
          setState(prev => ({ ...prev, [DialogType.Review]: val })),
        confirm,
      } as UseDialog<T>
    } else {
      return {
        open: Boolean(state[type]),
        setOpen: val =>
          setState(prev => ({ ...prev, [DialogType.Confirm]: val })),
      } as UseDialog<T>
    }
  }, [state, setState, confirm, type])
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogCustom,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPrimitive,
  DialogProvider,
  DialogReview,
  DialogTitle,
  DialogTrigger,
  DialogType,
  useDialog,
}
