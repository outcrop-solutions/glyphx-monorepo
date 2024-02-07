import {XMLParser} from 'fast-xml-parser';
import {sdt, IDataSource, IProperty, IInputField} from '../interfaces';
import {FUNCTION, TYPE, SHAPE} from '../constants';
import {MinMaxCalculator} from './minMaxCalulator';
import {TextColumnToNumberConverter} from './textToNumberConverter';
import {aws} from 'core';
import {ISdtDocument} from 'interfaces/sdt';
import {glyphEngineTypes} from 'types';

export interface IInputFields {
  x: IInputField;
  y: IInputField;
  z: IInputField;
}
export class SdtParser {
  private readonly sdtAsJson: sdt.ISdtDocument | undefined;
  private readonly viewName: string | undefined;
  private inputFieldsField?: IInputFields;
  private readonly bindings: {x: string; y: string; z: string} | undefined;
  private readonly shapeField: SHAPE;
  private readonly data: Map<string, string> | undefined;
  private readonly athenaManager: aws.AthenaManager | undefined;
  private xCol: string;
  private yCol: string;
  private zCol: string;
  public isXDate: boolean;
  public xDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
  public isYDate: boolean;
  public yDateGrouping: glyphEngineTypes.constants.DATE_GROUPING;
  public isZDate: boolean;
  private zColName: string;
  private zAccumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE;

  constructor(
    isXDate: boolean,
    xDateGrouping: glyphEngineTypes.constants.DATE_GROUPING,
    isYDate: boolean,
    yDateGrouping: glyphEngineTypes.constants.DATE_GROUPING,
    isZDate: boolean,
    xCol: string,
    yCol: string,
    zCol: string,
    zColName: string,
    zAccumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE,
    parsedDocument?: sdt.ISdtDocument,
    viewName?: string,
    data?: Map<string, string>,
    athenaManager?: aws.AthenaManager
  ) {
    this.xCol = xCol;
    this.yCol = yCol;
    this.zCol = zCol;
    this.isXDate = isXDate;
    this.xDateGrouping = xDateGrouping;
    this.isYDate = isYDate;
    this.yDateGrouping = yDateGrouping;
    this.isZDate = isZDate;
    this.zColName = zColName;
    this.zAccumulatorType = zAccumulatorType;
    this.sdtAsJson = parsedDocument;
    this.viewName = viewName;
    if (viewName) {
      this.bindings = this.getBindings();
    }
    this.shapeField = SHAPE.CUBE;
    this.data = data;
    this.athenaManager = athenaManager;
  }

  private getBindings() {
    const position = this.sdtAsJson!.Transform.Glyphs.Glyph.Position;
    const x = position.X.Binding['@_fieldId'];
    const y = position.Y.Binding['@_fieldId'];
    const z = position.Z.Binding['@_fieldId'];
    return {x, y, z};
  }

  private getSdtInpuField(field: 'x' | 'y' | 'z'): sdt.ISdtInputField {
    const binding = this.bindings![field];
    const inputField = this.sdtAsJson!.Transform.InputFields.InputField.find(
      (i) => i['@_name'] === binding
    ) as sdt.ISdtInputField;
    return inputField;
  }

  private async buildInputField(
    fieldName: string,
    sdtInputField: sdt.ISdtInputField,
    minMax: any,
    //istanbul ignore next
    stringDataType = 'Text'
  ): Promise<IInputField> {
    let type = TYPE.TEXT;
    if (stringDataType === 'number') {
      type = TYPE.REAL;
    } else if (stringDataType === 'date') {
      type = TYPE.DATE;
    }

    const retval: IInputField = {
      name: sdtInputField['@_name'],
      id: sdtInputField['@_id'],
      type: type,
      field: sdtInputField['@_field'],
      min: minMax[fieldName].min,
      max: minMax[fieldName].max,
      table: this.viewName!,
    };

    if (retval.type === TYPE.TEXT && fieldName !== 'z') {
      const textToNumberConverter = new TextColumnToNumberConverter(this.viewName!, retval.field, this.athenaManager!);
      await textToNumberConverter.load();
      retval.text_to_num = textToNumberConverter;
      retval.min = 0;
      retval.max = retval.text_to_num.size - 1;
    }
    return retval;
  }

