import {Transform, TransformCallback} from 'node:stream';
import {IBufferDecoder} from '../interfaces';
import {getBufferDecoder} from '../util/conversion/bufferDecoderFactory';
import {BasicColumnNameProcessor} from './basicColumnNameProcesser';
import {error} from 'core';

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

export interface BasicCsvParserOptions {
  delimiter?: Char;
  isQuoted?: boolean;
  quoteChar?: QuoteChar;
  literalChar?: LiteralChar;
  lineTerminator?: LineTerminator;
  encoding?: string;
  bufferSize?: number;
  trimWhitespace?: boolean;
}

export class BasicCsvParser extends Transform {
  private isHeaderRow = true;
  private headers: BasicColumnNameProcessor;
  private data: Array<string[]> = [];
  private rowsProcessed = 0;
  private readonly delimiter: Char;
  private readonly isQuoted: boolean;
  private readonly lineTerminator: LineTerminator;
  private readonly quoteChar: QuoteChar;
  private readonly literalChar: LiteralChar;
  private encoding?: string;
  private decoder?: IBufferDecoder;
  private leftover?: Buffer;
  private inQuote = false;
  private currentToken?: string;
  private currentRow: string[] = [];
  private inLineTerminator = false;
  private isLiteral = false;
  private bufferSize: number;
  private smartLineTerminator: boolean;
  private trimWhitespace: boolean;
  //These are strictly for testing the buffering.
  //I need I need to make sure that the buffer is being run out
  //as expected and not as a result of flush being called.
  private processedBufferBeforeFlush = false;
  private isFlushed = false;
  constructor({
    delimiter = ',',
    isQuoted = true,
    quoteChar = '"',
    literalChar = '\\',
    encoding = '',
    bufferSize = 100, //100 rows
    lineTerminator = undefined,
    trimWhitespace = true,
  }: BasicCsvParserOptions) {
    super({objectMode: true});

    this.delimiter = delimiter;
    this.isQuoted = isQuoted;
    this.encoding = encoding;
    this.quoteChar = quoteChar;
    this.literalChar = literalChar;
    this.headers = new BasicColumnNameProcessor();
    this.bufferSize = bufferSize;
    this.lineTerminator = lineTerminator ?? '\n';
    this.smartLineTerminator = !lineTerminator;
    this.trimWhitespace = trimWhitespace;
  }

  cleanRow(row: string[]): Record<string, string> {
    let cleanedRow: Record<string, string> = {};
    //TODO: Do we have an appropriate number of columns
    let numberOfColumns = this.headers.getColumnCount();
    if (row.length !== numberOfColumns) {
      throw new error.InvalidArgumentError(
        `The number of columns in the row: ${row.length} does not match the number of columns in the header: ${numberOfColumns}`,
        'row',
        row
      );
    }

    for (let i = 0; i < numberOfColumns; i++) {
      let columnDefinition = this.headers.getColumn(i);
      if (columnDefinition.isIncluded) {
        cleanedRow[columnDefinition.finalName] = row[i];
      }
    }
    return cleanedRow;
  }
  validateDataAgainstHeaders() {
    let validityData: {index: number; rowCount: number; rowsWithValues: number; percentFilled: number}[] = [];
    for (let i = 0; i < this.headers.getColumnCount(); i++) {
      validityData.push({index: i, rowCount: 0, rowsWithValues: 0, percentFilled: 0});
    }

    this.data.forEach((row) => {
      for (let i = 0; i < row.length; i++) {
        validityData[i].rowCount++;
        if (row[i].length > 0) {
          validityData[i].rowsWithValues++;
        }
        validityData[i].percentFilled = validityData[i].rowsWithValues / validityData[i].rowCount;
      }
    });

    for (let i = 0; i < validityData.length; i++) {
      //If the first this.bufferSize rows are empty, disable the column.
      //this will remove empty columns without coloumn headers from the output.
      if (validityData[i].percentFilled === 0) {
        this.headers.disableColumn(i);
      }
    }

    let enabledColumns = this.headers.getEnabledColumnsCount();
    if (enabledColumns < 2) {
      throw new error.InvalidArgumentError(
        `You need at least 2 columns in the first : ${this.bufferSize} with data.`,
        'data',
        this.data
      );
    }
  }
  processBufferedRows() {
    //This is for testing purposes only. Please do not remove it.
    this.processedBufferBeforeFlush = !this.isFlushed;
    this.validateDataAgainstHeaders();
    this.data.forEach((row) => {
      let cleanedRow = this.cleanRow(row);
      this.push(cleanedRow);
    });
    this.data = [];
  }

