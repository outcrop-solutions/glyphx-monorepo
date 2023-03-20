import {Winston, logger as winstonLogger} from './winston';

/**
 * An interface that defines the shape of log messages/
 */
export interface ILogObject {
  /**
   * a key that can be used to correlates similar messages
   */
  correlationId: string;
  /**
   * the information actually being logged
   */
  body: unknown;
  /**
   * the date/time of the message.
   */
  messageDate: Date;
}

/**
 * Our class which handles all of the applicatoins logging.
 * Generally implemeters should use the exported singleton
 * exported through the default module export.  This ensures
 * that we only have one logger running at a time
 */
export class Logger {
  /**
   * Our instance field to enforce our singleton pattern
   */
  static instanceField: Logger = new Logger();

  /**
   * Provides readonly access to our {@link instanceField | instance}
   */
  static get instance(): Logger {
    return Logger.instanceField;
  }

  //Calls to logger will get swallowed until winston logger has been inited
  /*
   * a private constructor ensures that we enforce a singleton pattern.
   */
  private constructor() {}

  /**
   * Converts our params into a {@link ILogObject}
   */
  buildLogObject(correlationId: string, logMessage: unknown): ILogObject {
    return {
      correlationId: correlationId,
      body: logMessage,
      messageDate: new Date(),
    };
  }
  /**
   * Since we are using a singleton pattern here, we need
   * a separate init() method which will get called from app. Calling log
   * functions before a call to init will not through an error but will
   * cause the messages to be swallowed.
   */
  async init() {
    Winston.instance.init();
  }
  /**
   * The lowest logging method which can be used to send the minutia.
   */
  silly(correlationId: string, logMessage: unknown) {
    /* istanbul ignore else */
    if (winstonLogger)
      winstonLogger.silly(this.buildLogObject(correlationId, logMessage));
  }

  /**
   * Use this method to send messages related to debugging.
   */
  debug(correlationId: string, logMessage: unknown) {
    /* istanbul ignore else */
    if (winstonLogger)
      winstonLogger.debug(this.buildLogObject(correlationId, logMessage));
  }
  /**
   * Use this method to send verbose messages.
   */
  verbose(correlationId: string, logMessage: unknown) {
    /* istanbul ignore else */
    if (winstonLogger)
      winstonLogger.verbose(this.buildLogObject(correlationId, logMessage));
  }
  /**
   * Use this method to send informational messages.  This is the default level.
   */
  info(correlationId: string, logMessage: unknown) {
    /* istanbul ignore else */
    if (winstonLogger)
      winstonLogger.info(this.buildLogObject(correlationId, logMessage));
  }
  /**
   * Use this method to send warnings.
   */
  warn(correlationId: string, logMessage: unknown) {
    /* istanbul ignore else */
    if (winstonLogger)
      winstonLogger.warn(this.buildLogObject(correlationId, logMessage));
  }
  /**
   * Use this method to send Error messages.
   */
  error(correlationId: string, logMessage: unknown) {
    /* istanbul ignore else */
    if (winstonLogger)
      winstonLogger.error(this.buildLogObject(correlationId, logMessage));
  }
}

export default Logger.instance;
