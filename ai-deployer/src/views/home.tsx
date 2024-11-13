import React, { useState, useEffect, useMemo } from "react"
import { Text, Box, useInput, useApp } from "ink"
import TextInput from "ink-text-input"
import Spinner from "ink-spinner"

import {
  formatTime,
  formatTimeAgo,
  getActionColor,
  getLaunchColor,
} from "../utils"
import { AutonomousThoughtService } from "../services/autonomousthoughts.service"
import { AIResponse, SocialAction, SocialResponse } from "../types"
import { launchContext } from "../launch-context"
import { commands } from "../commands"
import { ThoughtsService } from "../services/thoughts.service"
import dayjs from "dayjs"
import { SocialService } from "../services/social.service"
import utc from "dayjs/plugin/utc"
import { TwitterService } from "../services/twitter.service"
import dotenv from "dotenv"

dotenv.config()

dayjs.extend(utc)

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

interface Tweet {
  id: string
  timestamp: number
  content: string
  status: "pending" | "posted" | "failed"
  scheduledTime: string
  isThreaded?: boolean
  otherTweets?: SocialAction[]
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  useInput((input: string, key: { escape: any }) => {
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
  const [isModeratingTweets, setIsModeratingTweets] = useState(false)
  const [isModeratingLaunches, setIsModeratingLaunches] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [actions, setActions] = useState<Action[]>([])
  const MAX_DISPLAY = 10 // Maximum number of actions to show
  const [selectedLaunchIndex, setSelectedLaunchIndex] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalContent, setModalContent] = useState<React.ReactNode>(null)
  const thoughtsService = useMemo(() => ThoughtsService.getInstance(), [])
  const socialService = useMemo(() => SocialService.getInstance(), [])
  const twitterService = useMemo(
    () =>
      TwitterService.getInstance(
        process.env.TWITTER_CLIENT_ID!,
        process.env.TWITTER_CLIENT_SECRET!,
        process.env.TWITTER_ID!
      ),
    []
  )
  const [upcomingThoughts, setUpcomingThoughts] = useState<
    Array<{ timestamp: number; thought: AIResponse }>
  >([])

  const [nextSocial, setNextSocial] = useState<number>(
    socialService.getSocialInterval()
  )

  const [tweets, setTweets] = useState<Tweet[]>([])
  const [selectedTweetIndex, setSelectedTweetIndex] = useState<number>(0)

  useEffect(() => {
    const updateQueue = () => {
      const thoughts = thoughtsService.getUpcomingThoughts()
      setUpcomingThoughts(thoughts)
    }

    const handleSocial = async (response: SocialResponse) => {
      setIsThinking(false)

      if (response.actions && response.actions.length > 0) {
        addAction({
          type: "completed",
          message: `Social Thoughts completed: ${response?.actions?.length} actions to schedule`,
          timestamp: Date.now(),
        })
        setNextSocial(socialService.getSocialInterval())
        await socialService.scheduleActions(response)
      }
    }

    const handleTweetScheduled = (action: SocialAction) => {
      const newTweet: Tweet = {
        id: `tweet-${Date.now()}`,
        timestamp: dayjs(action.intendedPostTime).unix(),
        content: action.tweet || "",
        status: "pending",
        scheduledTime: action.intendedPostTime || "",
        isThreaded: action.isThreaded,
        otherTweets: action.otherTweets!,
      }
      setTweets(prev => [...prev, newTweet])
      addAction({
        type: "completed",
        message: `Tweet scheduled: ${action.tweet}`,
        timestamp: Date.now(),
      })
    }

    const handleTweet = async (tweet: SocialAction) => {
      // Do Tweet
      const posted = await twitterService.postTweet(tweet)
      if (posted) {
        setTweets(prev =>
          prev.filter(t => t.timestamp !== dayjs(tweet.intendedPostTime).unix())
        )

        addAction({
          type: "completed",
          message: `Tweet posted: ${tweet.tweet}`,
          timestamp: Date.now(),
        })
      } else {
        addAction({
          type: "rejected",
          message: `Failed to post tweet: ${tweet.tweet}`,
          timestamp: Date.now(),
        })
      }
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

    const handleOtherAction = (action: SocialAction) => {
      addAction({
        type: "completed",
        message: `Other action: ${action.type} on ${action.tweetId ?? action.userId ?? action.username} ${action.tweet ?? ""}`,
        timestamp: Date.now(),
      })
    }

    thoughtsService.on("thoughtAdded", updateQueue)
    thoughtsService.on("thoughtProcessed", updateQueue)
    thoughtsService.on("thoughtError", updateQueue)
    socialService.on("social_response", handleSocial)
    socialService.on("tweet_scheduled", handleTweetScheduled)
    socialService.on("tweet", handleTweet)
    socialService.on("other_action", handleOtherAction)
    thoughtsService.on("thoughtReady", handleThoughtReady)

    updateQueue()

    return () => {
      thoughtsService.removeListener("thoughtAdded", updateQueue)
      thoughtsService.removeListener("thoughtProcessed", updateQueue)
      thoughtsService.removeListener("thoughtError", updateQueue)
      socialService.removeListener("social_response", handleSocial)
      socialService.removeListener("tweet_scheduled", handleTweetScheduled)
      socialService.removeListener("tweet", handleTweet)
      socialService.removeListener("other_action", handleOtherAction)
      thoughtsService.removeListener("thoughtReady", handleThoughtReady)
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      // REMOVE OTHER THOUGHTS FOR NOW
      // setNextThought(prev => {
      //   if (prev === 0) {
      //     addAction({
      //       type: "thinking",
      //       message: "Starting autonomous thought...",
      //       timestamp: Date.now(),
      //     })
      //     setIsThinking(true)
      //     AutonomousThoughtService.getInstance().processThought()

      //     return AutonomousThoughtService.getInstance().getThoughtInterval()
      //   }
      //   return Math.max(0, prev - 1)
      // })

      setNextSocial(prev => {
        if (prev === 0) {
          addAction({
            type: "thinking",
            message: "Preparing social update...",
            timestamp: Date.now(),
          })
          setIsThinking(true)
          SocialService.getInstance().processSocialUpdate()
          return SocialService.getInstance().getSocialInterval()
        }
        return Math.max(0, prev - 1)
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    SocialService.getInstance().on("social_response", response => {
      setIsThinking(false)

      if (response.action?.type === "tweet") {
        addAction({
          type: "completed",
          message: `Tweet prepared: ${response.action.parameters?.tweet}`,
          timestamp: Date.now(),
        })
      }
    })
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

  useInput((input: string, key: { upArrow: any; downArrow: any }) => {
    const pendingLaunches = launches.filter(l => l.status === "pending")
    const pendingTweets = tweets.filter(t => t.status === "pending")

    if (pendingLaunches.length === 0 && pendingTweets.length === 0) return

    if (isModeratingLaunches) {
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
      if (input === "q") {
        setIsModeratingLaunches(false)
      }
    }

    if (isModeratingTweets) {
      if (key.upArrow) {
        setSelectedTweetIndex(prev =>
          prev > 0 ? prev - 1 : pendingTweets.length - 1
        )
      }
      if (key.downArrow) {
        setSelectedTweetIndex(prev =>
          prev < pendingTweets.length - 1 ? prev + 1 : 0
        )
      }

      if (input === "p" && selectedTweetIndex >= 0) {
        handleTweetAction(pendingTweets[selectedTweetIndex].id, "post")
      }
      if (input === "x" && selectedTweetIndex >= 0) {
        handleTweetAction(pendingTweets[selectedTweetIndex].id, "cancel")
      }

      if (input === "q") {
        setIsModeratingTweets(false)
      }
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
              <Text>{command.name} - </Text>
              <Text dimColor>{command.description}</Text>
            </Box>
          ))}
        </Box>
      )
    } else if (input.split(" ")[0] === "moderate") {
      if (input.split(" ")[1] === "tweets") {
        setIsModeratingTweets(true)
      } else if (input.split(" ")[1] === "launches") {
        setIsModeratingLaunches(true)
      }
    } else if (input === "yap") {
      addAction({
        type: "thinking",
        message: "Starting manual social update...",
        timestamp: Date.now(),
      })
      SocialService.getInstance().processSocialUpdate()
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

  const handleTweetAction = async (
    tweetId: string,
    action: "post" | "cancel"
  ) => {
    if (action === "post") {
      try {
        const tweet = tweets.find(t => t.id === tweetId)
        if (tweet) {
          // Here you would integrate with your Twitter service to actually post
          const socialAction: SocialAction = {
            tweet: tweet.content,
            intendedPostTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
            isThreaded: tweet.isThreaded!,
            otherTweets: tweet.otherTweets,
            timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
          }
          const posted = await twitterService.postTweet(socialAction)
          if (posted) {
            setTweets(prev =>
              prev.map(t => (t.id === tweetId ? { ...t, status: "posted" } : t))
            )
            addAction({
              type: "completed",
              message: `Tweet posted: ${tweet.content}`,
              timestamp: Date.now(),
            })
          } else {
            addAction({
              type: "rejected",
              message: `Failed to post tweet: ${tweet.content}`,
              timestamp: Date.now(),
            })
          }
        }
      } catch (error) {
        addAction({
          type: "rejected",
          message: `Failed to post tweet ${tweetId}`,
          timestamp: Date.now(),
        })
      }
    } else {
      setTweets(prev => prev.filter(t => t.id !== tweetId))
      if (tweets.length === 0) {
        setIsModeratingTweets(false)
      }
      addAction({
        type: "rejected",
        message: `Tweet ${tweetId} was cancelled`,
        timestamp: Date.now(),
      })
    }
  }

  if (!twitterService.loggedIn) {
    return <Text>Please login to Twitter: {twitterService.activeOauthURL}</Text>
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

      <Box flexDirection="column" borderStyle="single" padding={1}>
        <Text bold>
          Pending Tweets (Use ↑↓ to navigate, P to post, X to cancel)
        </Text>
        {tweets
          .filter(t => t.status === "pending")
          .sort((a, b) =>
            dayjs(a.scheduledTime).isBefore(dayjs(b.scheduledTime)) ? -1 : 1
          )
          .map((tweet, i) => (
            <Box key={i} flexDirection="column" marginBottom={1}>
              <Box>
                <Text color="blue">
                  {tweets.filter(t => t.status === "pending")[
                    selectedTweetIndex
                  ]?.id === tweet.id
                    ? ">"
                    : " "}
                  Scheduled for:{" "}
                  {dayjs.utc(tweet.scheduledTime).format("MM/DD/YY HH:mm:ss")}
                </Text>
              </Box>
              <Box paddingLeft={2} flexDirection="column">
                <Text wrap="wrap">{tweet.content}</Text>
                {tweet.isThreaded &&
                  tweet.otherTweets?.map(_tweet => (
                    <Text dimColor>+ {_tweet.tweet}</Text>
                  ))}
              </Box>
            </Box>
          ))}
      </Box>

      <Box flexDirection="row" justifyContent="space-between">
        <Box>
          <Text>Next Autonomous Thought: </Text>
          <Text inverse color="yellow">
            {formatTime(nextThought)}
          </Text>
          <Text> | Next Social Update: </Text>
          <Text inverse color="blue">
            {formatTime(nextSocial)}
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
          onChange={(e: string) => {
            if (!isModeratingTweets && !isModeratingLaunches) {
              setCommand(e)
            }
          }}
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
