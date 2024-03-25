import {Transform, TransformCallback} from 'node:stream';
import {IBufferDecoder} from '../interfaces';
import {getBufferDecoder} from '../util/conversion/bufferDecoderFactory';
type Char =
  | '!'
  | '#'
  | '$'
  | '%'
  | '&'
  | "'"
  | '('
  | ')'
  | '*'
  | '+'
  | ','
  | '-'
  | '.'
  | '/'
  | ':'
  | ';'
  | '<'
  | '='
  | '>'
  | '?'
  | '@'
  | '['
  | ']'
  | '^'
  | '_'
  | '`'
  | '{'
  | '|'
  | '}'
  | '~';

type LineTerminator = '\n' | '\r' | '\r\n';

type SupportedEncoding = 'utf8' | 'ascii' | 'utf16le' | 'utf16be' | 'utf16' | 'ucs2' | 'latin1';

export interface BasicCsvParserOptions {
  delimiter?: Char;
  isQuoted?: boolean;
  rowsToProcess?: number;
  lineTerminator?: LineTerminator;
  encoding?: string;
}

export class BasicCsvParser extends Transform {
  private isHeaderRow = true;
  private headers: string[] = [];
  private data: [[]] = [[]];
  private rowsProcessed = 0;
  private readonly rowsToProcess: number;
  private readonly delimiter: Char;
  private readonly isQuoted: boolean;
  private readonly lineTerminator: LineTerminator;
  private encoding?: string;
  private decoder?: IBufferDecoder;
  private leftover?: Buffer;

  constructor({
    delimiter = ',',
    isQuoted = true,
    rowsToProcess = 100,
    lineTerminator = '\r\n',
    encoding = '',
  }: BasicCsvParserOptions) {
    super({objectMode: true});

    this.delimiter = delimiter;
    this.isQuoted = isQuoted;
    this.rowsToProcess = rowsToProcess;
    this.lineTerminator = lineTerminator;
    this.encoding = encoding;
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
    if (!this.decoder) {
      let localEncoding = encoding || this.encoding || 'utf8';
      this.decoder = getBufferDecoder(localEncoding);
      this.encoding = localEncoding;
    }

    let buffer = this.leftover ? Buffer.concat([this.leftover, chunk]) : chunk;
    const maxLen = chunk.length;
    let bytesConsumed = 0;
    let result: [string, number] | undefined;
    while ((result = this.decoder.getChar(buffer, bytesConsumed)) && bytesConsumed < maxLen) {
      let [char, charSize] = result;
      bytesConsumed += charSize;
      console.log(char);
    }
    if (bytesConsumed < maxLen)
      //create a new buffer because subArrary points to the same memory location
      //and I think will cause garbage collection to keep the original buffer around
      this.leftover = Buffer.from(chunk.subarray(bytesConsumed));
    callback();
  }
}
