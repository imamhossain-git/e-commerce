// Shared logging utility

export interface LogContext {
  service: string
  requestId?: string
  userId?: string
  sessionId?: string
  [key: string]: any
}

export class Logger {
  private service: string

  constructor(service: string) {
    this.service = service
  }

  private formatMessage(level: string, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logContext = { service: this.service, ...context }
    
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...logContext
    })
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage('INFO', message, context))
  }

  error(message: string, error?: Error, context?: LogContext) {
    const errorContext = error ? { 
      error: error.message, 
      stack: error.stack 
    } : {}
    
    console.error(this.formatMessage('ERROR', message, { ...context, ...errorContext }))
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage('WARN', message, context))
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage('DEBUG', message, context))
    }
  }
}

export const createLogger = (service: string) => new Logger(service)