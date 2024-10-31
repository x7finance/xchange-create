import { EventEmitter } from "events"
import { AIResponse } from "./types"

export interface Launch {
  id: string
  status: "pending" | "running" | "completed" | "failed"
  timestamp: Date
  thought?: AIResponse
}

class LaunchContext extends EventEmitter {
  private static instance: LaunchContext
  private launches: Map<string, Launch>

  private constructor() {
    super()
    this.launches = new Map()
  }

  public static getInstance(): LaunchContext {
    if (!LaunchContext.instance) {
      LaunchContext.instance = new LaunchContext()
    }
    return LaunchContext.instance
  }

  public addLaunch(id: string, data?: any): void {
    this.launches.set(id, {
      id,
      status: "pending",
      timestamp: new Date(),
      thought: data,
    })
    this.emit("launchAdded", this.launches.get(id))
  }

  public updateLaunchStatus(id: string, status: string): void {
    const launch = this.launches.get(id)
    if (launch) {
      launch.status = status as Launch["status"]
      this.launches.set(id, launch)
      this.emit("launchUpdated", launch)
    }
  }

  public getLaunch(id: string): Launch | undefined {
    return this.launches.get(id)
  }

  public getAllLaunches(): Launch[] {
    return Array.from(this.launches.values())
  }
}

export const launchContext = LaunchContext.getInstance()