  private async loadInputFields(): Promise<void> {
    const x = this.getSdtInpuField('x');
    const y = this.getSdtInpuField('y');
    const z = this.getSdtInpuField('z');

    const minMaxCalculator = new MinMaxCalculator(
      this.xCol,
      this.yCol,
      this.zCol,
      this.zColName,
      this.athenaManager!,
      this.viewName!,
      x['@_field'],
      y['@_field'],
      z['@_field']
    );

    await minMaxCalculator.load();
    const xInputField = await this.buildInputField('x', x, minMaxCalculator.minMax, this.data!.get('type_x') as string);

    const yInputField = await this.buildInputField('y', y, minMaxCalculator.minMax, this.data!.get('type_y') as string);

    const zInputField = await this.buildInputField('z', z, minMaxCalculator.minMax, this.data!.get('type_z') as string);

    this.inputFieldsField = {x: xInputField, y: yInputField, z: zInputField};
  }

  public async parseSdtString(
    sdtString: string,
    viewName: string,
    data: Map<string, string>,
    athenaManager: aws.AthenaManager
  ): Promise<SdtParser> {
    const options = {
      ignoreAttributes: false,
    };

    const parser = new XMLParser(options);
    const parsedDocument = parser.parse(sdtString);

    const sdtParser = new SdtParser(
      this.isXDate,
      this.xDateGrouping,
      this.isYDate,
      this.yDateGrouping,
      this.isZDate,
      this.xCol,
      this.yCol,
      this.zCol,
      this.zColName,
      this.zAccumulatorType,
      parsedDocument as unknown as ISdtDocument,
      viewName,
      data,
      athenaManager
    );
    await sdtParser.loadInputFields();
    return sdtParser;
  }

  public get accumulatorType(): glyphEngineTypes.constants.ACCUMULATOR_TYPE {
    return this.zAccumulatorType;
  }

  public getDataSource(): IDataSource {
    const dataSource = this.sdtAsJson!.Transform.Datasources.Datasource;
    const retval: IDataSource = {
      source: dataSource['@_source'],
      type: dataSource['@_type'],
      id: dataSource['@_id'],
      tableName: this.viewName!,
    };

    return retval;
  }

  public getGlyphProperty(
    propertyName: 'Position' | 'Scale' | 'Color',
    axis: 'X' | 'Y' | 'Z' | 'RGB' | 'Transparency'
  ): IProperty | null {
    const glyph = this.sdtAsJson!.Transform.Glyphs.Glyph;
    const property = glyph[propertyName];

    if (!property) return null;

    const subProperty = property[axis];
    if (!subProperty) return null;

    let retval: IProperty;

    const propFunction =
      subProperty.Function['@_type'] === 'Text Interpolation'
        ? FUNCTION.TEXT_INTERPOLATION
        : subProperty.Function['@_type'] === 'Linear Interpolation'
          ? FUNCTION.LINEAR_INTERPOLATION
          : FUNCTION.LOGARITHMIC_INTERPOLATION;

    if (axis === 'RGB') {
      const minRgb = this.parseRgb(subProperty.Min);

      const diffRgb = this.parseRgb(subProperty.Difference);

      const maxRgb = minRgb.map((n: number, index: number) => n + diffRgb[index]);

      retval = {
        binding: '',
        function: propFunction,
        min: 0,
        max: 0,
        minRgb: minRgb,
        maxRgb: maxRgb,
      };
    } else {
      const min = this.parseNumber(subProperty.Min);
      const difference = this.parseNumber(subProperty.Difference);
      retval = {
        binding: subProperty.Binding?.['@_fieldId'] ?? '',
        function: propFunction,
        min: min,
        max: min + difference,
        minRgb: [],
        maxRgb: [],
      };
    }
    return retval;
  }

  private parseNumber(input: any): number {
    let retval = parseInt(input);
    if (isNaN(retval)) {
      retval = 0;
    }
    return retval;
  }

  private parseRgb(input: string): number[] {
    const retval: number[] = input.split(',').map((n) => {
      return this.parseNumber(n);
    });

    return retval;
  }

  public getInputFields(): IInputFields {
    return this.inputFieldsField as IInputFields;
  }

  public getShape(): SHAPE {
    return this.shapeField;
  }
}
