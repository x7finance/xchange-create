export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export const getLaunchColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "yellow"
    case "launching":
      return "blue"
    case "completed":
      return "green"
    default:
      return "white"
  }
}

export const getActionColor = (type: string): string => {
  switch (type) {
    case "thinking":
      return "yellow"
    case "launched":
      return "green"
    case "rejected":
      return "red"
    case "completed":
      return "blue"
    default:
      return "white"
  }
}

export const formatTimeAgo = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  return `${minutes}m ago`
}

export const formatTimeTill = (timestamp: number): string => {
  const seconds = Math.floor((timestamp - Date.now()) / 1000)
  if (seconds < 60) return `in ${seconds}(s)`
  const minutes = Math.floor(seconds / 60)
  return `in ${minutes}m(s)`
}
