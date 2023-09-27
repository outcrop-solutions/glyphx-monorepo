import 'mocha';
import {assert} from 'chai';
import {GlyphEngine} from '../glyphEngine';
import {createSandbox} from 'sinon';
import {aws, error, logging, streams} from 'core';
import {fileIngestionTypes} from 'types';
import {Readable} from 'node:stream';
import * as helperFunctions from './glyphEnginHelpers';
import {XMLParser} from 'fast-xml-parser';
import {QueryRunner} from '../io/queryRunner';
import {IQueryResponse} from '../interfaces';
import {QUERY_STATUS} from '../constants';
import {SdtParser} from '../io/sdtParser';
import {Heartbeat, processTrackingService, projectService} from 'business';

describe('GlyphEngine', () => {
  const mockProject = {
    files: [
      {
        fileName: 'danny_mods.csv',
        tableName: 'danny_mods',
        numberOfRows: 10,
        numberOfColumns: 17,
        columns: [
          {
            name: 'columnx',
            fieldType: 1,
          },
          {
            name: 'columny',
            fieldType: 3,
          },
          {
            name: 'columnz',
            fieldType: 0,
          },
        ],
      },
    ],
  };
  context('constructor', () => {
    it('will construct a new GlyphEngineObject', () => {
      const inputBucketName = 'testInputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);

      assert.isOk(glyphEngine);
      assert.strictEqual((glyphEngine as any).processId, processId);

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
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);

      await glyphEngine.init();

      assert.isTrue((glyphEngine as any).initedField);
      assert.isTrue(loggerInitStub.calledOnce);
      assert.isTrue(publishStub.notCalled);
    });

    it('will only initialize a GlyphEngine object once', async () => {
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
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);

      await glyphEngine.init();
      await glyphEngine.init();

      assert.isTrue((glyphEngine as any).initedField);
      assert.isTrue(loggerInitStub.calledOnce);
      assert.isTrue(publishStub.notCalled);
    });
    it('will publish and throw an UnexpectedError when one of the inits throws an error', async () => {
      const innerError = new Error('testError');

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);

      const loggerInitStub = sandbox.stub();
      loggerInitStub.rejects(innerError);
      sandbox.replace(logging.Logger, 'init', loggerInitStub);

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const inputBucketName = 'testInputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
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
    const databaseName = 'testDatabaseName';
    const processId = 'testProcessId';
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    const data: Map<string, string> = new Map<string, string>([
      ['x_axis', 'some.random x value'],
      ['y_axis', 'some.random y value'],
      ['z_axis', 'some.random z value'],
    ]);
    it('will cleanup the data', async () => {
      const localData = new Map<string, string>(data);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
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

    it('will set the values of x_axis, y_axis and z_axis to empty streing if they are not present in the data', async () => {
      const localData = new Map<string, string>();
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
      (glyphEngine as any).cleanupData(localData);

      assert.strictEqual(localData.get('x_axis'), '');
      assert.strictEqual(localData.get('y_axis'), '');
      assert.strictEqual(localData.get('z_axis'), '');

      assert.strictEqual(localData.get('x_func'), 'LIN');
      assert.strictEqual(localData.get('y_func'), 'LIN');
      assert.strictEqual(localData.get('z_func'), 'LIN');

      assert.strictEqual(localData.get('x_direction'), 'ASC');
      assert.strictEqual(localData.get('y_direction'), 'ASC');
      assert.strictEqual(localData.get('z_direction'), 'ASC');
    });
    it('will not set func and direction if they are already set', async () => {
      const localData = new Map<string, string>(data);
      localData.set('x_func', 'LOG');
      localData.set('y_func', 'LOG');
      localData.set('z_func', 'LOG');
      localData.set('x_direction', 'DESC');
      localData.set('y_direction', 'DESC');
      localData.set('z_direction', 'DESC');

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
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
    const databaseName = 'testDatabaseName';
    const processId = 'testProcessId';
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
          columnType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          columnName: 'columny',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          columnName: 'columnz',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
      ];

      const getTableDescriptionStub = sandbox.stub();
      getTableDescriptionStub.resolves(dataDef);
      sandbox.replace(aws.AthenaManager.prototype, 'getTableDescription', getTableDescriptionStub);

      const projectStub = sandbox.stub();
      projectStub.resolves(mockProject);
      sandbox.replace(projectService, 'getProject', projectStub);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);

      await (glyphEngine as any).getDataTypes('testViewname', localData);
      assert.strictEqual(localData.get('type_x'), 'string');
      assert.strictEqual(localData.get('type_y'), 'date');
      assert.strictEqual(localData.get('type_z'), 'number');
    });

    it('if the DataDef does not exist, the column type will default to the project', async () => {
      const localData = new Map<string, string>(data);
      const dataDef = [
        {
          columnName: 'columnxx',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          columnName: 'columnyy',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          columnName: 'columnzz',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.INTEGER,
        },
      ];

      const getTableDescriptionStub = sandbox.stub();
      getTableDescriptionStub.resolves(dataDef);
      sandbox.replace(aws.AthenaManager.prototype, 'getTableDescription', getTableDescriptionStub);

      const projectStub = sandbox.stub();
      projectStub.resolves(mockProject);
      sandbox.replace(projectService, 'getProject', projectStub);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);

      await (glyphEngine as any).getDataTypes('testViewname', localData);
      assert.strictEqual(localData.get('type_x'), 'string');
      //This is looked up on the project so there is an
      //alternate way to map it
      assert.strictEqual(localData.get('type_y'), 'date');
      assert.strictEqual(localData.get('type_z'), 'number');
    });

    it('will publish and throw an UnexpectedError when the underlying database calls throw an error', async () => {
      const localData = new Map<string, string>(data);

      const getTableDescriptionStub = sandbox.stub();
      getTableDescriptionStub.rejects('Something bad has occurred');
      sandbox.replace(aws.AthenaManager.prototype, 'getTableDescription', getTableDescriptionStub);

      const projectStub = sandbox.stub();
      projectStub.resolves(mockProject);
      sandbox.replace(projectService, 'getProject', projectStub);

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
      let errored = false;
      try {
        await (glyphEngine as any).getDataTypes(clientName, modelName, localData);
      } catch (e) {
        assert.instanceOf(e, error.UnexpectedError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(publishStub.called);
    });
    it('will throw an unexpected error when the project does not exist', async () => {
      const localData = new Map<string, string>(data);
      const dataDef = [
        {
          columnName: 'columnx',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
        },
        {
          columnName: 'columny',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
        {
          columnName: 'columnz',
          columnType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
        },
      ];

      const getTableDescriptionStub = sandbox.stub();
      getTableDescriptionStub.resolves(dataDef);
      sandbox.replace(aws.AthenaManager.prototype, 'getTableDescription', getTableDescriptionStub);

      const projectStub = sandbox.stub();
      projectStub.resolves(undefined);
      sandbox.replace(projectService, 'getProject', projectStub);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
      let errored = false;
      try {
        await (glyphEngine as any).getDataTypes('testViewname', localData);
      } catch (err) {
        assert.instanceOf(err, error.UnexpectedError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getTemplateAsString', () => {
    const sandbox = createSandbox();
    const fileData = 'now is the time for all good men to come to the aid of their country';
    const inputBucketName = 'testInputBucketName';
    const databaseName = 'testDatabaseName';
    const processId = 'testProcessId';

    afterEach(() => {
      sandbox.restore();
    });

    it("will get a file and return it's contents as a string", async () => {
      const fileStream = Readable.from(Buffer.from(fileData));

      const getObjectStub = sandbox.stub();
      getObjectStub.resolves(fileStream);
      sandbox.replace(aws.S3Manager.prototype, 'getObjectStream', getObjectStub);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);

      const result = await (glyphEngine as any).getTemplateAsString();
      assert.strictEqual(result, fileData);
    });

    it('will publish and throw an UnexpectedError when the underlying s3 call throws an error', async () => {
      const getObjectStub = sandbox.stub();
      getObjectStub.rejects('Something bad has occurred');
      sandbox.replace(aws.S3Manager.prototype, 'getObjectStream', getObjectStub);

      const publishStub = sandbox.stub();
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishStub);

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
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
    const processId = 'testProcessId';
    const modelId = 'testModelName';
    const options = {
      ignoreAttributes: false,
    };

    const parser = new XMLParser(options);
    const sandbox = createSandbox();
    before(async () => {
      stringTemplate = await helperFunctions.getMockTemplate();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('will update the template with the correct values', async () => {
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
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
      const result = (glyphEngine as any).updateSdt(localString, localData);

      const jsonObj = parser.parse(result);
      assert.strictEqual(jsonObj.Transform['@_id'], modelId);
      assert.strictEqual(jsonObj.Transform.Datasources.Datasource.Host, '_data.csv');
      assert.strictEqual(jsonObj.Transform.Datasources.Datasource.Name, '_data.csv');
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Function['@_type'], 'Text Interpolation');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Function['@_type'], 'Logarithmic Interpolation');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Function['@_type'], 'Linear Interpolation');
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Min, 205);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Difference, -410);

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Min, 205);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Difference, -410);

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Min, 1);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Difference, 70);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Color.RGB.Min, '0,255,255');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Color.RGB.Difference, '255,-255,-255');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[0]['@_field'], localData.get('x_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[1]['@_field'], localData.get('y_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[2]['@_field'], localData.get('z_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[0]['@_type'], 'Text');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[1]['@_type'], 'Real');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[2]['@_type'], 'Real');
    });

    it('will update the template with the correct values inverted from above', async () => {
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
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
      const result = (glyphEngine as any).updateSdt(localString, localData);

      const jsonObj = parser.parse(result);
      assert.strictEqual(jsonObj.Transform['@_id'], modelId);
      assert.strictEqual(jsonObj.Transform.Datasources.Datasource.Host, '_data.csv');
      assert.strictEqual(jsonObj.Transform.Datasources.Datasource.Name, '_data.csv');
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Function['@_type'], 'Logarithmic Interpolation');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Function['@_type'], 'Text Interpolation');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Function['@_type'], 'Text Interpolation');
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Min, -205);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Difference, 410);

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Min, -205);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Difference, 410);

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Min, 70);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Difference, -70);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Color.RGB.Min, '255,0,0');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Color.RGB.Difference, '-255,255,255');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[0]['@_field'], localData.get('x_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[1]['@_field'], localData.get('y_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[2]['@_field'], localData.get('z_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[0]['@_type'], 'Real');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[1]['@_type'], 'Text');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[2]['@_type'], 'Text');
    });
    it('will update the template with the correct values if our directions are omitted', async () => {
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
        ['model_id', modelId],
      ]);
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId);
      const result = (glyphEngine as any).updateSdt(localString, localData);

      const jsonObj = parser.parse(result);
      assert.strictEqual(jsonObj.Transform['@_id'], modelId);
      assert.strictEqual(jsonObj.Transform.Datasources.Datasource.Host, '_data.csv');
      assert.strictEqual(jsonObj.Transform.Datasources.Datasource.Name, '_data.csv');
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Function['@_type'], 'Text Interpolation');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Function['@_type'], 'Logarithmic Interpolation');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Function['@_type'], 'Linear Interpolation');
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Min, -205);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Difference, 410);

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Y.Min, -205);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.X.Difference, 410);

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Min, 1);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Position.Z.Difference, 70);
      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Color.RGB.Min, '0,255,255');

      assert.strictEqual(jsonObj.Transform.Glyphs.Glyph.Color.RGB.Difference, '255,-255,-255');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[0]['@_field'], localData.get('x_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[1]['@_field'], localData.get('y_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[2]['@_field'], localData.get('z_axis'));
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[0]['@_type'], 'Text');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[1]['@_type'], 'Real');
      assert.strictEqual(jsonObj.Transform.InputFields.InputField[2]['@_type'], 'Real');
    });
  });

  context('startQuery', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will start a query', async () => {
      const queryId = 'testQueryId';
      const data = new Map<string, string>([
        ['x_axis', 'columnx'],
        ['y_axis', 'columny'],
        ['z_axis', 'columnz'],
      ]);

      const viewName = 'testViewName';

      const initStub = sandbox.stub();
      initStub.resolves();
      sandbox.replace(QueryRunner.prototype, 'init', initStub);

      const startQueryStub = sandbox.stub();
      startQueryStub.resolves(queryId);
      sandbox.replace(QueryRunner.prototype, 'startQuery', startQueryStub);

      const inputBucketName = 'testInputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      await glyphEngine.startQuery(data, viewName);
      assert.strictEqual(glyphEngine.queryId, queryId);
      assert.isTrue(initStub.calledOnce);
      assert.isTrue(startQueryStub.calledOnce);
    });

    it('will pass through an error thrown by the Athena Manager', async () => {
      const queryId = 'testQueryId';
      const data = new Map<string, string>([
        ['x_axis', 'columnx'],
        ['y_axis', 'columny'],
        ['z_axis', 'columnz'],
      ]);

      const viewName = 'testViewName';

      const initStub = sandbox.stub();
      initStub.resolves();
      sandbox.replace(QueryRunner.prototype, 'init', initStub);

      const startQueryStub = sandbox.stub();
      startQueryStub.rejects(queryId);
      sandbox.replace(QueryRunner.prototype, 'startQuery', startQueryStub);

      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;
      let errored = false;
      try {
        await glyphEngine.startQuery(data, viewName);
      } catch (err: any) {
        assert.strictEqual(err.name, queryId);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('getQueryResponse', () => {
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });

    it('will return the query response', async () => {
      const queryId = 'testQueryId';
      const queryResponse: IQueryResponse = {
        status: QUERY_STATUS.RUNNING,
      };
      const getQueryStatusStub = sandbox.stub();
      getQueryStatusStub.resolves(queryResponse);
      getQueryStatusStub.onCall(1).resolves({status: QUERY_STATUS.SUCCEEDED});
      sandbox.replace(QueryRunner.prototype, 'getQueryStatus', getQueryStatusStub);
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      const viewName = 'testViewName';
      const xcolumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';

      const queryRunner = new QueryRunner(databaseName, viewName, xcolumn, yColumn, zColumn) as any;

      queryRunner.queryId = queryId;
      glyphEngine.queryRunner = queryRunner;

      const response = await glyphEngine.getQueryResponse();
      assert.strictEqual(response.status, QUERY_STATUS.SUCCEEDED);
      assert.isTrue(getQueryStatusStub.calledTwice);
    });
    it('will return the query response when the first query response is unknown', async () => {
      const queryId = 'testQueryId';
      const queryResponse: IQueryResponse = {
        status: QUERY_STATUS.UNKNOWN,
      };
      const getQueryStatusStub = sandbox.stub();
      getQueryStatusStub.resolves(queryResponse);
      getQueryStatusStub.onCall(1).resolves({status: QUERY_STATUS.SUCCEEDED});
      sandbox.replace(QueryRunner.prototype, 'getQueryStatus', getQueryStatusStub);
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      const viewName = 'testViewName';
      const xcolumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';

      const queryRunner = new QueryRunner(databaseName, viewName, xcolumn, yColumn, zColumn) as any;

      queryRunner.queryId = queryId;
      glyphEngine.queryRunner = queryRunner;

      const response = await glyphEngine.getQueryResponse();
      assert.strictEqual(response.status, QUERY_STATUS.SUCCEEDED);
      assert.isTrue(getQueryStatusStub.calledTwice);
    });

    it('Will pass through an error if it is thrown by the underlying query runner', async () => {
      const queryId = 'testQueryId';
      const queryResponse: IQueryResponse = {
        status: QUERY_STATUS.UNKNOWN,
      };
      const getQueryStatusStub = sandbox.stub();
      getQueryStatusStub.rejects(queryResponse);
      sandbox.replace(QueryRunner.prototype, 'getQueryStatus', getQueryStatusStub);
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      const viewName = 'testViewName';
      const xcolumn = 'testXColumn';
      const yColumn = 'testYColumn';
      const zColumn = 'testZColumn';

      const queryRunner = new QueryRunner(databaseName, viewName, xcolumn, yColumn, zColumn) as any;

      queryRunner.queryId = queryId;
      glyphEngine.queryRunner = queryRunner;
      let errored = false;
      try {
        await glyphEngine.getQueryResponse();
      } catch (err: any) {
        assert.strictEqual(err.status, queryResponse.status);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getQueryStatusStub.calledOnce);
    });
  });
  context('processData', () => {
    class FakeUpload {
      async done() {
        console.log('done');
      }
    }
    const sandbox = createSandbox();

    afterEach(() => {
      sandbox.restore();
    });
    it('will process our data and upload the files to s3', async () => {
      const getUploadStreamStub = sandbox.stub();
      getUploadStreamStub.returns(new FakeUpload());
      sandbox.replace(aws.S3Manager.prototype, 'getUploadStream', getUploadStreamStub);
      const startPipelineStub = sandbox.stub();
      startPipelineStub.resolves();
      sandbox.replace(streams.ForkingStream.prototype, 'startPipeline', startPipelineStub);

      const prefix = 'filePrefix';
      const sdtParser = {} as unknown as SdtParser;

      const inputBucketName = 'testInputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';

      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      const projectStub = sandbox.stub();
      projectStub.resolves(mockProject);
      sandbox.replace(projectService, 'getProject', projectStub);

      await glyphEngine.processData(prefix, sdtParser);
      assert.isTrue(getUploadStreamStub.calledTwice);
      assert.isTrue(startPipelineStub.calledOnce);
    });

    it('will pass through any errors', async () => {
      const testError = new Error('testError');
      sandbox.replace(FakeUpload.prototype, 'done', sandbox.stub().rejects(testError));
      const getUploadStreamStub = sandbox.stub();
      getUploadStreamStub.returns(new FakeUpload());
      sandbox.replace(aws.S3Manager.prototype, 'getUploadStream', getUploadStreamStub);
      const startPipelineStub = sandbox.stub();
      startPipelineStub.resolves();
      sandbox.replace(streams.ForkingStream.prototype, 'startPipeline', startPipelineStub);
      const projectStub = sandbox.stub();
      projectStub.resolves(mockProject);
      sandbox.replace(projectService, 'getProject', projectStub);

      const prefix = 'filePrefix';
      const sdtParser = {} as unknown as SdtParser;

      const inputBucketName = 'testInputBucketName';
      const databaseName = 'testDatabaseName';
      const processId = 'testProcessId';
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;
      let errored = false;
      try {
        await glyphEngine.processData(prefix, sdtParser);
      } catch (err) {
        assert.strictEqual(err, testError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(getUploadStreamStub.calledTwice);
      assert.isTrue(startPipelineStub.calledOnce);
    });
  });

  context('process', () => {
    const sandbox = createSandbox();
    const data: Map<string, string> = new Map([
      ['model_id', 'testModelId'],
      ['client_id', 'testClientId'],
      ['x_axis', 'testXAxis'],
      ['y_axis', 'testYAxis'],
      ['z_axis', 'testZAxis'],
    ]);
    afterEach(() => {
      sandbox.restore();
    });
    it('will process our data', async () => {
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';

      const cleanupDataStub = sandbox.stub();
      cleanupDataStub.returns(null as unknown as void);
      sandbox.replace((GlyphEngine as any).prototype, 'cleanupData', cleanupDataStub);

      const startQueryStub = sandbox.stub();
      startQueryStub.resolves();
      sandbox.replace((GlyphEngine as any).prototype, 'startQuery', startQueryStub);

      const getDataTypesStub = sandbox.stub();
      getDataTypesStub.resolves();
      sandbox.replace((GlyphEngine as any).prototype, 'getDataTypes', getDataTypesStub);

      const getTemplateAsStringStub = sandbox.stub();
      getTemplateAsStringStub.resolves('I am the raw template');
      sandbox.replace((GlyphEngine as any).prototype, 'getTemplateAsString', getTemplateAsStringStub);

      const updateSdtStub = sandbox.stub();
      updateSdtStub.resolves('I am the updated template');
      sandbox.replace((GlyphEngine as any).prototype, 'updateSdt', updateSdtStub);

      const putObjectStub = sandbox.stub();
      putObjectStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'putObject', putObjectStub);

      const parseSdtStringStub = sandbox.stub();
      parseSdtStringStub.resolves({} as unknown as SdtParser);
      sandbox.replace(SdtParser, 'parseSdtString', parseSdtStringStub);

      const getQueryResponseStub = sandbox.stub();
      getQueryResponseStub.resolves({status: QUERY_STATUS.SUCCEEDED});
      sandbox.replace((GlyphEngine as any).prototype, 'getQueryResponse', getQueryResponseStub);

      const processDataStub = sandbox.stub();
      processDataStub.resolves({
        sgnFileName: 'testSgnFileName',
        sgcFileName: 'testSgcFileName',
      });
      sandbox.replace((GlyphEngine as any).prototype, 'processData', processDataStub);

      const heartBeatStub = sandbox.stub();
      heartBeatStub.returns(null as unknown as void);
      sandbox.replace(Heartbeat.prototype, 'start', heartBeatStub);

      const processTrackingUpdateStub = sandbox.stub();
      processTrackingUpdateStub.resolves();
      sandbox.replace(processTrackingService, 'updateProcessStatus', processTrackingUpdateStub);

      const processTrackingCompleteStub = sandbox.stub();
      processTrackingCompleteStub.resolves();
      sandbox.replace(processTrackingService, 'completeProcess', processTrackingCompleteStub);

      const processTrackingMessageStub = sandbox.stub();
      processTrackingMessageStub.resolves();
      sandbox.replace(processTrackingService, 'addProcessMessage', processTrackingMessageStub);

      const processTrackingErrorStub = sandbox.stub();
      processTrackingErrorStub.resolves();
      sandbox.replace(processTrackingService, 'addProcessError', processTrackingErrorStub);

      const hertbeatStopStub = sandbox.stub();
      heartBeatStub.returns(null as unknown as void);
      sandbox.replace(Heartbeat.prototype, 'stop', hertbeatStopStub);
      const processId = 'testProcessId';
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      const result = await glyphEngine.process(data);
      assert.isNotEmpty(result.sgnFileName);
      assert.isNotEmpty(result.sgcFileName);
      assert.isNotEmpty(result.sdtFileName);
      assert.isTrue(cleanupDataStub.calledOnce);
      assert.isTrue(startQueryStub.calledOnce);
      assert.isTrue(getDataTypesStub.calledOnce);
      assert.isTrue(updateSdtStub.calledOnce);
      assert.isTrue(putObjectStub.calledOnce);
      assert.isTrue(parseSdtStringStub.calledOnce);
      assert.isTrue(getQueryResponseStub.calledOnce);
      assert.isTrue(processDataStub.calledOnce);
      assert.isTrue(getTemplateAsStringStub.calledOnce);
      assert.isTrue(heartBeatStub.calledOnce);
      assert.isTrue(processTrackingUpdateStub.calledOnce);
      assert.isTrue(processTrackingCompleteStub.calledOnce);
      assert.isTrue(processTrackingMessageStub.called);
      assert.isFalse(processTrackingErrorStub.called);
      assert.isTrue(hertbeatStopStub.calledOnce);
    });

    it('will throw an unexpected error when our query fails', async () => {
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';

      const cleanupDataStub = sandbox.stub();
      cleanupDataStub.returns(null as unknown as void);
      sandbox.replace((GlyphEngine as any).prototype, 'cleanupData', cleanupDataStub);

      const startQueryStub = sandbox.stub();
      startQueryStub.resolves();
      sandbox.replace((GlyphEngine as any).prototype, 'startQuery', startQueryStub);

      const getDataTypesStub = sandbox.stub();
      getDataTypesStub.resolves();
      sandbox.replace((GlyphEngine as any).prototype, 'getDataTypes', getDataTypesStub);

      const getTemplateAsStringStub = sandbox.stub();
      getTemplateAsStringStub.resolves('I am the raw template');
      sandbox.replace((GlyphEngine as any).prototype, 'getTemplateAsString', getTemplateAsStringStub);

      const updateSdtStub = sandbox.stub();
      updateSdtStub.resolves('I am the updated template');
      sandbox.replace((GlyphEngine as any).prototype, 'updateSdt', updateSdtStub);

      const putObjectStub = sandbox.stub();
      putObjectStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'putObject', putObjectStub);

      const parseSdtStringStub = sandbox.stub();
      parseSdtStringStub.resolves({} as unknown as SdtParser);
      sandbox.replace(SdtParser, 'parseSdtString', parseSdtStringStub);

      const errText = 'oops I did it again';

      const getQueryResponseStub = sandbox.stub();
      getQueryResponseStub.resolves({
        status: QUERY_STATUS.FAILED,
        error: errText,
      });
      sandbox.replace((GlyphEngine as any).prototype, 'getQueryResponse', getQueryResponseStub);

      const processDataStub = sandbox.stub();
      processDataStub.resolves({
        sgnFileName: 'testSgnFileName',
        sgcFileName: 'testSgcFileName',
      });
      sandbox.replace((GlyphEngine as any).prototype, 'processData', processDataStub);

      const heartBeatStub = sandbox.stub();
      heartBeatStub.returns(null as unknown as void);
      sandbox.replace(Heartbeat.prototype, 'start', heartBeatStub);

      const processTrackingUpdateStub = sandbox.stub();
      processTrackingUpdateStub.resolves();
      sandbox.replace(processTrackingService, 'updateProcessStatus', processTrackingUpdateStub);

      const processTrackingCompleteStub = sandbox.stub();
      processTrackingCompleteStub.resolves();
      sandbox.replace(processTrackingService, 'completeProcess', processTrackingCompleteStub);

      const processTrackingMessageStub = sandbox.stub();
      processTrackingMessageStub.resolves();
      sandbox.replace(processTrackingService, 'addProcessMessage', processTrackingMessageStub);

      const processTrackingErrorStub = sandbox.stub();
      processTrackingErrorStub.resolves();
      sandbox.replace(processTrackingService, 'addProcessError', processTrackingErrorStub);

      const hertbeatStopStub = sandbox.stub();
      heartBeatStub.returns(null as unknown as void);
      sandbox.replace(Heartbeat.prototype, 'stop', hertbeatStopStub);

      const processId = 'testProcessId';
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      let errored = false;
      try {
        await glyphEngine.process(data);
      } catch (err: any) {
        assert.instanceOf(err, error.UnexpectedError);
        assert.strictEqual(err.innerError, errText);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(heartBeatStub.calledOnce);
      assert.isTrue(processTrackingUpdateStub.calledOnce);
      assert.isTrue(processTrackingCompleteStub.calledOnce);
      assert.isTrue(processTrackingMessageStub.called);
      assert.isTrue(processTrackingErrorStub.called);
      assert.isTrue(hertbeatStopStub.calledOnce);
    });

    it('will catch and publish an error when thrown by underlying functions', async () => {
      const inputBucketName = 'testInputBucketName';
      const outputBucketName = 'testOutputBucketName';
      const databaseName = 'testDatabaseName';

      const cleanupDataStub = sandbox.stub();
      cleanupDataStub.resolves();
      sandbox.replace((GlyphEngine as any).prototype, 'cleanupData', cleanupDataStub);
      const testError = new Error('testError');
      const startQueryStub = sandbox.stub();
      startQueryStub.rejects(testError);
      sandbox.replace((GlyphEngine as any).prototype, 'startQuery', startQueryStub);

      const getDataTypesStub = sandbox.stub();
      getDataTypesStub.resolves();
      sandbox.replace((GlyphEngine as any).prototype, 'getDataTypes', getDataTypesStub);

      const getTemplateAsStringStub = sandbox.stub();
      getTemplateAsStringStub.resolves('I am the raw template');
      sandbox.replace((GlyphEngine as any).prototype, 'getTemplateAsString', getTemplateAsStringStub);

      const updateSdtStub = sandbox.stub();
      updateSdtStub.resolves('I am the updated template');
      sandbox.replace((GlyphEngine as any).prototype, 'updateSdt', updateSdtStub);

      const putObjectStub = sandbox.stub();
      putObjectStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'putObject', putObjectStub);

      const parseSdtStringStub = sandbox.stub();
      parseSdtStringStub.resolves({} as unknown as SdtParser);
      sandbox.replace(SdtParser, 'parseSdtString', parseSdtStringStub);

      const getQueryResponseStub = sandbox.stub();
      getQueryResponseStub.resolves({status: QUERY_STATUS.SUCCEEDED});
      sandbox.replace((GlyphEngine as any).prototype, 'getQueryResponse', getQueryResponseStub);

      const processDataStub = sandbox.stub();
      processDataStub.resolves({
        sgnFileName: 'testSgnFileName',
        sgcFileName: 'testSgcFileName',
      });
      sandbox.replace((GlyphEngine as any).prototype, 'processData', processDataStub);
      const heartBeatStub = sandbox.stub();
      heartBeatStub.returns(null as unknown as void);
      sandbox.replace(Heartbeat.prototype, 'start', heartBeatStub);

      const processTrackingUpdateStub = sandbox.stub();
      processTrackingUpdateStub.resolves();
      sandbox.replace(processTrackingService, 'updateProcessStatus', processTrackingUpdateStub);

      const processTrackingCompleteStub = sandbox.stub();
      processTrackingCompleteStub.resolves();
      sandbox.replace(processTrackingService, 'completeProcess', processTrackingCompleteStub);

      const processTrackingMessageStub = sandbox.stub();
      processTrackingMessageStub.resolves();
      sandbox.replace(processTrackingService, 'addProcessMessage', processTrackingMessageStub);

      const processTrackingErrorStub = sandbox.stub();
      processTrackingErrorStub.resolves();
      sandbox.replace(processTrackingService, 'addProcessError', processTrackingErrorStub);

      const hertbeatStopStub = sandbox.stub();
      heartBeatStub.returns(null as unknown as void);
      sandbox.replace(Heartbeat.prototype, 'stop', hertbeatStopStub);

      const processId = 'testProcessId';
      const s3BucketInitStub = sandbox.stub();
      s3BucketInitStub.resolves();
      sandbox.replace(aws.S3Manager.prototype, 'init', s3BucketInitStub);

      const athenaInitStub = sandbox.stub();
      athenaInitStub.resolves();
      sandbox.replace(aws.AthenaManager.prototype, 'init', athenaInitStub);
      let s3Manager = new aws.S3Manager(inputBucketName);
      let athenaManager = new aws.AthenaManager(databaseName);
      await s3Manager.init();
      await athenaManager.init();
      const glyphEngine = new GlyphEngine(s3Manager, s3Manager, athenaManager, processId) as any;

      let didPublish = false;
      function fakePublish() {
        didPublish = true;
      }

      const publishOverride = sandbox.stub();
      publishOverride.callsFake(fakePublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);
      let errored = false;
      try {
        await glyphEngine.process(data);
      } catch (err: any) {
        assert.instanceOf(err, error.UnexpectedError);
        assert.strictEqual(err.innerError, testError);
        errored = true;
      }
      assert.isTrue(errored);
      assert.isTrue(didPublish);
    });
  });

  context('validateInput', () => {
    const inputBucketName = 'testInputBucketName';
    const databaseName = 'testDatabaseName';

    const processId = 'testProcessId';
    const glyphEngine = new GlyphEngine(
      null as unknown as aws.S3Manager,
      null as unknown as aws.S3Manager,
      null as unknown as aws.AthenaManager,
      processId
    ) as any;
    it('will succeed when all fields are present', () => {
      const data: Map<string, string> = new Map([
        ['model_id', 'testModelId'],
        ['client_id', 'testClientId'],
        ['x_axis', 'testXAxis'],
        ['y_axis', 'testYAxis'],
        ['z_axis', 'testZAxis'],
      ]);

      assert.doesNotThrow(() => {
        glyphEngine.validateInput(data);
      });
    });

    it('will Throw an InvalidArgumentError when model_id is not present', () => {
      const data: Map<string, string> = new Map([
        ['client_id', 'testClientId'],
        ['x_axis', 'testXAxis'],
        ['y_axis', 'testYAxis'],
        ['z_axis', 'testZAxis'],
      ]);

      assert.throws(() => {
        glyphEngine.validateInput(data);
      }, error.InvalidArgumentError);
    });

    it('will Throw an InvalidArgumentError when client_id is not present', () => {
      const data: Map<string, string> = new Map([
        ['model_id', 'testModelId'],
        ['x_axis', 'testXAxis'],
        ['y_axis', 'testYAxis'],
        ['z_axis', 'testZAxis'],
      ]);

      assert.throws(() => {
        glyphEngine.validateInput(data);
      }, error.InvalidArgumentError);
    });

    it('will Throw an InvalidArgumentError when x_axis is not present', () => {
      const data: Map<string, string> = new Map([
        ['model_id', 'testModelId'],
        ['client_id', 'testClientId'],
        ['y_axis', 'testYAxis'],
        ['z_axis', 'testZAxis'],
      ]);

      assert.throws(() => {
        glyphEngine.validateInput(data);
      }, error.InvalidArgumentError);
    });

    it('will Throw an InvalidArgumentError when y_axis is not present', () => {
      const data: Map<string, string> = new Map([
        ['model_id', 'testModelId'],
        ['client_id', 'testClientId'],
        ['x_axis', 'testxAxis'],
        ['z_axis', 'testZAxis'],
      ]);

      assert.throws(() => {
        glyphEngine.validateInput(data);
      }, error.InvalidArgumentError);
    });

    it('will Throw an InvalidArgumentError when z_axis is not present', () => {
      const data: Map<string, string> = new Map([
        ['model_id', 'testModelId'],
        ['client_id', 'testClientId'],
        ['x_axis', 'testxAxis'],
        ['y_axis', 'testyAxis'],
      ]);

      assert.throws(() => {
        glyphEngine.validateInput(data);
      }, error.InvalidArgumentError);
    });
  });
});
