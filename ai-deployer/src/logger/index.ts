import type { Logger as PinoLogger } from "pino"
import pino from "pino"

export enum LogCodes {
  GENERATE_RESPONSE = "GENERATE_RESPONSE",
  TOKEN_DEPLOYMENT = "TOKEN_DEPLOYMENT",
  GET_MENTIONS = "GET_MENTIONS",
  GET_TRENDS = "GET_TRENDS",
  DAEMON_START = "DAEMON_START",
  DAEMON_STOP = "DAEMON_STOP",
  DAEMON_ERROR = "DAEMON_ERROR",
  AUTONOMOUS_THOUGHTS = "AUTONOMOUS_THOUGHTS",
  GET_LATEST_TOKENS = "GET_LATEST_TOKENS",
  POST_TWEET = "POST_TWEET",
  NEWS_SEARCH_ERROR = "NEWS_SEARCH_ERROR",
  NEWS_TRENDS_ERROR = "NEWS_TRENDS_ERROR",
  NEWS_FETCH_ERROR = "NEWS_FETCH_ERROR",
  RSS_FETCH_ERROR = "RSS_FETCH_ERROR",
  LIKE_TWEET_FAILED = "LIKE_TWEET_FAILED",
  UNLIKE_TWEET_FAILED = "UNLIKE_TWEET_FAILED",
  FOLLOW_USER_FAILED = "FOLLOW_USER_FAILED",
  UNFOLLOW_USER_FAILED = "UNFOLLOW_USER_FAILED",
  RETWEET_FAILED = "RETWEET_FAILED",
  POST_REPLY = "POST_REPLY",
  GET_USER_TWEETS = "GET_USER_TWEETS",
  GET_MY_REPLIES = "GET_MY_REPLIES",
}

export interface LogMethod {
  (logCode: LogCodes, msg: string, ...args: any[]): void
  (logCode: LogCodes, obj: object, msg?: string, ...args: any[]): void
  // Add this overload to match the function signature
  (logCode: LogCodes, msgOrObj: any, ...args: any[]): void
}

export interface ErrorLogMethod {
  (errorCode: LogCodes, msg: string, ...args: any[]): void
  (errorCode: LogCodes, obj: object, msg?: string, ...args: any[]): void
}

export interface Logger {
  fatal: ErrorLogMethod
  error: ErrorLogMethod
  warn: LogMethod
  info: LogMethod
  debug: LogMethod
  trace: LogMethod
  child(bindings: object): Logger // Add this line
}

export const loggerConfig: pino.LoggerOptions = {
  level: "info",
  browser: {
    asObject: true,
    serialize: true,
    formatters: {
      level(label: any) {
        return { level: label }
      },
      log(object: any) {
        // Extract the fields you want to prioritize
        const { service, logCode, message, level, time, ...rest } = object

        // Reconstruct the log object with properties in the desired order
        const logObject = {
          service,
          logCode,
          message,
          level,
          time,
          ...rest,
        }

        return logObject
      },
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  messageKey: "message",
  serializers: {
    err: pino.stdSerializers.err,
  },
}

export interface LoggerOptions {
  serviceName: "ai-deployer"
}

export const log = getLogger({ serviceName: "ai-deployer" })

export function createLogger(options: LoggerOptions) {
  const { serviceName } = options

  const logger = pino({
    ...loggerConfig,
    base: { service: serviceName },
  })

  return logger
}

function createWrappedLogger(pinoLoggerInstance: PinoLogger): Logger {
  type LogLevels = "fatal" | "error" | "warn" | "info" | "debug" | "trace"

  const logMethod = (method: LogLevels): LogMethod => {
    return (logCode: LogCodes, msgOrObj: any, ...args: any[]): void => {
      if (typeof msgOrObj === "string") {
        // If msgOrObj is a string, it's the message
        pinoLoggerInstance[method]({ logCode }, msgOrObj, ...args)
      } else {
        // If msgOrObj is an object, handle the message separately
        let msg = args.shift() // Assume the next argument is the message, if any
        if (typeof msg !== "string") {
          args.unshift(msg) // Put it back if it's not a string
          msg = undefined
        }
        pinoLoggerInstance[method]({ logCode, ...msgOrObj }, msg, ...args)
      }
    }
  }

  const wrappedLogger: Logger = {
    fatal: logMethod("fatal"),
    error: logMethod("error"),
    warn: logMethod("warn"),
    info: logMethod("info"),
    debug: logMethod("debug"),
    trace: logMethod("trace"),
    child: (bindings: object): Logger => {
      const childPinoLogger = pinoLoggerInstance.child(bindings)
      return createWrappedLogger(childPinoLogger)
    },
  }

  return wrappedLogger
}

export function getLogger(options: LoggerOptions): Logger {
  const pinoLogger: PinoLogger = createLogger(options)
  const loggerWithService = pinoLogger.child({ service: options.serviceName })

  const logger = createWrappedLogger(loggerWithService)

  return logger
}
