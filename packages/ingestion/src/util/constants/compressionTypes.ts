/**
 * This enum defines the types of compression that are
 * supported by the AWS Athena Glue system. These can
 * be used to tell the querybuilders how the data is stored.
 *
 */
export enum COMPRESSION_TYPES {
  GZIP = 'GZIP',
  LZ4 = 'LZ4',
  LZO = 'LZO',
  SNAPPY = 'SNAPPY',
  ZSTD = 'ZSTD',
  NONE = 'NONE',
}
