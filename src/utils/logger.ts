import { createLogger, format, transports } from "winston"

export const logger = createLogger({
  level: "info",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),
  ],
})

export const logRequest = (req: any, res: any, next: any) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`)
  next()
}
