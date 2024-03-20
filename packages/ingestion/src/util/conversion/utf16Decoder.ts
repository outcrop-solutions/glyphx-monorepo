import {IBufferDecoder} from '../../interfaces';

export class Utf16Decoder implements IBufferDecoder {
  private hasBom = false; // Track if the BOM has been processed
  private byteOrder?: 'le' | 'be'; // Store byte order if the BOM is detected

  constructor() {}

  getChar(buffer: Buffer, offset: number): [string, number] | undefined {
    if (buffer.length === 0) {
      return undefined;
    }
    // Handle Byte-Order Mark (BOM) detection

    let thisBufferHasBom = this.detectBom(buffer);
    if (thisBufferHasBom) {
      offset += 2; // Skip BOM bytes
    }

    if (offset + 1 >= buffer.length) {
      // Need at least 2 bytes for UTF-16
      return undefined;
    }

    const codeUnit = this.byteOrder === 'le' ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset);

    // Handle surrogate pairs if necessary
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      // High surrogate
      if (offset + 3 >= buffer.length) {
        return undefined; // Incomplete surrogate pair
      }
      const secondCodeUnit =
        this.byteOrder === 'le' ? buffer.readUInt16LE(offset + 2) : buffer.readUInt16BE(offset + 2);
      const utf16Char = this.getCharFromSurrogatePair(codeUnit, secondCodeUnit);
      return [utf16Char, 4]; // Surrogate pairs consume 4 bytes
    } else {
      return [String.fromCharCode(codeUnit), 2];
    }
  }

  private detectBom(buffer: Buffer): boolean {
    if (buffer[0] === 0xfe && buffer[1] === 0xff) {
      //byte order is imuutable
      if (!this.byteOrder) {
        this.hasBom = true;
        this.byteOrder = 'be'; // Big-endian
      }
      return true;
    } else if (buffer[0] === 0xff && buffer[1] === 0xfe) {
      //byte order is imuutable
      if (!this.byteOrder) {
        this.hasBom = true;
        this.byteOrder = 'le'; // Little-endian
      }
      return true;
    }
    if (!this.byteOrder) {
      this.hasBom = false;
      this.byteOrder = 'le';
    }
    return false;
  }

  // Helper function (implementation omitted for brevity)
  private getCharFromSurrogatePair(high: number, low: number): string {
    if (high < 0xd800 || high > 0xdbff || low < 0xdc00 || low > 0xdfff) {
      throw new Error('Invalid surrogate pair');
    }

    // 2. Calculate the code point from the surrogate pair
    const codePoint = (high - 0xd800) * 0x400 + (low - 0xdc00) + 0x10000;

    // 3. Convert the code point to a JavaScript string
    return String.fromCodePoint(codePoint);
  }
}
