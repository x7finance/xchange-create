import React, { useState, useEffect, useMemo } from "react"
import { Text, Box, useInput, useApp } from "ink"
import TextInput from "ink-text-input"
import Spinner from "ink-spinner"
import { AIService } from "../services/ai.service"
import { TokenService } from "../services/token.service"
import {
  formatTime,
  formatTimeAgo,
  formatTimeTill,
  getActionColor,
  getLaunchColor,
} from "../utils"
import { AutonomousThoughtService } from "../services/autonomousthoughts.service"
import { AIResponse } from "../types"
import { launchContext } from "../launch-context"
import { commands } from "../commands"
import { ThoughtsService } from "../services/thoughts.service"
import dayjs from "dayjs"
interface Launch {
  id: string
  timestamp: number
  name: string
  status: "pending" | "launching" | "completed" | "failed"
  thought: AIResponse
}

interface Action {
  type: "thinking" | "launched" | "rejected" | "completed"
  message: string
  timestamp: number
}

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useInput((input, key) => {
    if (key.escape || input === "q") {
      onClose()
    }
  })

  if (!isOpen) return null

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="blue"
      width={60}
      height={15}
      padding={1}
    >
      <Box flexDirection="column">{children}</Box>
      <Box marginTop={1}>
        <Text dimColor>(Press ESC or q to close)</Text>
      </Box>
    </Box>
  )
}

