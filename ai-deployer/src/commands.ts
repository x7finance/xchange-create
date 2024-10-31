export type Command = {
  name: string
  description: string
}

export const commands: Record<string, Command> = {
  help: {
    name: "help",
    description: "Show available commands",
  },
  setinterval: {
    name: "setinterval",
    description: "Show available commands",
  },
  launch: {
    name: "think",
    description: "Trigger manual thought process",
  },
  status: {
    name: "status",
    description: "Show current system status",
  },
}
