import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {hashFileSystem, hashPayload} from '../../util/hashFunctions';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {file1Clean, file1Dirty, file2Clean, file2Dirty, file3Clean, project1, project2} from './data';

describe('#lib/hashFunctions', () => {
  // ModelFooter needs to have a valid payloadHash
  context('hashFileSystem', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        const hash1 = hashFileSystem([file1Clean]);
        const hash2 = hashFileSystem([file1Dirty]);
        assert.strictEqual(hash1, hash2);

        const hash3 = hashFileSystem([file2Clean]);
        const hash4 = hashFileSystem([file2Dirty]);
        assert.strictEqual(hash3, hash4);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        const hash1 = hashFileSystem([file1Clean]);
        const hash2 = hashFileSystem([file2Dirty]);
        assert.notEqual(hash1, hash2);

        const hash3 = hashFileSystem([file2Clean]);
        const hash4 = hashFileSystem([file1Dirty]);
        assert.notEqual(hash3, hash4);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash for same files, different file order', async () => {
      try {
        const hash1 = hashFileSystem([file1Clean, file2Clean]);
        const hash2 = hashFileSystem([file2Clean, file1Clean]);

        assert.notEqual(hash1, hash2);

        const hash3 = hashFileSystem([file1Dirty, file2Dirty]);
        const hash4 = hashFileSystem([file2Dirty, file1Dirty]);
        assert.notEqual(hash3, hash4);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash for same file, different column order', async () => {
      try {
        const hash1 = hashFileSystem([file2Clean]);
        // this file has different column order
        const hash2 = hashFileSystem([file3Clean]);
        assert.notEqual(hash1, hash2);
      } catch (error) {
        assert.fail();
      }
    });
  });
  context('hashPayload', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it.only('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        // equivalent states, all clean vs all dirty filesystem
        // project1.files = [
        //   "7b0138d45344eba5d9e9ded21793c8af",
        //   "c6803af89edede1937c69b39b9a2fef4",
        // ] => "a721667ee02448f8044a5ab4d4c13f9b"

        const hash1 = hashPayload(hashFileSystem(project1.files), project1);
        const hash2 = hashPayload(hashFileSystem(project2.files), project2);
        assert.strictEqual(hash1, hash2);
      } catch (error) {
        assert.fail();
      }
    });
  });
  context('hashFileStats', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });

    it('will correctly hash fileStats', async () => {});
  });
});
