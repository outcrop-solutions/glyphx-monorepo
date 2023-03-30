import winston, {transports, format, createLogger} from 'winston';
// eslint-disable-next-line
const {prettyPrint} = format;

//TODO: we need to spike on logging

export let logger: winston.Logger | null = null;

/**
 * Defines our configuration for our logging infrastructure -- Powered by winston
 * see the function {@link logging/winston!Winston.buildConfig} for the current
 * winston configuration.  This class is implemented as a singleton so
 * that updating the log level here, updates all loggers in an app.
 *
 */
export class Winston {
  private static instanceField: Winston = new Winston();
  /**
   * Access to our instance
   */
  static get instance() {
    return Winston.instanceField;
  }

  /**
   * Our constructor is private to enforce our singleton pattern.
   */
  private constructor() {}

  /**
   * builds or configuration object for use with {@link logging/winston!Winston.init} function.
   * @param level -- the string representation of a winston logging level
   */
  private buildConfig(level: string): winston.LoggerOptions {
    let config = {};

    const definedTransports = [];

    definedTransports.push(new transports.Console({}));

    //TODO: I am going to comment this out for now.  We can resurect it once we have spiked on logging
    // if (process.env.DATA_DOG_ENABLED === 'true') {
    //   const httpTransportOptions = {
    //     host: 'http-intake.logs.datadoghq.com',
    //     path: `/api/v2/logs?dd-api-key=${
    //       process.env.DATA_DOG_API_KEY
    //     }&ddsource=nodejs&service=${
    //       process.env.DATA_DOG_APP_NAME ?? 'h1-precise'
    //     }&env=${process.env.ENVIRONMENT?.toLowerCase() ?? 'dev'}`,
    //     ssl: true,
    //   };

    //   const httpTransport = new transports.Http(httpTransportOptions);
    //   definedTransports.push(httpTransport);
    // }

    config = {
      level: level,
      format: format.combine(format.json(), format.colorize()),
      transports: definedTransports,
    };
    return config;
  }
  /**
   * Initializes winston using the configuration defined in {@link logging/winston!Winston.buildConfig}
   */
  public init(): void {
    /* istanbul ignore next */
    const logLevel = process.env.LOG_LEVEL || 'info';
    if (logger)
      // our logger already exists so we just need to change the level.
      //If we are doing something with the transports we can add that update here as well
      logger.level = logLevel;
    else {
      const config = this.buildConfig(logLevel);
      logger = createLogger(config);
    }
  }
}

/**
 * @hidden
 */
export const INIT = Winston.instance.init;

export default logger;
