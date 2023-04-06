import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {SdtParser} from '../../io';
import * as helperFunctions from '../glyphEnginHelpers';
import {GlyphEngine} from '../../glyphEngine';
import {FUNCTION, SHAPE, TYPE} from '../../constants';
import {TextColumnToNumberConverter} from '../../io/textToNumberConverter';
import {MinMaxCalculator} from '../../io/minMaxCalulator';

describe('SdtParser', () => {
  let stringTemplate: string;
  const inputBucketName = 'testInputBucketName';
  const outputBucketName = 'testOutputBucketName';
  const processId = 'testProcessId';
  const databaseName = 'testDatabaseName';
  const viewName = 'testViewName';
  const modelId = 'testModelName';
  const data = new Map<string, string>([
    ['type_x', 'string'],
    ['type_y', 'number'],
    ['type_z', 'number'],
    ['x_axis', 'columnx'],
    ['y_axis', 'columny'],
    ['z_axis', 'columnz'],
    ['x_func', 'LOG'],
    ['y_func', 'LOG'],
    ['z_func', 'LIN'],
    ['x_direction', 'DESC'],
    ['y_direction', 'DESC'],
    ['z_direction', 'ASC'],
    ['model_id', modelId],
  ]);
  const minMaxData = {
    x: {
      min: 'a',
      max: 'z',
      columnName: 'columnx',
    },
    y: {
      min: 0,
      max: 100,
      columnName: 'columny',
    },
    z: {
      min: 0,
      max: 999,
      columnName: 'columnz',
    },
  };

  const textToNumberResults: Map<string, number> = new Map<string, number>([
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

  context('parse', () => {
    const sandbox = createSandbox();

    let glyphEngine: GlyphEngine;
    let stringSdt: string;

    before(async () => {
      stringTemplate = await helperFunctions.getMockTemplate();
      glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName,
        processId
      );
      stringSdt = (glyphEngine as any).updateSdt(stringTemplate, data);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will parse our template and return a SdtParser object', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );

      const sdtParser = (await SdtParser.parseSdtString(
        stringSdt,
        viewName
      )) as any;

      assert.instanceOf(sdtParser, SdtParser);
      assert.equal((sdtParser as any).viewName, viewName);
      assert.isOk((sdtParser as any).sdtAsJson);

      assert.isTrue(textToNumberLoadStub.calledOnce);
      assert.isTrue(minMaxoadStub.calledOnce);

      assert.isNotEmpty(sdtParser.bindings.x);
      assert.isNotEmpty(sdtParser.bindings.y);
      assert.isNotEmpty(sdtParser.bindings.z);

      assert.strictEqual(sdtParser.getShape(), SHAPE.CUBE);

      assert.isOk(sdtParser.inputFieldsField);
      assert.isOk(sdtParser.inputFieldsField.x);
      assert.isOk(sdtParser.inputFieldsField.y);
      assert.isOk(sdtParser.inputFieldsField.z);
    });
  });

  context('getDataSource', () => {
    let glyphEngine: GlyphEngine;
    let stringSdt: string;
    const sandbox = createSandbox();

    before(async () => {
      stringTemplate = await helperFunctions.getMockTemplate();
      glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName,
        processId
      );
      stringSdt = (glyphEngine as any).updateSdt(stringTemplate, data);
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('will return the datasource', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);
      const dataSource = sdtParser.getDataSource();

      assert.strictEqual(dataSource.tableName, viewName);
    });
  });

  context('getGlyphProperty', () => {
    const sandbox = createSandbox();

    let glyphEngine: GlyphEngine;
    let stringSdt: string;
    before(async () => {
      stringTemplate = await helperFunctions.getMockTemplate();
      glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName,
        processId
      );
      stringSdt = (glyphEngine as any).updateSdt(stringTemplate, data);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the Position Properties', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);
      const positionX = sdtParser.getGlyphProperty('Position', 'X');
      assert.strictEqual(positionX?.function, FUNCTION.TEXT_INTERPOLATION);
      assert.strictEqual(positionX?.min, 205);
      assert.strictEqual(positionX?.max, -205);
      assert.isEmpty(positionX?.minRgb);
      assert.isEmpty(positionX?.maxRgb);

      const positionY = sdtParser.getGlyphProperty('Position', 'Y');
      assert.strictEqual(
        positionY?.function,
        FUNCTION.LOGARITHMIC_INTERPOLATION
      );
      assert.strictEqual(positionY?.min, 205);
      assert.strictEqual(positionY?.max, -205);
      assert.isEmpty(positionY?.minRgb);
      assert.isEmpty(positionY?.maxRgb);

      const positionZ = sdtParser.getGlyphProperty('Position', 'Z');
      assert.strictEqual(positionZ?.function, FUNCTION.LINEAR_INTERPOLATION);
      assert.strictEqual(positionZ?.min, 1);
      assert.strictEqual(positionZ?.max, 71);
      assert.isEmpty(positionZ?.minRgb);
      assert.isEmpty(positionZ?.maxRgb);
    });

    it('will return the Scale Properties', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);
      const positionX = sdtParser.getGlyphProperty('Scale', 'X');
      assert.strictEqual(positionX?.function, FUNCTION.LINEAR_INTERPOLATION);
      assert.strictEqual(positionX?.min, 1);
      assert.strictEqual(positionX?.max, 1);
      assert.isEmpty(positionX?.minRgb);
      assert.isEmpty(positionX?.maxRgb);

      const positionY = sdtParser.getGlyphProperty('Scale', 'Y');
      assert.strictEqual(positionY?.function, FUNCTION.LINEAR_INTERPOLATION);
      assert.strictEqual(positionY?.min, 1);
      assert.strictEqual(positionY?.max, 1);
      assert.isEmpty(positionY?.minRgb);
      assert.isEmpty(positionY?.maxRgb);

      const positionZ = sdtParser.getGlyphProperty('Scale', 'Z');
      assert.strictEqual(positionZ?.function, FUNCTION.LINEAR_INTERPOLATION);
      assert.strictEqual(positionZ?.min, 1);
      assert.strictEqual(positionZ?.max, 101);
      assert.isEmpty(positionZ?.minRgb);
      assert.isEmpty(positionZ?.maxRgb);
    });

    it('will return the Transparency Properties', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);
      const transparency = sdtParser.getGlyphProperty('Color', 'Transparency');
      assert.strictEqual(transparency?.function, FUNCTION.LINEAR_INTERPOLATION);
      assert.strictEqual(transparency?.min, 0);
      assert.strictEqual(transparency?.max, 255);
      assert.isEmpty(transparency?.minRgb);
      assert.isEmpty(transparency?.maxRgb);
    });

    it('will return the Rgb Property', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);
      const rgb = sdtParser.getGlyphProperty('Color', 'RGB');
      assert.strictEqual(rgb?.function, FUNCTION.LINEAR_INTERPOLATION);
      assert.strictEqual(rgb?.min, 0);
      assert.strictEqual(rgb?.max, 0);
      assert.strictEqual(rgb?.minRgb.length, 3);
      assert.strictEqual(rgb?.maxRgb.length, 3);
    });

    it('will return null if the property does not exist', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);

      delete (sdtParser as any).sdtAsJson.Transform.Glyphs.Glyph.Color;

      const rgb = sdtParser.getGlyphProperty('Color', 'RGB');
      assert.isNull(rgb);
    });

    it('will return null if the sub property does not exist', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );
      const sdtParser = await SdtParser.parseSdtString(stringSdt, viewName);

      delete (sdtParser as any).sdtAsJson.Transform.Glyphs.Glyph.Color.RGB;

      const rgb = sdtParser.getGlyphProperty('Color', 'RGB');
      assert.isNull(rgb);
    });
  });
  context('getInputFields', () => {
    let glyphEngine: GlyphEngine;
    let stringSdt: string;
    const sandbox = createSandbox();

    before(async () => {
      stringTemplate = await helperFunctions.getMockTemplate();
      glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName,
        processId
      );
      stringSdt = (glyphEngine as any).updateSdt(stringTemplate, data);
    });
    afterEach(() => {
      sandbox.restore();
    });
    it('will return the input fields', async () => {
      const textToNumberLoadStub = sandbox.stub();
      textToNumberLoadStub.resolves();
      sandbox.replace(
        TextColumnToNumberConverter.prototype,
        'load',
        textToNumberLoadStub
      );

      sandbox.replaceGetter(
        TextColumnToNumberConverter.prototype,
        'size',
        () => textToNumberResults.size
      );

      const minMaxoadStub = sandbox.stub();
      minMaxoadStub.resolves();
      sandbox.replace(MinMaxCalculator.prototype, 'load', minMaxoadStub);

      sandbox.replaceGetter(
        MinMaxCalculator.prototype,
        'minMax',
        () => minMaxData
      );

      const sdtParser = (await SdtParser.parseSdtString(
        stringSdt,
        viewName
      )) as any;

      const inputFields = sdtParser.getInputFields();
      assert.strictEqual(inputFields.x.field, data.get('x_axis'));
      assert.strictEqual(inputFields.x.min, 0);
      assert.strictEqual(inputFields.x.max, textToNumberResults.size - 1);
      assert.isOk(inputFields.x.text_to_num);
      assert.strictEqual(
        inputFields.x.text_to_num.size,
        textToNumberResults.size
      );
      assert.strictEqual(inputFields.x.type, TYPE.TEXT);

      assert.strictEqual(inputFields.y.field, data.get('y_axis'));
      assert.strictEqual(inputFields.y.min, minMaxData.y.min);
      assert.strictEqual(inputFields.y.max, minMaxData.y.max);
      assert.isNotOk(inputFields.y.text_to_num);
      assert.strictEqual(inputFields.y.type, TYPE.REAL);

      assert.strictEqual(inputFields.z.field, data.get('z_axis'));
      assert.strictEqual(inputFields.z.min, minMaxData.z.min);
      assert.strictEqual(inputFields.z.max, minMaxData.z.max);
      assert.isNotOk(inputFields.z.text_to_num);
      assert.strictEqual(inputFields.z.type, TYPE.REAL);
    });
  });
});