import {IBufferDecoder} from '../../interfaces';
import {Utf8Decoder} from './utf8Decoder';
import {Utf16Decoder} from './utf16Decoder';
import {AsciiDecoder} from './asciiDecoder';
import {Latin1Decoder} from './latin1Decoder';
import {error} from 'core';

export function getBufferDecoder(encoding: string): IBufferDecoder {
  let cleanEncoding = encoding.trim().toLowerCase().replaceAll('-', '');
  switch (cleanEncoding) {
    case 'utf8':
      return new Utf8Decoder();
    case 'utf16le':
    case 'utf16be':
    case 'ucs2':
    case 'utf16':
      return new Utf16Decoder();
    case 'ascii':
      return new AsciiDecoder();
    case 'latin1':
      return new Latin1Decoder();
    default:
      throw new error.InvalidArgumentError(`The encoding ${encoding} is not supported.`, 'encoding', encoding);
  }
}
