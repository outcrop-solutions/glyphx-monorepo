/**
 * Defines the shape to be used by classes implemented to
 * clean columns names for storing files in various underlyinbg
 * technologies.
 */
export interface IColumnNameCleaner {
  /**
   *  takes a column name string and returns a cleaned string
   *
   *  @throws glyphx-core.error.InvalidArgumentError if the value
   *  cannot be cleaned.
   */
  cleanColumnName(value: string): string;
}

/**
 * Since our pipeline uses dependency injection, this interface
 * defines the constructor so that pipelines can predictably
 * construct classes implementing {@link IColumnNameCleaner}
 */
export interface IConstructableColumnNameCleaner {
  new (): IColumnNameCleaner;
}
