import {Transform, TransformCallback} from 'node:stream';

// function getBufferDecoder(encoding: SupportedEncoding): BufferDecoder {
//   switch (encoding) {
//     case 'utf8':
//       return new Utf8Decoder();
//     default:
//       throw new Error(`Unsupported encoding: ${encoding}`);
//   }
// }
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
  encoding: SupportedEncoding;
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
  private readonly encoding: SupportedEncoding;

  constructor({
    delimiter = ',',
    isQuoted = true,
    rowsToProcess = 100,
    lineTerminator = '\r\n',
    encoding = 'utf8',
  }: BasicCsvParserOptions) {
    super({objectMode: true});

    this.delimiter = delimiter;
    this.isQuoted = isQuoted;
    this.rowsToProcess = rowsToProcess;
    this.lineTerminator = lineTerminator;
    this.encoding = encoding;
  }

  convertChunkToString(chunk: Buffer | string | any, encoding: SupportedEncoding) {
    if (typeof chunk === 'string') {
      return chunk;
    } else if (Buffer.isBuffer(chunk)) {
      return chunk.toString(encoding);
    } else {
    }
  }
  _transform(chunk: Buffer, encoding: SupportedEncoding, callback: TransformCallback) {
    // const strChunk = chunk.toString(encoding || this.encoding);
    // const rows = chunk.split('\n');
    // rows.forEach((row, index) => {
    //   if (this.isHeaderRow) {
    //     this.headers = row.split(',');
    //     this.isHeaderRow = false;
    //   } else {
    //     const values = row.split(',');
    //     const obj: Record<string, string> = {};
    //     this.headers.forEach((header, index) => {
    //       obj[header] = values[index];
    //     });
    //     this.push(obj);
    //   }
    // });
    callback();
  }
}
