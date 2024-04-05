import {IBufferDecoder} from '../../interfaces/iBufferDecoder';
import {error} from 'core';
export class AsciiDecoder implements IBufferDecoder {
  getChar(buffer: Buffer, offset: number): [string, number] | undefined {
    if (buffer.length === 0 || offset >= buffer.length) {
      return undefined; // No bytes
    }

    const byteValue = buffer[offset];

    // Check if in the valid ASCII range (0-127)
    if (byteValue >= 0 && byteValue <= 127) {
      return [String.fromCharCode(byteValue), 1]; // 1-byte character
    } else {
      throw new error.InvalidArgumentError(
        `The byteValue: ${byteValue} is not a valid ASCII character code`,
        'byteValue',
        byteValue
      );
    }
  }
}
