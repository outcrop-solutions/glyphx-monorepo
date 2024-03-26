import {Transform, TransformCallback} from 'node:stream';
import {IBufferDecoder} from '../interfaces';
import {getBufferDecoder} from '../util/conversion/bufferDecoderFactory';
import {BasicColumnNameProcessor} from './basicColumnNameProcesser';
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

type QuoteChar = '"' | "'" | '`';
type LiteralChar = '\\' | '/';
type LineTerminator = '\n' | '\r' | '\r\n';
type SupportedEncoding = 'utf8' | 'ascii' | 'utf16le' | 'utf16be' | 'utf16' | 'ucs2' | 'latin1';

export interface BasicCsvParserOptions {
  delimiter?: Char;
  isQuoted?: boolean;
  quoteChar?: QuoteChar;
  literalChar?: LiteralChar;
  rowsToProcess?: number;
  lineTerminator?: LineTerminator;
  encoding?: string;
}

interface IColumnHeader {
  origionalName: string;
  cleanedName: string;
  isUsed: boolean;
}

export class BasicCsvParser extends Transform {
  private isHeaderRow = true;
  private headers: BasicColumnNameProcessor;
  private data: Array<string[]> = [];
  private rowsProcessed = 0;
  private readonly rowsToProcess: number;
  private readonly delimiter: Char;
  private readonly isQuoted: boolean;
  private readonly lineTerminator: LineTerminator;
  private readonly quoteChar: QuoteChar;
  private readonly literalChar: LiteralChar;
  private encoding?: string;
  private decoder?: IBufferDecoder;
  private leftover?: Buffer;
  private inQuote = false;
  private nextIsLiteral = false;
  private currentToken = '';
  private currentRow: string[] = [];
  private inLineTerminator = false;
  private isLiteral = false;

  constructor({
    delimiter = ',',
    isQuoted = true,
    quoteChar = '"',
    literalChar = '\\',
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
    this.quoteChar = quoteChar;
    this.literalChar = literalChar;
    this.headers = new BasicColumnNameProcessor();
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
      //is this a delimiter.
      if (!this.isLiteral && char === this.literalChar) {
        this.isLiteral = true;
      } else if (!this.isLiteral && this.isQuoted && char === this.quoteChar) {
        this.inLineTerminator = false;
        this.inQuote = !this.inQuote;
      } else if (!this.isLiteral && !this.inQuote && char === this.delimiter) {
        this.isHeaderRow ? this.headers.AddColumn(this.currentToken) : this.currentRow.push(this.currentToken);
        this.currentToken = '';
      } else if (!this.isLiteral && !this.inQuote && this.lineTerminator.length === 1 && char === this.lineTerminator) {
        if (this.currentToken.length > 0) {
          this.isHeaderRow ? this.headers.AddColumn(this.currentToken) : this.currentRow.push(this.currentToken);
        }
        if (!this.isHeaderRow) {
          this.data.push(this.currentRow);
        }
        this.isHeaderRow = false;
        //this.processHeaders();
        this.currentRow = [];
        this.inLineTerminator = false;
        this.currentToken = '';
      } else if (
        !this.isLiteral &&
        !this.inQuote &&
        this.lineTerminator.length === 2 &&
        char === this.lineTerminator[0]
      ) {
        this.inLineTerminator = true;
      } else if (!this.isLiteral && !this.inQuote && this.inLineTerminator && char === this.lineTerminator[1]) {
        if (this.currentToken.length > 0) {
          this.isHeaderRow ? this.headers.AddColumn(this.currentToken) : this.currentRow.push(this.currentToken);
        }
        if (!this.isHeaderRow) {
          this.data.push(this.currentRow);
        }

        this.isHeaderRow = false;
        this.currentRow = [];
        this.inLineTerminator = false;
        this.currentToken = '';
      } else if (!this.isLiteral && this.inLineTerminator) {
        this.currentToken += this.lineTerminator[0] + char;
        this.inLineTerminator = false;
      } else {
        //it is possible to fall through here with the first part
        //of a \r\n line terminator.  Say a field has \r1 in it.
        //This will cover that edge case.
        if (this.inLineTerminator) {
          this.inLineTerminator = false;
          this.currentToken += this.lineTerminator[0];
        }
        this.currentToken += char;
        this.isLiteral = false;
        //If we fall through to here, we cant't be in a line terminator anymore.
      }
    }
    if (bytesConsumed < maxLen)
      //create a new buffer because subArrary points to the same memory location
      //and I think will cause garbage collection to keep the original buffer around
      this.leftover = Buffer.from(chunk.subarray(bytesConsumed));
    callback();
  }
}