export const HomeView = () => {
  const [command, setCommand] = useState("")
  const [launches, setLaunches] = useState<Launch[]>([])
  const [nextThought, setNextThought] = useState<number>(
    AutonomousThoughtService.getInstance().getThoughtInterval()
  )
  const [isModerating, setIsModerating] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [actions, setActions] = useState<Action[]>([])
  const MAX_DISPLAY = 10 // Maximum number of actions to show
  const [selectedLaunchIndex, setSelectedLaunchIndex] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const thoughtsService = useMemo(() => ThoughtsService.getInstance(), [])

  const [upcomingThoughts, setUpcomingThoughts] = useState<
    Array<{ timestamp: number; thought: AIResponse }>
  >([])

  useEffect(() => {
    const updateQueue = () => {
      const thoughts = thoughtsService.getUpcomingThoughts()
      setUpcomingThoughts(thoughts)
    }

    const handleThoughtReady = (thought: AIResponse) => {
      if (thought.action?.type === "deploy_token") {
        const newLaunch: Launch = {
          id: `launch-${Date.now()}`,
          timestamp: Date.now(),
          name: thought.action.parameters?.name || "Unknown Token",
          status: "pending",
          thought: thought,
        }
        setLaunches(prev => [...prev, newLaunch])
        const launchId = `launch-${Date.now()}`
        launchContext.addLaunch(launchId, thought)
      }

      if (thought.action?.type === "tweet") {
        addAction({
          type: "completed",
          message: `Tweeting: ${thought.action.parameters?.tweet}`,
          timestamp: Date.now(),
        })
      }
    }

    thoughtsService.on("thoughtAdded", updateQueue)
    thoughtsService.on("thoughtProcessed", updateQueue)
    thoughtsService.on("thoughtError", updateQueue)

    thoughtsService.on("thoughtReady", handleThoughtReady)

    updateQueue()

    return () => {
      thoughtsService.removeListener("thoughtAdded", updateQueue)
      thoughtsService.removeListener("thoughtProcessed", updateQueue)
      thoughtsService.removeListener("thoughtError", updateQueue)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setNextThought(prev => {
        if (prev === 0) {
          addAction({
            type: "thinking",
            message: "Starting autonomous thought...",
            timestamp: Date.now(),
          })
          setIsThinking(true)
          AutonomousThoughtService.getInstance().processThought()

          return AutonomousThoughtService.getInstance().getThoughtInterval()
        }
        return Math.max(0, prev - 1)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleThought = (thought: AIResponse) => {
    const thoughtsService = ThoughtsService.getInstance()
    const thoughtId = thoughtsService.addThought(
      thought,
      Date.now() + 5 * 60 * 1000
    )
  }

  useEffect(() => {
    addAction({
      type: "completed",
      message: `[Autonomous Thoughts Enabled]`,
      timestamp: Date.now(),
    })

    AutonomousThoughtService.getInstance().on("thought", response => {
      setIsThinking(false)
      addAction({
        type: "completed",
        message: `Thought Complete ${response.thoughts.length} thoughts`,
        timestamp: Date.now(),
      })

      for (const thought of response.thoughts) {
        handleThought(thought)
      }
    })
  }, [])

  useInput((input, key) => {
    const pendingLaunches = launches.filter(l => l.status === "pending")

    if (pendingLaunches.length === 0) return

    if (key.upArrow) {
      setSelectedLaunchIndex(prev =>
        prev > 0 ? prev - 1 : pendingLaunches.length - 1
      )
    }
    if (key.downArrow) {
      setSelectedLaunchIndex(prev =>
        prev < pendingLaunches.length - 1 ? prev + 1 : 0
      )
    }

    if (input === "y") {
      handleLaunchAction(pendingLaunches[selectedLaunchIndex].id, "approved")
    }
    if (input === "n") {
      handleLaunchAction(pendingLaunches[selectedLaunchIndex].id, "denied")
    }
  })

  // useEffect(() => {
  //   const updateLaunches = () => {
  //     setLaunches(launchContext.getAllLaunches())
  //   }

  //   launchContext.on("launchAdded", updateLaunches)
  //   launchContext.on("launchUpdated", updateLaunches)

  //   // Initial load
  //   updateLaunches()

  //   return () => {
  //     launchContext.removeListener("launchAdded", updateLaunches)
  //     launchContext.removeListener("launchUpdated", updateLaunches)
  //   }
  // }, [])

  const handleCommand = async (input: string) => {
    if (input === "think") {
      setIsThinking(true)
      addAction({
        type: "thinking",
        message: "Starting manual thought...",
        timestamp: Date.now(),
      })
      AutonomousThoughtService.getInstance().processThought()
    } else if (input.split(" ")[0] === "setinterval") {
      setNextThought(parseFloat(input.split(" ")[1]))
      AutonomousThoughtService.getInstance().setThoughtInterval(
        parseFloat(input.split(" ")[1])
      )
    } else if (input === "help") {
      setIsModalOpen(true)
      setModalContent(
        <Box flexDirection="column">
          <Text bold>Available Commands</Text>
          {Object.values(commands).map(command => (
            <Box key={command.name}>
              <Text>{command.name}</Text>
              <Text dimColor>{command.description}</Text>
            </Box>
          ))}
        </Box>
      )
    } else if (input === "moderate") {
      setIsModerating(true)
    }

    setCommand("")
  }

  const addAction = (action: Action) => {
    setActions(prev => [action, ...prev].slice(0, MAX_DISPLAY))
  }

  const handleLaunchAction = async (launchId: string, status: string) => {
    launchContext.updateLaunchStatus(launchId, status)

    if (status === "approved") {
      addAction({
        type: "thinking",
        message: `Launching token ${launchId}...`,
        timestamp: Date.now(),
      })

      try {
        // await launchToken(launchId) // You'll implement this function
        launchContext.updateLaunchStatus(launchId, "completed")
        addAction({
          type: "completed",
          message: `Token ${launchId} launched successfully`,
          timestamp: Date.now(),
        })
      } catch (error) {
        addAction({
          type: "rejected",
          message: `Failed to launch token ${launchId}`,
          timestamp: Date.now(),
        })
      }
    } else {
      setLaunches(
        launches.filter(
          l =>
            l.id !==
            launches.filter(l => l.status === "pending")[selectedLaunchIndex].id
        )
      )
      addAction({
        type: "rejected",
        message: `Token ${launchId} was denied`,
        timestamp: Date.now(),
      })
    }
  }

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box flexDirection="column" borderStyle="single" padding={1}>
        <Text bold>🤖 AI Token Deployer Dashboard</Text>

        <Box flexDirection="column">
          {/* Left box - Actions */}
          <Box flexDirection="column" padding={1} width="100%" marginRight={1}>
            <Text bold>🤖 Recent Actions</Text>
            <Box flexDirection="column">
              {actions.map((action, i) => (
                <Box key={i} paddingLeft={1}>
                  <Text color={getActionColor(action.type)}>
                    • {action.message} ({formatTimeAgo(action.timestamp)})
                  </Text>
                </Box>
              ))}
              {actions.length === 0 && (
                <Box paddingLeft={1}>
                  <Text dimColor>No recent actions</Text>
                </Box>
              )}
            </Box>
          </Box>

          {/* Right box - Thought Queue */}
          <Box flexDirection="column" padding={1} width="100%">
            <Text bold>⏰ Upcoming Actions</Text>
            <Box flexDirection="column">
              {upcomingThoughts.slice(0, MAX_DISPLAY).map((item, i) => (
                <Box key={i} paddingLeft={1}>
                  <Text>
                    •{" "}
                    <Text color="yellow">
                      {dayjs(item.timestamp).format("MM/DD/YY HH:mm:ss")}
                    </Text>
                    :{" "}
                    <Text dimColor>
                      {item.thought.action?.type || "Unknown"}
                      {item.thought.action?.type === "tweet"
                        ? `"${item.thought.action?.parameters?.tweet}"`
                        : `${item.thought.action?.parameters?.name} - ${item.thought.action?.parameters?.symbol}`}
                    </Text>
                  </Text>
                </Box>
              ))}
              {upcomingThoughts.length === 0 && (
                <Box paddingLeft={1}>
                  <Text dimColor>No scheduled thoughts</Text>
                </Box>
              )}
              {upcomingThoughts.length > MAX_DISPLAY && (
                <Box paddingLeft={1}>
                  <Text dimColor>
                    +{upcomingThoughts.length - MAX_DISPLAY} more thoughts
                    queued...
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Pending Launches */}
      <Box flexDirection="column" borderStyle="single" padding={1}>
        <Text bold>
          Pending Launches (Use ↑↓ to navigate, Y to approve, N to deny)
        </Text>
        {launches
          .filter(l => l.status === "pending")
          .map((launch, i) => {
            const params = launch.thought.action?.parameters || {}
            return (
              <Box key={i} flexDirection="column" marginBottom={1}>
                <Box>
                  <Text color={getLaunchColor(launch.status)}>
                    {launches.filter(l => l.status === "pending")[
                      selectedLaunchIndex
                    ]?.id === launch.id
                      ? ">"
                      : " "}
                    {params.symbol || "?"} • {params.name || "Unknown Token"}
                  </Text>
                </Box>
                <Box paddingLeft={2} flexDirection="column">
                  <Text dimColor>
                    Supply: {params.initialSupply?.toLocaleString() || "N/A"}
                  </Text>
                  <Text wrap="wrap" dimColor>
                    {params.description || "No description available"}
                  </Text>
                  <Text italic dimColor>
                    Reasoning: {launch.thought.why || "No reasoning provided"}
                  </Text>
                  <Box marginTop={1}>
                    <Text backgroundColor="blue" color="white">
                      {" "}
                      {params.tokenType || "STANDARD"}{" "}
                    </Text>
                    <Text> </Text>
                    <Text backgroundColor="magenta" color="white">
                      {" "}
                      Tax: {params.tax || "0"}%{" "}
                    </Text>
                  </Box>
                </Box>
              </Box>
            )
          })}
      </Box>

      <Box flexDirection="row" justifyContent="space-between">
        <Box>
          <Text>Next Autonomous Thought: </Text>
          <Text inverse color="yellow">
            {formatTime(nextThought)}
          </Text>
        </Box>
        {isThinking && (
          <Box paddingLeft={1}>
            <Text color="green">
              <Spinner type="dots" />
              <Text> Thinking...</Text>
            </Text>
          </Box>
        )}
      </Box>

      {/* Command Input */}
      <Box marginTop={1}>
        <Text>❯ </Text>
        <TextInput
          value={command}
          onChange={setCommand}
          onSubmit={handleCommand}
          placeholder="Type a command (help for options)"
        />
      </Box>

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalContent}
      </Modal>
    </Box>
  )
}
