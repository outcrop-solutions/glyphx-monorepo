import {XMLParser} from 'fast-xml-parser';
import {ISdtDocument} from '../interfaces';

enum SHAPE {
  CUBE,
  SPHERE,
  CYLINDER,
  PIN,
}

export class SdtParser {
  private readonly sdtAsJson: ISdtDocument;
  private constructor(parsedDocument: any) {
    this.sdtAsJson = parsedDocument;
  }

  public static parseSdtString(sdtString: string): SdtParser {
    const options = {
      ignoreAttributes: false,
    };

    const parser = new XMLParser(options);
    const parsedDocument = parser.parse(sdtString);

    const sdtParser = new SdtParser(parsedDocument);
    return sdtParser;
  }
}
