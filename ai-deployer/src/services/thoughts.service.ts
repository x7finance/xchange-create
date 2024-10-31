import EventEmitter from "events"
import { AIResponse } from "../types"

interface QueuedThought {
  thought: AIResponse
  timestamp: number
  id: string
}

export class ThoughtsService extends EventEmitter {
  private static instance: ThoughtsService
  private thoughtQueue: QueuedThought[]
  private checkInterval: NodeJS.Timeout | null
  private isProcessing: boolean

  private constructor() {
    super()
    this.thoughtQueue = []
    this.isProcessing = false
    this.checkInterval = null
    this.startProcessing()
  }

  public static getInstance(): ThoughtsService {
    if (!ThoughtsService.instance) {
      ThoughtsService.instance = new ThoughtsService()
    }
    return ThoughtsService.instance
  }

  public addThought(thought: AIResponse, executeAt: number): string {
    const id = `thought-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.thoughtQueue.push({
      thought,
      timestamp: executeAt,
      id,
    })

    // Sort queue by timestamp
    this.thoughtQueue.sort((a, b) => a.timestamp - b.timestamp)

    this.emit("thoughtAdded", { id, timestamp: executeAt })
    return id
  }

  public removeThought(id: string): boolean {
    const initialLength = this.thoughtQueue.length
    this.thoughtQueue = this.thoughtQueue.filter(t => t.id !== id)
    return initialLength !== this.thoughtQueue.length
  }

  public getUpcomingThoughts(): QueuedThought[] {
    return [...this.thoughtQueue]
  }

  public getNextThoughtTime(): number | null {
    if (this.thoughtQueue.length === 0) return null
    return this.thoughtQueue[0].timestamp
  }

  private startProcessing(): void {
    if (this.checkInterval) return

    this.checkInterval = setInterval(() => {
      if (this.isProcessing) return
      this.processQueue()
    }, 1000) // Check every second
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.thoughtQueue.length === 0) return

    const now = Date.now()
    const nextThought = this.thoughtQueue[0]

    if (nextThought.timestamp <= now) {
      this.isProcessing = true

      try {
        // Remove the thought from queue
        this.thoughtQueue.shift()

        // Emit the thought for processing
        this.emit("thoughtReady", nextThought.thought)

        // Emit completion event
        this.emit("thoughtProcessed", {
          id: nextThought.id,
          timestamp: nextThought.timestamp,
          success: true,
        })
      } catch (error) {
        this.emit("thoughtError", {
          id: nextThought.id,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      } finally {
        this.isProcessing = false
      }
    }
  }

  public cleanup(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
    this.thoughtQueue = []
    this.removeAllListeners()
  }
}
