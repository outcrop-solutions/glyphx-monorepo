import {IBufferDecoder} from '../../interfaces/iBufferDecoder';

export class Latin1Decoder implements IBufferDecoder {
  getChar(buffer: Buffer, offset: number): [string, number] | undefined {
    if (buffer.length === 0 || offset >= buffer.length) {
      return undefined; // No bytes
    }

    const byteValue = buffer[offset];

    return [String.fromCharCode(byteValue), 1]; // 1-byte character
  }
}
