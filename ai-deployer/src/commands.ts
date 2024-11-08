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
  think: {
    name: "think",
    description: "Trigger manual thought process",
  },
  yap: {
    name: "yap",
    description: "Trigger manual social media process",
  },
  moderate: {
    name: "moderate <tweets|launches>",
    description:
      "Moderate tweets or launches, arrow keys to select, tweets (p)ost, c(x)ncel, launches (y)es, (n)o, (q)uit",
  },
  status: {
    name: "status",
    description: "Show current system status",
  },
}
