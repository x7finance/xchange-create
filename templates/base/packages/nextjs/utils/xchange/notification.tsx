import React from "react"
import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react"
import { toast, ToastPosition } from "react-hot-toast"

type NotificationProps = {
  content: React.ReactNode
  status: "success" | "info" | "loading" | "error" | "warning"
  duration?: number
  icon?: string
  position?: ToastPosition
}

type NotificationOptions = {
  duration?: number
  icon?: string
  position?: ToastPosition
}

const ENUM_STATUSES = {
  success: <CircleCheckIcon className="text-success w-7" />,
  loading: <span className="loading loading-spinner w-6"></span>,
  error: <CircleAlertIcon className="text-error w-7" />,
  info: <InfoIcon className="text-info w-7" />,
  warning: <TriangleAlertIcon className="text-warning w-7" />,
}

const DEFAULT_DURATION = 3000
const DEFAULT_POSITION: ToastPosition = "top-center"

/**
 * Custom Notification
 */
const Notification = ({
  content,
  status,
  duration = DEFAULT_DURATION,
  icon,
  position = DEFAULT_POSITION,
}: NotificationProps) => {
  return toast.custom(
    t => (
      <div
        className={`shadow-center shadow-accent relative flex max-w-sm transform-gpu flex-row items-start justify-between space-x-2 rounded-xl bg-zinc-200 p-4 transition-all duration-500 ease-in-out dark:bg-zinc-800
        ${
          position.substring(0, 3) == "top"
            ? `hover:translate-y-1 ${t.visible ? "top-0" : "-top-96"}`
            : `hover:-translate-y-1 ${t.visible ? "bottom-0" : "-bottom-96"}`
        }`}
      >
        <div className="self-center leading-[0]">
          {icon ? icon : ENUM_STATUSES[status]}
        </div>
        <div
          className={`overflow-x-hidden whitespace-pre-line break-words ${
            icon ? "mt-1" : ""
          }`}
        >
          {content}
        </div>

        <div
          className={`cursor-pointer text-lg ${icon ? "mt-1" : ""}`}
          onClick={() => toast.dismiss(t.id)}
        >
          <XIcon
            className="w-6 cursor-pointer"
            onClick={() => toast.remove(t.id)}
          />
        </div>
      </div>
    ),
    {
      duration: status === "loading" ? Infinity : duration,
      position,
    }
  )
}

export const notification = {
  success: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "success", ...options })
  },
  info: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "info", ...options })
  },
  warning: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "warning", ...options })
  },
  error: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "error", ...options })
  },
  loading: (content: React.ReactNode, options?: NotificationOptions) => {
    return Notification({ content, status: "loading", ...options })
  },
  remove: (toastId: string) => {
    toast.remove(toastId)
  },
}
