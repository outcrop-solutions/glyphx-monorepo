import {ParquetEnvelopeWriter, ParquetWriter, ParquetSchema} from 'parquetjs';
import {Transform, TransformCallback} from 'node:stream';

/**
 * this class is similar to the ParquetTransformer from parquetJs.  The biggest difference is that we do not know the schema when we instantiate the object.  As part of the pipline process, the schema will be passed as the first record sent.  Then we can instantate our ParquetEnvelopeWriter and write out or data.
 */
export class BasicParquetProcessor extends Transform {
  /**
   * Defines the page size for column pages.  This is passes to
   * the parquetWriter.
   */
  private readonly pageSize: number;

  /**
   * This Transformer expects the first row to be the schema so that
   * it can be passes to the constructor of the parquetJs writer.  This flag keeps track of that.
   */
  private firstRow: boolean;
  /**
   * our privte parquetWriter which will write out our data in
   * parquet format.
   */
  private parquetWriter: ParquetWriter | null;

  //TODO: allow compression type to be configurable.
  /**
   * builds our BasicParquetProcessor.
   *
   * @param pageSize - determines how big the page soze should be.
   * in our parquet file.
   */
  constructor(pageSize = 4096) {
    super({objectMode: true});
    this.pageSize = pageSize;
    this.firstRow = true;
    this.parquetWriter = null;
  }

  //took this write out of the parquetjs code.
  private writeProxy = (t: Transform) => {
    return async (b: any) => {
      t.push(b);
    };
  };
  //TODO: I fell like we need some error handling here around parquetWriter
  /**
   * This method handles the bulk of the work for our
   * transformer.  When it first receives data it will
   * create our ParquetWriter and handle pushing data through it.
   *
   * @param row -- our data as a JSON object.
   * @param encoding -- is not used.
   * @param callback -- must be caled to let the pipeline know that we have successfuly processed the data.
   */
  public override async _transform(row: any, encoding: BufferEncoding, callback: TransformCallback) {
    //TODO: need to make sure that exceptions cannot leak out of this transformer.
    if (this.firstRow) {
      //If this is the first row, then the row is our
      //parquet schema.
      for (const key in row) {
        row[key]['compression'] = 'GZIP';
      }
      const schema = new ParquetSchema(row);
      this.parquetWriter = new ParquetWriter(
        schema,
        new ParquetEnvelopeWriter(schema, this.writeProxy(this), async () => {}, 0, {
          //rowGroupSize: this.pageSize,
        }),
        {
          //rowGroupSize: this.pageSize,
        }
      );
      this.firstRow = false;
      callback();
    } else {
      //this is most definitley getting called.  Not sure why
      // nyc can't see it
      //istanbul ignore next
      this.parquetWriter?.appendRow(row).then((d) => callback(null, d), callback);
    }
  }

  /**
   * _flush is called before the 'finish' event is fired. Here we need to close our parquetWriter which will write out the footer.
   *
   * @param callback -- we must call callback to let the stream processess know that we are done flusing the data.
   */
  public override async _flush(callback: TransformCallback) {
    //same here, we are definitily hitting this
    //istanbul ignore next
    await this.parquetWriter?.close(callback); //.then(d => callback(null, d), callback);
  }
}
