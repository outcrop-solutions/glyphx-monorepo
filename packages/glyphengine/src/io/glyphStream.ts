import {Transform} from 'stream';
import {IGlyph, IInputField, IProperty} from '../interfaces';
import {SdtParser} from './sdtParser';
import {
  linearInterpolation,
  logaritmicInterpolation,
  convertRgbToHsv,
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

    const {h, s, v, a} = this.getColorInterpolatedValue(chunk);

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
    const filedName = this.sdtParser.getInputFields().z.field;
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
    h: number;
    s: number;
    v: number;
    a: number;
  } {
    const inputField = this.sdtParser.getInputFields().z;
    const value = this.getValue(inputField, values);
    const propertyField = this.sdtParser.getGlyphProperty(
      'Color',
      'RGB'
    ) as IProperty;

    const rawMinColor = propertyField.minRgb;
    const rawMaxColor = propertyField.maxRgb;
    //this is harcoded in the template. Should we ever change it, we will need to update this.

    const r = Math.trunc(
      linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        rawMinColor[0],
        rawMaxColor[0]
      )
    );

    const g = Math.trunc(
      linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        rawMinColor[1],
        rawMaxColor[1]
      )
    );

    const b = Math.trunc(
      linearInterpolation(
        value as number,
        inputField.min,
        inputField.max,
        rawMinColor[2],
        rawMaxColor[2]
      )
    );
    const [h, s, v] = convertRgbToHsv(r, g, b);

    const a = 255;
    return {h, s, v, a};
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
