import {IBufferDecoder} from '../../interfaces';
import {Utf8Decoder} from './utf8Decoder';
import {Utf16Decoder} from './utf16Decoder';
import {AsciiDecoder} from './asciiDecoder';
import {Latin1Decoder} from './latin1Decoder';

export function getBufferDecoder(encoding: string): IBufferDecoder {
  let cleanEncoding = encoding.trim().toLowerCase().replaceAll('-', '');
  switch (encoding) {
    case 'utf8':
      return new Utf8Decoder();
    case 'utf16' || 'utf16le' || 'utf16be' || 'ucs2':
      return new Utf16Decoder();
    case 'ascii':
      return new AsciiDecoder();
    case 'latin1':
      return new Latin1Decoder();
    default:
      throw new Error('Unsupported encoding');
  }
}
