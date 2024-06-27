import {IGlyph} from 'interfaces';
import {Transform} from 'stream';

export class GlyphVerifierStream extends Transform {
  private originalChunks: Map<number, IGlyph>;

  constructor() {
    super({objectMode: true});
    this.originalChunks = new Map<number, IGlyph>();
  }

  // Store the original description with an offset for later verification
  storeOriginalChunks(offset: number, chunk: IGlyph) {
    // console.log(`Storing description at offset ${offset}: ${desc}`);
    this.originalChunks.set(offset, chunk);
  }

  _transform(chunk: Buffer, encoding: string, callback: Function) {
    try {
      // console.log(`Received chunk with length: ${chunk.length}`);

      if (chunk.length === 52) {
        // Skip the base image buffer
        console.log('Skipping base image buffer.');
        callback();
        return;
      }

      // Extract the offset from the buffer
      const offset = chunk.readUInt32BE(0);
      // console.log(`Processing buffer with offset ${offset}`);

      // Read the tag length and ensure it's within the buffer length
      const tagLengthOffset = 74;
      if (tagLengthOffset + 2 > chunk.length) {
        throw new RangeError(
          `Buffer length ${chunk.length} is too short to contain a tag length at offset ${tagLengthOffset}`
        );
      }
      const tagLength = chunk.readUInt16BE(tagLengthOffset);

      // Read the URL length and ensure it's within the buffer length
      const urlLengthOffset = tagLengthOffset + 2 + tagLength;
      if (urlLengthOffset + 2 > chunk.length) {
        throw new RangeError(
          `Buffer length ${chunk.length} is too short to contain a URL length at offset ${urlLengthOffset}`
        );
      }
      const urlLength = chunk.readUInt16BE(urlLengthOffset);

      // Calculate the starting point for the description
      const descStart = urlLengthOffset + 2 + urlLength;
      if (descStart + 2 > chunk.length) {
        throw new RangeError(
          `Buffer length ${chunk.length} is too short to contain a description length at offset ${descStart}`
        );
      }

      // Extract the description length and ensure it's within the buffer length
      const descLength = chunk.readUInt16BE(descStart);
      if (descStart + 2 + descLength > chunk.length) {
        throw new RangeError(
          `Buffer length ${chunk.length} is too short to contain a description at offset ${descStart}`
        );
      }

      const descBuffer = chunk.slice(descStart + 2, descStart + 2 + descLength);
      const decodedChunk = descBuffer.toString('utf-8');

      // Compare the extracted description with the original description
      const originalChunk = this.originalChunks.get(offset);
      // @ts-ignore
      const match = originalChunk === decodedChunk;

      // Log the comparison result
      if (!match) {
        console.log(`Offset: ${offset}`);
        console.log(`Original Pos: ${originalChunk}`);
        console.log(`Decoded POs: ${decodedChunk}`);
      }

      this.push(chunk);
      callback();
    } catch (err) {
      console.error('Error processing buffer:', err);
      callback(err);
    }
  }
}
