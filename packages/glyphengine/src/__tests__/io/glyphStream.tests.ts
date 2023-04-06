import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {GlyphStream} from '../../io/glyphStream';
import {SdtParser} from '../../io';
import * as helperFunctions from '../glyphEnginHelpers';
import {GlyphEngine} from '../../glyphEngine';
import {TextColumnToNumberConverter} from '../../io/textToNumberConverter';
import {MinMaxCalculator} from '../../io/minMaxCalulator';
import {Readable, Writable} from 'stream';
import {pipeline} from 'stream/promises';
import {IGlyph} from '../../interfaces/iGlyph';

describe('#io/GlyphStream', () => {
  const mockInputData = new Map<string, string>([
    ['type_x', 'string'],
    ['type_y', 'number'],
    ['type_z', 'number'],
    ['x_axis', 'columnx'],
    ['y_axis', 'columny'],
    ['z_axis', 'columnz'],
    ['x_func', 'LIN'],
    ['y_func', 'LOG'],
    ['z_func', 'LIN'],
    ['x_direction', 'ASC'],
    ['y_direction', 'ASC'],
    ['z_direction', 'ASC'],
    ['model_id', ' modelId'],
  ]);

  const mockData = [
    {rowids: '1', columnx: 'a', columny: 1, columnz: 1},
    {rowids: '2', columnx: 'b', columny: 2, columnz: 2},
    {rowids: '3', columnx: 'c', columny: 3, columnz: 3},
    {rowids: '4', columnx: 'd', columny: 4, columnz: 4},
    {rowids: '5', columnx: 'e', columny: 5, columnz: 5},
    {rowids: '6', columnx: 'f', columny: 6, columnz: 6},
    {rowids: '7', columnx: 'g', columny: 7, columnz: 7},
    {rowids: '8', columnx: 'h', columny: 8, columnz: 8},
    {rowids: '9', columnx: 'i', columny: 9, columnz: 9},
    {rowids: '10', columnx: 'j', columny: 10, columnz: 10},
    {rowids: '11', columnx: 'k', columny: 11, columnz: 11},
    {rowids: '12', columnx: 'l', columny: 12, columnz: 12},
    {rowids: '13', columnx: 'm', columny: 13, columnz: 13},
    {rowids: '14', columnx: 'n', columny: 14, columnz: 14},
    {rowids: '15', columnx: 'o', columny: 15, columnz: 15},
    {rowids: '16', columnx: 'p', columny: 16, columnz: 16},
    {rowids: '17', columnx: 'q', columny: 17, columnz: 17},
    {rowids: '18', columnx: 'r', columny: 18, columnz: 18},
    {rowids: '19|28', columnx: 's', columny: 19, columnz: 19},
    {rowids: '20', columnx: 't', columny: 20, columnz: 20},
    {rowids: '21', columnx: 'u', columny: 21, columnz: 21},
    {rowids: '22', columnx: 'v', columny: 22, columnz: 22},
    {rowids: '23', columnx: 'w', columny: 23, columnz: 23},
    {rowids: '24|27', columnx: 'x', columny: 24, columnz: 24},
    {rowids: '25|26', columnx: 'y', columny: 25, columnz: 25},
  ];

  const mockMinMaxData = {
    x: {
      min: 'a',
      max: 'z',
      columnName: 'columnx',
    },
    y: {
      min: 1,
      max: 25,
      columnName: 'columny',
    },
    z: {
      min: 1,
      max: 25,
      columnName: 'columnz',
    },
  };

  const mockTextToNumberResults: Map<string, number> = new Map<string, number>([
    ['a', 0],
    ['b', 1],
    ['c', 2],
    ['d', 3],
    ['e', 4],
    ['f', 5],
    ['g', 6],
    ['h', 7],
    ['i', 8],
    ['j', 9],
    ['k', 10],
    ['l', 11],
    ['m', 12],
    ['n', 13],
    ['o', 14],
    ['p', 15],
    ['q', 16],
    ['r', 17],
    ['s', 18],
    ['t', 19],
    ['u', 20],
    ['v', 21],
    ['w', 22],
    ['x', 23],
    ['y', 24],
    ['z', 25],
  ]);

  const sandbox = createSandbox();
  let sdtParser: SdtParser;

  before(async () => {
    const stringTemplate = await helperFunctions.getMockTemplate();
    const glyphEngine = new GlyphEngine(
      'testBucketName',
      'outputBucketName',
      'databaseName',
      'testProcessId'
    );
    const stringSdt = (glyphEngine as any).updateSdt(
      stringTemplate,
      mockInputData
    );

    const textToNumberLoadStub = sandbox.stub();
    textToNumberLoadStub.resolves();
    sandbox.replace(
      TextColumnToNumberConverter.prototype,
      'load',
      textToNumberLoadStub
    );

    const textToNumberConvertStub = sandbox.stub();
    textToNumberConvertStub.callsFake((data: string) => {
      return mockTextToNumberResults.get(data);
    });

    sandbox.replace(
      TextColumnToNumberConverter.prototype,
      'convert',
      textToNumberConvertStub
    );

    sandbox.replaceGetter(
      TextColumnToNumberConverter.prototype,
      'size',
      () => mockTextToNumberResults.size
    );

    const minMaxoadStub = sandbox.stub();
    minMaxoadStub.resolves();
    sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

    sandbox.replaceGetter(
      MinMaxCalculator.prototype,
      'minMax',
      () => mockMinMaxData
    );

    sdtParser = (await SdtParser.parseSdtString(stringSdt, 'viewName')) as any;
  });

  after(() => {
    sandbox.restore();
  });

  context('constructor', () => {
    it('Will build our GlyhStream transform stream', () => {
      const glyphStream = new GlyphStream(sdtParser) as any;
      assert.isOk(glyphStream.sdtParser);
    });
  });

  context('transform', () => {
    it('will run our pipeline and build glyphs', async () => {
      const rStream = new Readable({
        objectMode: true,
        read: () => {
          mockData.forEach(data => rStream.push(data));
          rStream.push(null);
        },
      });

      let lastPosx = -206;
      let lastPosy = -206;
      let lastPosz = 0;
      let lastScalez = -1;
      let rowId = 0;
      let lastColor = '';
      let written = false;
      //for this test the data is ordered so we can check our interpolation math
      const wStream = new Writable({
        objectMode: true,
        write: (chunk: IGlyph, encoding, callback) => {
          written = true;
          assert.isAbove(chunk.positionX, lastPosx);
          lastPosx = chunk.positionX;
          assert.isAbove(chunk.positionY, lastPosy);
          lastPosy = chunk.positionY;
          assert.isAbove(chunk.positionZ, lastPosz);
          lastPosz = chunk.positionZ;
          assert.isAbove(chunk.scaleZ, lastScalez);
          lastScalez = chunk.scaleZ;
          const color = `${chunk.colorR}, ${chunk.colorG}, ${chunk.colorB}`;
          assert.notStrictEqual(color, lastColor);
          lastColor = color;

          const expectedRowId = mockData[rowId].rowids.split('|');
          const expectedX = mockData[rowId].columnx;
          const expectedY = mockData[rowId].columny;
          const expectedZ = mockData[rowId].columnz;

          const desc = JSON.parse(chunk.desc);

          desc.rowId.forEach((r: number, index: number) => {
            assert.strictEqual(r, parseInt(expectedRowId[index]));
          });
          assert.strictEqual(desc.x.columnx, expectedX.toString());
          assert.strictEqual(desc.y.columny, expectedY.toString());
          assert.strictEqual(desc.z.columnz, expectedZ.toString());

          assert.strictEqual(chunk.tag, `columnz: ${expectedZ}`);

          rowId++;
          callback();
        },
      });

      const glyphStream = new GlyphStream(sdtParser);

      await pipeline(rStream, glyphStream, wStream);
      assert.isTrue(written);
    });
  });
});