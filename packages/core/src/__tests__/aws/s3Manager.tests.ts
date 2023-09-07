import 'mocha';
import {assert} from 'chai';
import {
  S3Client,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import {S3Manager} from '../../aws';
import * as error from '../../error';
import {mockClient} from 'aws-sdk-client-mock';
import {S3Mock} from './s3Mocks';
import {Readable, PassThrough} from 'node:stream';
import {Upload} from '@aws-sdk/lib-storage';

describe('#aws/s3Manager', () => {
  context('constructor', () => {
    it('creates a new valid object', async () => {
      const bucketName = 'bucketName';
      const s3Manager = new S3Manager(bucketName);
      assert.strictEqual(s3Manager.bucketName, bucketName);
      assert.isFalse(s3Manager['inited']);
      assert.isDefined(s3Manager['bucketField']);
    });
    it('get bucket will throw an exception if accessed before init is called', async () => {
      const bucketName = 'bucketName';
      const s3Manager = new S3Manager(bucketName);
      assert.throws(() => {
        s3Manager['bucket'];
      }, error.InvalidOperationError);
    });
  });

  context('init', () => {
    let s3Mock: any;

    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('should fail when S3 throws an error', async () => {
      const errorMessage = 'oops I did it again';
      s3Mock.on(HeadBucketCommand).rejects(errorMessage);

      const s3Manager = new S3Manager('Some unknown bucket');
      let threw = false;
      try {
        await s3Manager.init();
      } catch (err) {
        threw = true;
        assert.instanceOf(err, error.InvalidArgumentError);
        assert.strictEqual((err as any).innerError.message, errorMessage);
      }

      assert.isTrue(threw);
    });
    it('should not fail when S3 throws an error', async () => {
      s3Mock.on(HeadBucketCommand).resolves(true as any);

      const s3Manager = new S3Manager('Some unknown bucket');
      let threw = false;
      try {
        await s3Manager.init();
      } catch (err) {
        threw = true;
      }

      assert.isFalse(threw);
    });
  });

  context('listObjects', () => {
    let s3Mock: any;

    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('will return 10 objects', async () => {
      const filter = 'table1/';
      const mock = new S3Mock({numberOfObjects: 10});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(ListObjectsV2Command).callsFake(mock.listObjectsV2.bind(mock));
      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      const keys = await s3Manager.listObjects(filter);
      assert.isArray(keys);
      assert.strictEqual(keys.length, 10);
      keys.forEach((k) => {
        assert.isTrue(k.startsWith(filter));
      });
    });
    it('will return 0 objects', async () => {
      const filter = 'table1/';

      const mock = new S3Mock({numberOfObjects: 0});

      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(ListObjectsV2Command).callsFake(mock.listObjectsV2.bind(mock));
      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      const keys = await s3Manager.listObjects(filter);
      assert.isArray(keys);
      assert.strictEqual(keys.length, 0);
    });
    it('will return 1500 objects', async () => {
      const filter = 'table1/';
      const mock = new S3Mock({numberOfObjects: 1500});

      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(ListObjectsV2Command).callsFake(mock.listObjectsV2.bind(mock));
      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      const keys = await s3Manager.listObjects(filter);
      assert.isArray(keys);
      assert.strictEqual(keys.length, 1500);
      keys.forEach((k) => {
        assert.isTrue(k.startsWith(filter));
      });
    });
    it('will return 2500 objects', async () => {
      const filter = 'table1/';
      const mock = new S3Mock({numberOfObjects: 2500});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(ListObjectsV2Command).callsFake(mock.listObjectsV2.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      const keys = await s3Manager.listObjects(filter);
      assert.isArray(keys);
      assert.strictEqual(keys.length, 2500);
      keys.forEach((k) => {
        assert.isTrue(k.startsWith(filter));
      });
    });
    it('will throw an InvalidOperationError if aws.S3 throws an error', async () => {
      const errorText = 'An Error has Occurred';
      const filter = 'table1/';
      const mock = new S3Mock({failsOnListObjects: errorText});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(ListObjectsV2Command).callsFake(mock.listObjectsV2.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      let threw = false;
      try {
        await s3Manager.listObjects(filter);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        assert.strictEqual((err as error.InvalidOperationError).innerError, errorText);
        threw = true;
      }
      assert.isTrue(threw);
    });
  });

  context('getFileInformation', () => {
    let s3Mock: any;
    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('will get object information', async () => {
      const fileSize = 63630;
      const fileName = 'testFileName';
      const mock = new S3Mock({headObjectFileSize: fileSize});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(HeadObjectCommand).callsFake(mock.headObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      const result = await s3Manager.getFileInformation(fileName);

      assert.strictEqual(result.fileName, fileName);
      assert.strictEqual(result.fileSize, fileSize);
      assert.isDefined(result.lastModified);
    });

    it('will throw an invalidArgumentError when an S3 error occurs', async () => {
      const errorText = 'An error has occurred';
      const mock = new S3Mock({failsOnHeadObject: errorText});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(HeadObjectCommand).callsFake(mock.headObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      let hasError = false;
      try {
        await s3Manager.getFileInformation('foo');
      } catch (err) {
        assert.instanceOf(err, error.InvalidArgumentError);
        hasError = true;
      }
      assert.isTrue(hasError);
    });
  });

  context('getObjectStream', () => {
    let s3Mock: any;
    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('will get a valid Readable Stream', async () => {
      const fileName = 'testFileName';
      const mock = new S3Mock();
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(GetObjectCommand).callsFake(mock.getObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      const result = await s3Manager.getObjectStream(fileName);
      assert.isOk(result);
      assert.instanceOf(result, Readable);
    });

    it('Will throw an InvalidOperationException when S3 throwa an exception', async () => {
      const fileName = 'testFileName';
      const errorText = 'An error has occurred';

      const mock = new S3Mock({failsOnGetObjects: errorText});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(GetObjectCommand).callsFake(mock.getObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      let hasError = false;
      try {
        await s3Manager.getObjectStream(fileName);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        hasError = true;
      }

      assert.isTrue(hasError);
    });
  });

  context('getUploadStream', () => {
    let s3Mock: any;
    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('Will get an Upload object for uploading to our bucket', async () => {
      const mock = new S3Mock();
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      const psStream = new PassThrough();

      const upload = s3Manager.getUploadStream('someupload_file_name', psStream);

      assert.isOk(upload);
      assert.instanceOf(upload, Upload);
      assert.strictEqual(upload['params'].Body, psStream);
      assert.strictEqual(upload['client'], s3Manager['bucket']);
    });
  });

  context('removeObject', () => {
    let s3Mock: any;
    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('should delete an object', async () => {
      const mock = new S3Mock();
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(DeleteObjectCommand).callsFake(mock.removeObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      let errored = false;
      try {
        await s3Manager.removeObject('Idonotexist');
      } catch (err) {
        errored = true;
      }
      assert.isFalse(errored);
    });
    it('should throw an error when S3Client throws an error', async () => {
      const mock = new S3Mock({failsOnDelteObject: 'I am an error'});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(DeleteObjectCommand).callsFake(mock.removeObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();
      let errored = false;
      try {
        await s3Manager.removeObject('Idonotexist');
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });

  context('fileExists', () => {
    let s3Mock: any;
    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });
    it('will return true if the file exists', async () => {
      const fileSize = 63630;
      const fileName = 'testFileName';
      const mock = new S3Mock({headObjectFileSize: fileSize});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(HeadObjectCommand).callsFake(mock.headObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      const result = await s3Manager.fileExists(fileName);

      assert.isTrue(result);
    });

    it('will return false if the file does not exist', async () => {
      const errorText = 'An error has occurred';
      const fileName = 'testFileName';
      const mock = new S3Mock({failsOnHeadObject: errorText});
      s3Mock.on(HeadBucketCommand).callsFake(mock.headBucket.bind(mock));
      s3Mock.on(HeadObjectCommand).callsFake(mock.headObject.bind(mock));

      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      const result = await s3Manager.fileExists(fileName);

      assert.isFalse(result);
    });
  });

  context('putObject', () => {
    let s3Mock: any;
    beforeEach(() => {
      /* eslint-disable-next-line */
      //@ts-ignore
      s3Mock = mockClient(S3Client);
    });

    afterEach(() => {
      s3Mock.restore();
    });

    it('will put an string into s3 bucket', async () => {
      const fileName = 'testFileName';
      const body = 'I am the test files data';

      const mock = new S3Mock();

      s3Mock.on(PutObjectCommand).callsFake(mock.putObject.bind(mock));
      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      await s3Manager.putObject(fileName, body);

      assert.strictEqual(mock.putFileName, fileName);
    });
    it('will throw an InvalidOperationError if the put fails', async () => {
      const fileName = 'testFileName';
      const body = 'I am the test files data';

      const errorText = 'Something bad has happened';

      const mock = new S3Mock({failsOnPutObject: errorText});

      s3Mock.on(PutObjectCommand).callsFake(mock.putObject.bind(mock));
      const s3Manager = new S3Manager('Some unknown bucket');
      await s3Manager.init();

      let errored = false;
      try {
        await s3Manager.putObject(fileName, body);
      } catch (err) {
        assert.instanceOf(err, error.InvalidOperationError);
        errored = true;
      }
      assert.isTrue(errored);
    });
  });
});
