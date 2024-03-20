import {IBufferDecoder} from '../../interfaces';

export class Utf8Decoder implements IBufferDecoder {
  constructor() {}
  getChar(buffer: Buffer, offset: number): [string, number] | undefined {
    if (buffer.length === 0) {
      return undefined;
    }

    const firstByte = buffer[offset];
    let charactersToConsume = this.getNumberOfCharactersToConsume(firstByte);
    if (offset + charactersToConsume <= buffer.length) {
      const bytes = buffer.slice(offset, offset + charactersToConsume);
      return [bytes.toString('utf8'), charactersToConsume];
    } else {
      return undefined;
    }
  }
  private getNumberOfCharactersToConsume(firstByte: number): number {
    const singleByteMask = 0b10000000;
    if ((firstByte & singleByteMask) === 0) {
      return 1;
    }
    const firstByteMask = 0b11100000;
    const bytePattern = firstByte & firstByteMask;
    switch (bytePattern) {
      case 0b11000000:
        return 2;
      case 0b11100000:
        return 3;
      case 0b11110000:
        return 4;
      default:
        // Handle invalid sequence (throw error or replace with ?)
        throw new Error('Invalid UTF-8 byte sequence');
    }
  }
}
