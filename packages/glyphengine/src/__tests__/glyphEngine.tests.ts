import 'mocha';
import {assert} from 'chai';
import {GlyphEngine} from '../glyphEngine';
import {createSandbox} from 'sinon';
import {aws, error, logging} from '@glyphx/core';
import {fileIngestion} from '@glyphx/types';
import {Readable} from 'node:stream';
import * as helperFunctions from './glyphEnginHelpers';
import {XMLParser} from 'fast-xml-parser';

describe('GlyphEngine', () => {
  context('constructor', () => {
    it('will construct a new GlyphEngineObject', () => {
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );

      assert.isOk(glyphEngine);
      assert.strictEqual(
        (glyphEngine as any).inputBucketNameField,
        inputBucketName
      );
      assert.strictEqual(
        (glyphEngine as any).outputBucketNameField,
        outputBucketName
      );
      assert.strictEqual((glyphEngine as any).databaseNameField, databaseName);

      assert.isNotEmpty((glyphEngine as any).templateKey);
      assert.isOk((glyphEngine as any).inputBucketField);
      assert.isOk((glyphEngine as any).outputBucketField);
      assert.isOk((glyphEngine as any).athenaManager);
      assert.isFalse((glyphEngine as any).initedField);
    });
  });

  context('init', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will initialize a GlyphEngine object', async () => {
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);

      const loggerInitStub = sandbox.stub();
      loggerInitStub.resolves();
      sandbox.replace(logging.Logger, 'init', loggerInitStub);

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );

      await glyphEngine.init();

      assert.isTrue((glyphEngine as any).initedField);
      assert.isTrue(s3BucketInitStub.calledTwice);
      assert.isTrue(athenaInitStub.calledOnce);
      assert.isTrue(loggerInitStub.calledOnce);
      assert.isTrue(publishStub.notCalled);
    });

    it('will publish and throw an UnexpectedError when one of the inits throws an error', async () => {
      const innerError = new Error('testError');

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.rejects(innerError);
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);

      const loggerInitStub = sandbox.stub();
      loggerInitStub.resolves();
      sandbox.replace(logging.Logger, 'init', loggerInitStub);

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      let errored = false;
      try {
        await glyphEngine.init();
      } catch (err) {
        assert.isTrue(err instanceof error.UnexpectedError);
        assert.strictEqual((err as any).innerError, innerError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(publishStub.called);
    });
  });

  context('cleanupData', () => {
    const inputBucketName = 'testInputBucketName';
    const outputBucketName = 'testOutputBucketName';
    const databaseName = 'testDatabaseName';
    const data: Map<string, string> = new Map<string, string>([
      ['x_axis', 'some.random x value'],
      ['y_axis', 'some.random y value'],
      ['z_axis', 'some.random z value'],
    ]);
    it('will cleanup the data', () => {
      const localData = new Map<string, string>(data);
      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      (glyphEngine as any).cleanupData(localData);
      assert.strictEqual(localData.get('x_axis'), 'somerandom_x_value');
      assert.strictEqual(localData.get('y_axis'), 'somerandom_y_value');
      assert.strictEqual(localData.get('z_axis'), 'somerandom_z_value');

      assert.strictEqual(localData.get('x_func'), 'LIN');
      assert.strictEqual(localData.get('y_func'), 'LIN');
      assert.strictEqual(localData.get('z_func'), 'LIN');

      assert.strictEqual(localData.get('x_direction'), 'ASC');
      assert.strictEqual(localData.get('y_direction'), 'ASC');
      assert.strictEqual(localData.get('z_direction'), 'ASC');
    });

    it('will not set func and direction if they are already set', () => {
      const localData = new Map<string, string>(data);
      localData.set('x_func', 'LOG');
      localData.set('y_func', 'LOG');
      localData.set('z_func', 'LOG');
      localData.set('x_direction', 'DESC');
      localData.set('y_direction', 'DESC');
      localData.set('z_direction', 'DESC');

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      (glyphEngine as any).cleanupData(localData);
      assert.strictEqual(localData.get('x_axis'), 'somerandom_x_value');
      assert.strictEqual(localData.get('y_axis'), 'somerandom_y_value');
      assert.strictEqual(localData.get('z_axis'), 'somerandom_z_value');

      assert.strictEqual(localData.get('x_func'), 'LOG');
      assert.strictEqual(localData.get('y_func'), 'LOG');
      assert.strictEqual(localData.get('z_func'), 'LOG');

      assert.strictEqual(localData.get('x_direction'), 'DESC');
      assert.strictEqual(localData.get('y_direction'), 'DESC');
      assert.strictEqual(localData.get('z_direction'), 'DESC');
    });
  });

  context('getDataTypes', () => {
    const sandbox = createSandbox();

    const inputBucketName = 'testInputBucketName';
    const outputBucketName = 'testOutputBucketName';
    const databaseName = 'testDatabaseName';
    const clientName = 'testClientName';
    const modelName = 'testModelName';

    const data: Map<string, string> = new Map<string, string>([
      ['x_axis', 'columnx'],
      ['y_axis', 'columny'],
      ['z_axis', 'columnz'],
    ]);
    afterEach(() => {
      sandbox.restore();
    });
    it('will get the data types', async () => {
      const localData = new Map<string, string>(data);
      const dataDef = [
        {
          columnName: 'columnx',
          columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        },
        {
          columnName: 'columny',
          columnType: fileIngestion.constants.FIELD_TYPE.NUMBER,
        },
        {
          columnName: 'columnz',
          columnType: fileIngestion.constants.FIELD_TYPE.INTEGER,
        },
      ];

      const getTableDescriptionStub = sandbox.stub();
      getTableDescriptionStub.resolves(dataDef);
      sandbox.replace(
        aws.AthenaManager.prototype,
        'getTableDescription',
        getTableDescriptionStub
      );

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );

      await (glyphEngine as any).getDataTypes('testViewname', localData);
      assert.strictEqual(localData.get('type_x'), 'string');
      assert.strictEqual(localData.get('type_y'), 'number');
      assert.strictEqual(localData.get('type_z'), 'number');
    });

    it('will publish and throw an UnexpectedError when the underlying database calls throw an error', async () => {
      const localData = new Map<string, string>(data);
      const dataDef = [
        {
          columnName: 'columnx',
          columnType: fileIngestion.constants.FIELD_TYPE.STRING,
        },
        {
          columnName: 'columny',
          columnType: fileIngestion.constants.FIELD_TYPE.NUMBER,
        },
        {
          columnName: 'columnz',
          columnType: fileIngestion.constants.FIELD_TYPE.INTEGER,
        },
      ];

      const getTableDescriptionStub = sandbox.stub();
      getTableDescriptionStub.rejects('Something bad has occurred');
      sandbox.replace(
        aws.AthenaManager.prototype,
        'getTableDescription',
        getTableDescriptionStub
      );

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      let errored = false;
      try {
        await (glyphEngine as any).getDataTypes(
          clientName,
          modelName,
          localData
        );
      } catch (e) {
        assert.instanceOf(e, error.UnexpectedError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(publishStub.called);
    });
  });

  context('getTemplateAsString', () => {
    const sandbox = createSandbox();
    const fileData =
      'now is the time for all good men to come to the aid of their country';
    const inputBucketName = 'testInputBucketName';
    const outputBucketName = 'testOutputBucketName';
    const databaseName = 'testDatabaseName';

    afterEach(() => {
      sandbox.restore();
    });

    it("will get a file and return it's contents as a string", async () => {
      const fileStream = Readable.from(Buffer.from(fileData));

      const getObjectStub = sandbox.stub();
      getObjectStub.resolves(fileStream);
      sandbox.replace(
        aws.S3Manager.prototype,
        'getObjectStream',
        getObjectStub
      );

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );

      const result = await (glyphEngine as any).getTemplateAsString();
      assert.strictEqual(result, fileData);
    });

    it('will publish and throw an UnexpectedError when the underlying s3 call throws an error', async () => {
      const getObjectStub = sandbox.stub();
      getObjectStub.rejects('Something bad has occurred');
      sandbox.replace(
        aws.S3Manager.prototype,
        'getObjectStream',
        getObjectStub
      );

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      let errored = false;
      try {
        await (glyphEngine as any).getTemplateAsString();
      } catch (e) {
        assert.instanceOf(e, error.UnexpectedError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(publishStub.called);
    });
  });

  context('updateSdt', () => {
    let stringTemplate: string;
    const inputBucketName = 'testInputBucketName';
    const outputBucketName = 'testOutputBucketName';
    const databaseName = 'testDatabaseName';
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
    const options = {
      ignoreAttributes: false,
    };

    const parser = new XMLParser(options);
    before(async () => {
      stringTemplate = await helperFunctions.getMockTemplate();
    });

    it('will update the template with the correct values', () => {
      const localString = stringTemplate;
      const localData = new Map<string, string>([
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
      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      const result = (glyphEngine as any).updateSdt(localString, localData);

      const jsonObj = parser.parse(result);
      assert.strictEqual(jsonObj.Transform['@_id'], modelId);
      assert.strictEqual(
        jsonObj.Transform.Datasources.Datasource.Host,
        '_data.csv'
      );
      assert.strictEqual(
        jsonObj.Transform.Datasources.Datasource.Name,
        '_data.csv'
      );
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.X.Function['@_type'],
        'Text Interpolation'
      );

      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.Y.Function['@_type'],
        'Logarithmic Interpolation'
      );

      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.Z.Function['@_type'],
        'Linear Interpolation'
      );
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Min, 205);
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.X.Difference,
        -410
      );

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Min, 205);
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.X.Difference,
        -410
      );

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Min, 1);
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.Z.Difference,
        70
      );
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Color.RGB.Min,
        '0,255,255'
      );

      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Color.RGB.Difference,
        '255,-255,-255'
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[0]['@_field'],
        localData.get('x_axis')
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[1]['@_field'],
        localData.get('y_axis')
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[2]['@_field'],
        localData.get('z_axis')
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[0]['@_type'],
        'Text'
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[1]['@_type'],
        'Real'
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[2]['@_type'],
        'Real'
      );
    });

    it('will update the template with the correct values inverted from above', () => {
      const localString = stringTemplate;
      const localData = new Map<string, string>([
        ['type_x', 'number'],
        ['type_y', 'string'],
        ['type_z', 'string'],
        ['x_axis', 'columnx'],
        ['y_axis', 'columny'],
        ['z_axis', 'columnz'],
        ['x_func', 'LOG'],
        ['y_func', 'LIN'],
        ['z_func', 'LOG'],
        ['x_direction', 'ASC'],
        ['y_direction', 'ASC'],
        ['z_direction', 'DESC'],
        ['model_id', modelId],
      ]);
      const glyphEngine = new GlyphEngine(
        inputBucketName,
        outputBucketName,
        databaseName
      );
      const result = (glyphEngine as any).updateSdt(localString, localData);

      const jsonObj = parser.parse(result);
      assert.strictEqual(jsonObj.Transform['@_id'], modelId);
      assert.strictEqual(
        jsonObj.Transform.Datasources.Datasource.Host,
        '_data.csv'
      );
      assert.strictEqual(
        jsonObj.Transform.Datasources.Datasource.Name,
        '_data.csv'
      );
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.X.Function['@_type'],
        'Logarithmic Interpolation'
      );

      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.Y.Function['@_type'],
        'Text Interpolation'
      );

      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.Z.Function['@_type'],
        'Text Interpolation'
      );
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Min, -205);
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.X.Difference,
        410
      );

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Min, -205);
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.X.Difference,
        410
      );

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Min, 70);
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Position.Z.Difference,
        -70
      );
      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Color.RGB.Min,
        '255,0,0'
      );

      assert.strictEqual(
        jsonObj.Transform.Glyphs.Glyph.Color.RGB.Difference,
        '-255,255,255'
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[0]['@_field'],
        localData.get('x_axis')
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[1]['@_field'],
        localData.get('y_axis')
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[2]['@_field'],
        localData.get('z_axis')
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[0]['@_type'],
        'Real'
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[1]['@_type'],
        'Text'
      );
      assert.strictEqual(
        jsonObj.Transform.InputFields.InputField[2]['@_type'],
        'Text'
      );
    });
  });
});
