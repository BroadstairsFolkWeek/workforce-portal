import { Context, Logger } from "@azure/functions";
import { Logger as EffectLogger } from "effect";
import { Debug, Info, None, Trace, Warning } from "effect/LogLevel";

// Log to the console by default.
let logger = console.trace as Logger;
logger.error = console.error;
logger.warn = console.warn;
logger.info = console.info;
logger.verbose = console.debug;

export const createEffectLogger = (context: Context) => {
  const targetLogger = context.log;

  return EffectLogger.make(({ logLevel, message }) => {
    switch (logLevel) {
      case None:
        break;
      case Trace:
        targetLogger(message);
        break;
      case Debug:
        targetLogger.verbose(message);
        break;
      case Info:
        targetLogger.info(message);
        break;
      case Warning:
        targetLogger.warn(message);
        break;
      default:
        targetLogger.error(message);
        break;
    }
  });
};

export const createLoggerLayer = (context: Context) =>
  EffectLogger.replace(EffectLogger.defaultLogger, createEffectLogger(context));

export const setLoggerFromContext = (context: Context) => {
  logger = context.log;
};

export const logError = (...args: unknown[]) => logger.error(...args);
export const logWarn = (...args: unknown[]) => logger.warn(...args);
export const logInfo = (...args: unknown[]) => logger.info(...args);
export const logVerbose = (...args: unknown[]) => logger.verbose(...args);
export const logTrace = (...args: unknown[]) => logger(...args);
