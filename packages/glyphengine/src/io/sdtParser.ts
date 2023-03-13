import {XMLParser} from 'fast-xml-parser';
import {sdt} from '../interfaces';

enum SHAPE {
  CUBE,
  SPHERE,
  CYLINDER,
  PIN,
}

export class SdtParser {
  private readonly sdtAsJson: ISdtDocument;
  private readonly viewName: string;
  private constructor(parsedDocument: any, viewName: string) {
    this.sdtAsJson = parsedDocument;
    this.viewName = viewName;
  }

  public static parseSdtString(sdtString: string, viewName: string): SdtParser {
    const options = {
      ignoreAttributes: false,
    };

    const parser = new XMLParser(options);
    const parsedDocument = parser.parse(sdtString);

    const sdtParser = new SdtParser(parsedDocument);
    return sdtParser;
  }

  public get;
}