  processRow(row: string[]) {
    if (this.rowsProcessed < this.bufferSize) {
      this.rowsProcessed++;
      this.data.push(row);
    } else {
      if (this.data.length > 0) {
        this.processBufferedRows();
      }
      const formattedRow = this.cleanRow(row);
      this.push(formattedRow);
    }
  }

  _flush(callback: TransformCallback) {
    //this is for testing purposes only. Please do not remove it.
    if (this.data.length > 0) {
      this.isFlushed = true;
      this.processBufferedRows();
    }
    //We could have one last row that does not have a line terminator
    if (this.currentToken !== undefined || this.currentRow.length > 0) {
      if (this.currentToken !== undefined) {
        this.currentRow.push(this.trimWhitespace ? this.currentToken.trim() : this.currentToken);
      }
      this.currentToken = undefined;
      let cleanedRow = this.cleanRow(this.currentRow);
      this.push(cleanedRow);
    }
    callback();
  }

  _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
    try {
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
          this.isHeaderRow
            ? this.headers.AddColumn(this.currentToken ?? '')
            : this.currentRow.push(this.trimWhitespace ? this.currentToken?.trim() ?? '' : this.currentToken ?? '');
          this.currentToken = undefined;
        } else if (
          !this.isLiteral &&
          !this.inQuote &&
          //smart terminator will push a new row if anytime it sees a unuoted \r or \n.  Since we have
          //logic to swallow empty rows this will not add extra data.
          ((this.smartLineTerminator && (char === '\r' || char === '\n')) ||
            //if we are not using smart terminator, process this as normal.
            (this.smartLineTerminator == false && this.lineTerminator.length === 1 && char === this.lineTerminator))
        ) {
          if (this.currentToken !== undefined) {
            this.isHeaderRow
              ? this.headers.AddColumn(this.currentToken)
              : this.currentRow.push(this.trimWhitespace ? this.currentToken?.trim() ?? '' : this.currentToken ?? '');
          }
          if (!this.isHeaderRow) {
            if (this.currentRow.length > 0) this.processRow(this.currentRow);
          }
          this.isHeaderRow = false;
          //this.processHeaders();
          this.currentRow = [];
          this.inLineTerminator = false;
          this.currentToken = undefined;
        } else if (
          !this.isLiteral &&
          !this.inQuote &&
          //when using smart terminator, lineTerminator will never be 2 characters long. We set it the default of \n
          //which is not actually ever used
          this.lineTerminator.length === 2 &&
          char === this.lineTerminator[0]
        ) {
          this.inLineTerminator = true;
        } else if (!this.isLiteral && !this.inQuote && this.inLineTerminator && char === this.lineTerminator[1]) {
          if (this.currentToken !== undefined) {
            this.isHeaderRow
              ? this.headers.AddColumn(this.currentToken)
              : this.currentRow.push(this.trimWhitespace ? this.currentToken?.trim() ?? '' : this.currentToken ?? '');
          }
          if (!this.isHeaderRow) {
            if (this.currentRow.length > 0) this.processRow(this.currentRow);
          }

          this.isHeaderRow = false;
          this.currentRow = [];
          this.inLineTerminator = false;
          this.currentToken = undefined;
        } else if (!this.isLiteral && this.inLineTerminator) {
          if (this.currentToken === undefined) this.currentToken = '';
          this.currentToken += this.lineTerminator[0] + char;
          this.inLineTerminator = false;
        } else {
          //it is possible to fall through here with the first part
          //of a \r\n line terminator.  Say a field has \r1 in it.
          //This will cover that edge case.
          if (this.currentToken === undefined) this.currentToken = '';
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
    } catch (err: any) {
      let e = new error.FileParseError(
        `An error occurred while parsing the file: ${err.message ?? err} See the inner error for additional information.`,
        err
      );
      callback(e);
    }
  }
}
