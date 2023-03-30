import {Transform} from 'stream';
import {IGlyph, IInputField, IProperty} from '../interfaces';
import {SdtParser} from './sdtParser';
import {
  linearInterpolation,
  logaritmicInterpolation,
  convertRgbToHsv,
  convertHsvToRgb,
} from '../util';
import {FUNCTION, SHAPE} from '../constants';

export class GlyphStream extends Transform {
  private sdtParser: SdtParser;
  constructor(sdtParser: SdtParser) {
    super({objectMode: true});
    this.sdtParser = sdtParser;
  }

  _transform(
    chunk: Record<string, unknown>,
    encoding: string,
    callback: Function
  ) {
    const posX = this.getInterpolatedValue('Position', 'X', chunk);
    const posY = this.getInterpolatedValue('Position', 'Y', chunk);
    const posZ = this.getInterpolatedValue('Position', 'Z', chunk);

    const scaleZ = this.getInterpolatedValue('Scale', 'Z', chunk);

    const {r: h, g: s, b: v, a} = this.getColorInterpolatedValue(chunk);

    const tag = this.getTag(chunk);
    const desc = this.getDesc(chunk);
    const glyph: IGlyph = {
      label: 0,
      parent: 0,
      positionX: posX,
      positionY: posY,
      positionZ: posZ,
      rotationX: 0.0,
      rotationY: 0.0,
      rotationZ: 0.0,
      scaleX: 1.0,
      scaleY: 1.0,
      scaleZ: scaleZ,
      colorR: h,
      colorG: s,
      colorB: v,
      alpha: a,
      geometry: SHAPE.CUBE,
      topology: 3,
      ratio: 0.1,
      rotationRateX: 0.0,
      rotationRateY: 0.0,
      rotationRateZ: 0.0,
      tag: tag,
      url: '',
      desc: desc,
    };

    this.push(glyph);
    callback();
  }

  private getDesc(chunk: Record<string, unknown>) {
    const xFieldName = this.sdtParser.getInputFields().x.field;
    const xValue = chunk[xFieldName];
    const yFieldName = this.sdtParser.getInputFields().y.field;
    const yValue = chunk[yFieldName];
    const zFieldName = this.sdtParser.getInputFields().z.field;
    const zValue = chunk[zFieldName];
    const rowIds = chunk['rowId'];

    const retval = {
      x: {},
      y: {},
      z: {},
      rowId: rowIds,
    };

    retval.x[xFieldName] = xValue;
    retval.y[yFieldName] = yValue;
    retval.z[zFieldName] = zValue;

    return JSON.stringify(retval);
  }

  private getTag(chunk: Record<string, unknown>): string {
    const filedName = this.sdtParser.getInputFields().x.field;
    const value = chunk[filedName];
    const tag = `${filedName}: ${value}`;
    return tag;
  }

  private getValue(
    inputField: IInputField,
    values: Record<string, unknown>
  ): number {
    let value = values[inputField.field] as number;

    if (typeof value === 'string') {
      value = inputField.text_to_num?.convert(value) as number;
    }

    return value;
  }
  private getColorInterpolatedValue(values: Record<string, unknown>): {
    r: number;
    g: number;
    b: number;
    a: number;
  } {
    const inputField = this.sdtParser.getInputFields().z;
    const value = this.getValue(inputField, values);
    const propertyField = this.sdtParser.getGlyphProperty(
      'Color',
      'RGB'
    ) as IProperty;

    const rawMinColor = propertyField.minRgb;
    const rawMinAsHsv = convertRgbToHsv(
      rawMinColor[0],
      rawMinColor[1],
      rawMinColor[2]
    );
    const rawMaxColor = propertyField.maxRgb;
    const rawMaxAsHsv = convertRgbToHsv(
      rawMaxColor[0],
      rawMaxColor[1],
      rawMaxColor[2]
    );
    //this is harcoded in the template. Should we ever change it, we will need to update this.

    const h = Math.trunc(
      linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        rawMinAsHsv[0],
        rawMaxAsHsv[0]
      )
    );

    const s = Math.trunc(
      linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        rawMinAsHsv[1],
        rawMaxAsHsv[1]
      )
    );

    const v = Math.trunc(
      linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        rawMinAsHsv[2],
        rawMaxAsHsv[2]
      )
    );
    const [r, g, b] = convertHsvToRgb(h, s, v);

    const a = 255;
    return {r: r, g: g, b: b, a};
  }

  private getInterpolatedValue(
    property: 'Position' | 'Scale',
    field: 'X' | 'Y' | 'Z',
    values: Record<string, unknown>
  ) {
    let retval = 0;
    const inputField = this.sdtParser.getInputFields()[field.toLowerCase()];
    const value = this.getValue(inputField, values);
    const propertyField = this.sdtParser.getGlyphProperty(
      property,
      field
    ) as IProperty;

    if (propertyField?.function === FUNCTION.LOGARITHMIC_INTERPOLATION) {
      retval = logaritmicInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        propertyField.min,
        propertyField.max
      );
    } else {
      retval = linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        propertyField.min,
        propertyField.max
      );
    }

    return retval;
  }
}
