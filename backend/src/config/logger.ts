import winston from "winston";
import { env, isProduction } from "./env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

/** Human-friendly console format for development. */
const devFormat = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, stack }) => {
    return `${ts} ${level}: ${stack || message}`;
  }),
);

/** Structured JSON format for production log aggregation. */
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

export const logger = winston.createLogger({
  level: isProduction ? "info" : "debug",
  format: isProduction ? prodFormat : devFormat,
  defaultMeta: { service: "rats-backend" },
  transports: [new winston.transports.Console()],
  exitOnError: false,
});

/** A stream adapter so Morgan can pipe HTTP logs through Winston. */
export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

// Ensure the `http` level is visible in development too.
if (env.NODE_ENV !== "production") {
  logger.transports.forEach((t) => (t.level = "debug"));
}
