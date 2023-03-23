import {Transform} from 'stream';
import {Buffer} from 'buffer';
import {IGlyph} from '../interfaces';
const FORMAT_VERSION = 2;
const OFFSET = 6;
import {convertTextToUtfForBuffer} from '../util/textConversion';
import {convertNumberTo32bIeee754Float} from '../util/numberConversion';
export class SgcStream extends Transform {
  private offset: number;
  constructor() {
    super({objectMode: true});
    this.offset = OFFSET;
    this.pushBaseImage();
  }

  //Put our base object onto the stream
  pushBaseImage() {
    let offset = 0;
    const buffer = Buffer.alloc(52);
    buffer.writeUInt32BE(0xa042bc3f); // magic number
    offset += 4;
    buffer.writeUInt32BE(FORMAT_VERSION, offset); // version
    offset += 4;
    //textureId
    buffer.writeUInt8(2, offset);
    offset += 1;
    //positionX
    buffer.writeFloatBE(0.0, offset);
    offset += 4;
    //positionY
    buffer.writeFloatBE(0.0, offset);
    offset += 4;
    //positionZ
    buffer.writeFloatBE(0.0, offset);
    offset += 4;
    //rotationX
    buffer.writeFloatBE(0.0, offset);
    offset += 4;
    //rotationY
    buffer.writeFloatBE(0.0, offset);
    offset += 4;
    //rotationZ
    buffer.writeFloatBE(0.0, offset);
    offset += 4;
    //colorR
    buffer.writeUInt8(0, offset);
    offset += 1;
    //colorG
    buffer.writeUInt8(0, offset);
    offset += 1;
    //colorB
    buffer.writeUInt8(0, offset);
    offset += 1;
    //GridLineCountX
    buffer.writeFloatBE(180.0, offset);
    offset += 4;
    //GridLineCountY
    buffer.writeFloatBE(180.0, offset);
    offset += 4;
    //GridSegmentsX
    buffer.writeUInt32BE(1, offset);
    offset += 4;
    //GridSegmentsY
    buffer.writeUInt32BE(1, offset);
    offset += 4;

    this.push(buffer);
  }

  _transform(chunk: IGlyph, encoding: string, callback: Function) {
    let bufferSize = 74;
    const tagSize = Buffer.byteLength(chunk.tag) + 2;
    const descSize = Buffer.byteLength(chunk.desc) + 2;
    const urlSize = Buffer.byteLength(chunk.url) + 2;

    bufferSize += tagSize + descSize + urlSize;
    const buffer = Buffer.alloc(bufferSize);

    let bufferOffset = 0;
    buffer.writeUInt32BE(this.offset);
    bufferOffset += 4;
    buffer.writeUInt32BE(chunk.label, bufferOffset);
    bufferOffset += 4;
    buffer.writeUInt32BE(0, bufferOffset);
    bufferOffset += 4;
    buffer.writeUInt32BE(chunk.parent, bufferOffset);
    bufferOffset += 4;

    //Position
    buffer.set(convertNumberTo32bIeee754Float(chunk.positionX), bufferOffset);
    bufferOffset += 4;
    buffer.set(convertNumberTo32bIeee754Float(chunk.positionY), bufferOffset);
    bufferOffset += 4;
    buffer.set(convertNumberTo32bIeee754Float(chunk.positionZ), bufferOffset);
    bufferOffset += 4;

    //Rotate
    buffer.set(convertNumberTo32bIeee754Float(chunk.rotationX), bufferOffset);
    bufferOffset += 4;
    buffer.set(convertNumberTo32bIeee754Float(chunk.rotationY), bufferOffset);
    bufferOffset += 4;
    buffer.set(convertNumberTo32bIeee754Float(chunk.rotationZ), bufferOffset);
    bufferOffset += 4;

    //Scale
    buffer.set(convertNumberTo32bIeee754Float(chunk.scaleX), bufferOffset);
    bufferOffset += 4;
    buffer.set(convertNumberTo32bIeee754Float(chunk.scaleY), bufferOffset);
    bufferOffset += 4;
    buffer.set(convertNumberTo32bIeee754Float(chunk.scaleZ), bufferOffset);
    bufferOffset += 4;

    //Color
    buffer.writeUInt8(chunk.colorR, bufferOffset);
    bufferOffset += 1;
    buffer.writeUInt8(chunk.colorG, bufferOffset);
    bufferOffset += 1;
    buffer.writeUInt8(chunk.colorB, bufferOffset);
    bufferOffset += 1;
    buffer.writeUInt8(chunk.alpha, bufferOffset);
    bufferOffset += 1;

    //Geometry
    buffer.writeUInt8(chunk.geometry, bufferOffset);
    bufferOffset += 1;

    //Topology
    buffer.writeUInt8(chunk.topology, bufferOffset);
    bufferOffset += 1;

    //Ratio
    buffer.set(convertNumberTo32bIeee754Float(chunk.ratio), bufferOffset);
    bufferOffset += 4;

    //Rotatation Rate
    buffer.set(
      convertNumberTo32bIeee754Float(chunk.rotationRateX),
      bufferOffset
    );
    bufferOffset += 4;
    buffer.set(
      convertNumberTo32bIeee754Float(chunk.rotationRateY),
      bufferOffset
    );
    bufferOffset += 4;
    buffer.set(
      convertNumberTo32bIeee754Float(chunk.rotationRateZ),
      bufferOffset
    );
    bufferOffset += 4;

    const tag = convertTextToUtfForBuffer(chunk.tag);
    buffer.set(tag, bufferOffset);
    bufferOffset += tagSize;

    const url = convertTextToUtfForBuffer(chunk.url);
    buffer.set(url, bufferOffset);
    bufferOffset += urlSize;

    const desc = convertTextToUtfForBuffer(chunk.desc);
    buffer.set(desc, bufferOffset);
    bufferOffset += descSize;

    this.push(buffer);
    this.offset++;
    callback();
  }
}
