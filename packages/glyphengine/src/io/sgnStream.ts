import {Transform, TransformCallback} from 'stream';
import {IGlyph} from '../interfaces/iGlyph';

export const MAGIC_NUMBER = 0x294ee1ac;
export const FORMAT_VERSION = 2;

export class SgnStream extends Transform {
  private baseImageCount: number;
  private glyphNodeCount: number;

  constructor() {
    super({objectMode: true});
    this.baseImageCount = 1;
    this.glyphNodeCount = 0;
  }

  _transform(chunk: IGlyph, encoding: BufferEncoding, callback: TransformCallback) {
    this.glyphNodeCount++;
    callback();
  }

  //we really only need to accumulate the number of glyph nodes
  //until the pipeline is ready to wrap up, then we can write the sgn
  //file to s3.
  _flush(callback: TransformCallback) {
    const buffer = Buffer.alloc(20);
    let offset = 0;
    buffer.writeUInt32BE(MAGIC_NUMBER, offset);
    offset += 4;
    buffer.writeUInt32BE(FORMAT_VERSION, offset);
    offset += 4;
    buffer.writeUInt32BE(this.baseImageCount, offset);
    offset += 4;
    buffer.writeUInt32BE(this.glyphNodeCount, offset);
    offset += 4;
    buffer.writeUInt32BE(0, offset);
    offset += 4;
    this.push(buffer);
    callback();
  }
}
