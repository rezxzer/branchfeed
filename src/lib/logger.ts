/**
 * Logger utility for consistent logging across the application
 * Automatically handles development vs production environments
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Logger class for consistent logging
 */
class Logger {
  private shouldLog(level: LogLevel): boolean {
    // In production, only log errors and warnings
    if (!isDevelopment) {
      return level === 'error' || level === 'warn'
    }
    // In development, log everything
    return true
  }

  private formatMessage(message: string, context?: LogContext): string {
    if (!context || Object.keys(context).length === 0) {
      return message
    }
    return `${message} ${JSON.stringify(context)}`
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${this.formatMessage(message, context)}`)
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${this.formatMessage(message, context)}`)
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${this.formatMessage(message, context)}`)
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext = {
        ...context,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : error,
      }
      console.error(`[ERROR] ${this.formatMessage(message, errorContext)}`)
    }
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience functions
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context)
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context)
export const logWarn = (message: string, context?: LogContext) => logger.warn(message, context)
export const logError = (message: string, error?: Error | unknown, context?: LogContext) => logger.error(message, error, context)

