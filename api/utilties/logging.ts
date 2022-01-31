import { Context, Logger } from "@azure/functions";

// Log to the console by default.
let logger = console.trace as Logger;
logger.error = console.error;
logger.warn = console.warn;
logger.info = console.info;
logger.verbose = console.debug;

export const setLoggerFromContext = (context: Context) => {
  logger = context.log;
};

export const logError = (...args: any[]) => logger.error(...args);
export const logWarn = (...args: any[]) => logger.warn(...args);
export const logInfo = (...args: any[]) => logger.info(...args);
export const logVerbose = (...args: any[]) => logger.verbose(...args);
export const logTrace = (...args: any[]) => logger(...args);
