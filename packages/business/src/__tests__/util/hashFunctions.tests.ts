import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {hashFileSystem, hashPayload, removePrefix} from '../../util/hashFunctions';
import {databaseTypes, fileIngestionTypes, webTypes} from 'types';
import {
  file1Clean,
  file1Dirty,
  file2Clean,
  file2Dirty,
  file3Clean,
  project1,
  project2,
  project3,
  project4,
  project5,
  project6,
  project7,
} from './data';

describe.only('#lib/hashFunctions', () => {
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

    /**
     * The following format is used to denote which project/files are in the core data combinations
     * files can either be clean (only include the keys we care about) or dirty (includes extra object properties which should not affect the hash)
     * We is
     * 1,[1,2] denotes...
     * project:
     * {
     *    files: [file1, file2]
     *    state: defaultState
     * }
     *
     * The fileSystem and column variant differentiations are denoted [fileVariant, fileVariant] for easy reference to keep this logic on the straight and narrow
     */

    // [1,[1,2]]
    it('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        // equivalent states, [clean, clean] = [dirty, dirty]
        // @ts-ignore
        const hash1 = hashPayload(hashFileSystem(project1.files), project1);
        // @ts-ignore
        const hash2 = hashPayload(hashFileSystem(project2.files), project2);
        assert.strictEqual(hash1, hash2);
      } catch (error) {
        assert.fail();
      }
    });

    // [1, [1,2]]
    it('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        // equivalent states, [clean/dirty] = [dirty/clean]
        // @ts-ignore
        const hash1 = hashPayload(hashFileSystem(project3.files), project3);
        // @ts-ignore
        const hash2 = hashPayload(hashFileSystem(project4.files), project4);
        assert.strictEqual(hash1, hash2);
      } catch (error) {
        assert.fail();
      }
    });

    it('will create a different hash due to changes to the X.key', async () => {
      try {
        // @ts-ignore
        const hash1 = hashPayload(hashFileSystem(project5.files), project5);
        // @ts-ignore
        const hash2 = hashPayload(hashFileSystem(project6.files), project6);
        assert.notEqual(hash1, hash2);
      } catch (error) {
        assert.fail();
      }
    });
    it.only('will create the same hash because change is an erroneous property', async () => {
      try {
        // @ts-ignore
        const hash1 = hashPayload(hashFileSystem(project5.files), project5);
        // @ts-ignore
        const hash2 = hashPayload(hashFileSystem(project7.files), project7);
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
    it('will correctly hash fileStats', async () => {
      try {
      } catch (error) {
        assert.fail();
      }
    });
  });
  context('removePrefix', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will remove the glyphx id prefix that is added by the ingestion process', async () => {
      try {
        const prefixedStr = 'glyphx_id__testing123';
        const retval = removePrefix(prefixedStr, 'glyphx_id__');
        assert.strictEqual(retval, 'testing123');
      } catch (error) {
        assert.fail();
      }
    });
    it('will leave the string untouched if it does not include the prefix', async () => {
      try {
        const nonPrefixedStr = 'testing123';
        const retval = removePrefix(nonPrefixedStr, 'glyphx_id__');
        assert.strictEqual(retval, 'testing123');
      } catch (error) {
        assert.fail();
      }
    });
  });
});
