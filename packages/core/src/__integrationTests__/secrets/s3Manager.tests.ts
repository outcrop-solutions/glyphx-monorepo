import 'mocha';
import {assert} from 'chai';
import {S3Manager} from '../../aws';
import {v4} from 'uuid';

const uniqueKey = v4().replaceAll('-', '');
const bucketName = 'jps-test-bucket';

describe('#integrationTests/s3Manager', () => {
  const s3Manager = new S3Manager(bucketName);
  const body = 'I am the body';
  const fileName = 'testFileName' + uniqueKey;
  let fileExists = false;

  before(async () => {
    await s3Manager.init();
  });

  after(async () => {
    if (fileExists) {
      await (s3Manager as any).bucket.deleteObject({
        BucketName: bucketName,
        Key: fileName,
      });
    }
  });

  context('Basic Operations', () => {
    it('will put the file into s3', async () => {
      await s3Manager.putObject(fileName, body);

      fileExists = true;
    });

    it('will check to see that the file exists', async () => {
      assert.isTrue(fileExists);

      const doesFileExist = await s3Manager.fileExists(fileName);
      assert.isTrue(doesFileExist);
    });

    it("will get the file and check it's contents", async () => {
      assert.isTrue(fileExists);

      const objStream = await s3Manager.getObjectStream(fileName);

      const chunks: Array<any> = [];
      for await (const chunk of objStream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);
      const str = buffer.toString('utf-8');

      assert.strictEqual(str, body);
    });

    it('will remove the file', async () => {
      assert.isTrue(fileExists);
      await s3Manager.removeObject(fileName);

      const fileExistsCheck = await s3Manager.fileExists(fileName);
      assert.isFalse(fileExistsCheck);

      fileExists = false;
    });
  });
});
