import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import {s3Connection} from '../../lib';
import {HashResolver} from 'util/HashResolver';
import {removePrefix} from '../../util/hashFunctions';
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
  project8,
} from './data';

describe('#util/HashResolver', () => {
  const sandbox = createSandbox();
  afterEach(() => {
    sandbox.restore();
  });
  context('constructor', () => {
    it('should build a hash resolver with the correct setup', async () => {
      const workspaceId = 'wid';
      const projectId = 'pid';
      const basePath = `client/${workspaceId}/${projectId}/output`;
      await s3Connection.init();
      const s3 = s3Connection.s3Manager;
      const resolver = new HashResolver(workspaceId, projectId, s3);

      assert.strictEqual(resolver.s3, s3);
      assert.strictEqual(resolver.workspaceId, workspaceId);
      assert.strictEqual(resolver.projectId, projectId);
      assert.strictEqual(resolver.basePath, basePath);
      assert.strictEqual(resolver.status, 'PENDING');
      assert.strictEqual(resolver.strategies.size, 7);
    });
  });
  context('fileHash', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};

        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: {...project1, files: [file1Clean]},
        };
        const req2 = {
          type: 'project',
          project: {
            ...project1,
            files: [file1Dirty],
          },
        };

        const retval = await resolver.resolve(req1 as any);
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        assert.strictEqual(s3Stub.callCount, 6);
        assert.strictEqual(retval?.fileHash, retval2?.fileHash);

        const req3 = {
          type: 'project',
          project: {...project1, files: [file2Clean]},
        };
        const req4 = {
          type: 'project',
          project: {
            ...project1,
            files: [file2Dirty],
          },
        };
        const retval3 = await resolver.resolve(req3 as any);
        assert.strictEqual(s3Stub.callCount, 9);

        const retval4 = await resolver.resolve(req4 as any);
        assert.strictEqual(s3Stub.callCount, 12);
        assert.strictEqual(retval3?.fileHash, retval4?.fileHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};

        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: {...project1, files: [file1Clean]},
        };
        const req2 = {
          type: 'project',
          project: {
            ...project1,
            files: [file2Dirty],
          },
        };

        const retval = await resolver.resolve(req1 as any);
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        assert.strictEqual(s3Stub.callCount, 6);
        assert.notEqual(retval?.fileHash, retval2?.fileHash);

        const req3 = {
          type: 'project',
          project: {...project1, files: [file2Clean]},
        };
        const req4 = {
          type: 'project',
          project: {
            ...project1,
            files: [file1Dirty],
          },
        };
        const retval3 = await resolver.resolve(req3 as any);
        assert.strictEqual(s3Stub.callCount, 9);

        const retval4 = await resolver.resolve(req4 as any);
        assert.strictEqual(s3Stub.callCount, 12);
        assert.notEqual(retval3?.fileHash, retval4?.fileHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash for same files, different file order', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};

        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: {...project1, files: [file1Clean, file2Clean]},
        };
        const req2 = {
          type: 'project',
          project: {
            ...project1,
            files: [file2Clean, file1Clean],
          },
        };

        const retval = await resolver.resolve(req1 as any);
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        assert.strictEqual(s3Stub.callCount, 6);
        assert.notEqual(retval?.fileHash, retval2?.fileHash);

        const req3 = {
          type: 'project',
          project: {...project1, files: [file1Dirty, file2Dirty]},
        };
        const req4 = {
          type: 'project',
          project: {
            ...project1,
            files: [file2Dirty, file1Dirty],
          },
        };
        const retval3 = await resolver.resolve(req3 as any);
        assert.strictEqual(s3Stub.callCount, 9);

        const retval4 = await resolver.resolve(req4 as any);
        assert.strictEqual(s3Stub.callCount, 12);
        assert.notEqual(retval3?.fileHash, retval4?.fileHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash for same file, different column order', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};

        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: {...project1, files: [file2Clean]},
        };
        const req2 = {
          type: 'project',
          project: {
            ...project1,
            files: [file3Clean], // this file has different column order
          },
        };

        const retval = await resolver.resolve(req1 as any);
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        assert.strictEqual(s3Stub.callCount, 6);
        assert.notEqual(retval?.fileHash, retval2?.fileHash);
      } catch (error) {
        assert.fail();
      }
    });
  });
  /**
   * The following format is used to denote which project/files are in the core data combinations
   * files can either be clean (only include the keys we care about) or dirty (includes extra object properties which should not affect the hash)
   * Were
   * 1,[1,2] denotes...
   * project:
   * {
   *    files: [file1, file2]
   *    state: defaultState
   * }
   *
   * The fileSystem and column variant differentiations are denoted [fileVariant, fileVariant] for easy reference to keep this logic on the straight and narrow
   */
  context('payloadHash', () => {
    // [1,[1,2]]
    it('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        // equivalent states, [clean, clean] = [dirty, dirty]
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};

        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: project1,
        };
        const req2 = {
          type: 'project',
          project: project2,
        };

        const retval = await resolver.resolve(req1 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 6);

        assert.strictEqual(retval?.fileHash, retval2?.fileHash);
        assert.strictEqual(retval?.payloadHash, retval2?.payloadHash);
      } catch (error) {
        assert.fail();
      }
    });
    // [1, [1,2]]
    it('will create the same hash regardless of extraneous properties in the fileStats array members', async () => {
      try {
        // equivalent states, [clean/dirty] = [dirty/clean]
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};
        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: project3,
        };
        const req2 = {
          type: 'project',
          project: project4,
        };

        const retval = await resolver.resolve(req1 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 6);

        assert.strictEqual(retval?.fileHash, retval2?.fileHash);
        assert.strictEqual(retval?.payloadHash, retval2?.payloadHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash due to changes to the X.key', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};
        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: project5,
        };
        const req2 = {
          type: 'project',
          project: project6,
        };

        const retval = await resolver.resolve(req1 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 6);

        //  assert.strictEqual(retval?.fileHash, retval2?.fileHash);
        assert.notEqual(retval?.payloadHash, retval2?.payloadHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create the same hash because "change" is an erroneous property', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};
        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: project5,
        };
        const req2 = {
          type: 'project',
          project: project7,
        };

        const retval = await resolver.resolve(req1 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 6);

        assert.strictEqual(retval?.fileHash, retval2?.fileHash);
        assert.strictEqual(retval?.payloadHash, retval2?.payloadHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('will create a different hash based on a change in projectId', async () => {
      try {
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().resolves(true);
        const s3 = {fileExists: s3Stub};
        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: project5,
        };
        const req2 = {
          type: 'project',
          project: project8,
        };

        const retval = await resolver.resolve(req1 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 3);

        const retval2 = await resolver.resolve(req2 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 6);

        assert.notEqual(retval?.payloadHash, retval2?.payloadHash);
      } catch (error) {
        assert.fail();
      }
    });
    it('this is here for retro-active debugging purposes', async () => {
      try {
        // const project = {
        //   id: '66c781bf2ad1a468ec1446ac',
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        //   name: '8_22_requirement_validation_time',
        //   docId: 'pTUye-aPBiWzuE6YqfzJO',
        //   description: '',
        //   currentVersion: 0,
        //   workspace: '66b66a4faa83b6d2b3deb8f3',
        //   state: {
        //     properties: {
        //       X: {
        //         axis: 'X',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'mml_type',
        //         dataType: 1,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           keywords: ['MATERIAL'],
        //         },
        //       },
        //       Y: {
        //         axis: 'Y',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'date_requested',
        //         dataType: 3,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           keywords: [],
        //         },
        //         dateGrouping: 'qualified_day_of_year',
        //       },
        //       Z: {
        //         axis: 'Z',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'requirement_validation_timedifference_in_days_created_to_requested',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 3,
        //         },
        //         accumulatorType: 'AVG',
        //       },
        //       A: {
        //         axis: 'A',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'Column 1',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 0,
        //         },
        //       },
        //       B: {
        //         axis: 'B',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'Column 2',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 0,
        //         },
        //       },
        //       C: {
        //         axis: 'C',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'Column 3',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 0,
        //         },
        //       },
        //     },
        //   },
        //   stateHistory: ['66c78221f96dc936be9901f2', '66cf226fec20160bc7386a1e'],
        //   members: ['66c781bf2ad1a468ec1446c1'],
        //   tags: [],
        //   files: [
        //     {
        //       fileName: 'cwt_jlt_8_22_mod_2.csv',
        //       tableName: 'cwt_jlt_8_22_mod_2',
        //       numberOfRows: 3025,
        //       numberOfColumns: 13,
        //       columns: [
        //         {
        //           name: 'glyphx_id__',
        //           fieldType: 2,
        //         },
        //         {
        //           name: 's_no',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'mml_type',
        //           fieldType: 1,
        //           longestString: 18,
        //         },
        //         {
        //           name: 'date_created',
        //           fieldType: 3,
        //         },
        //         {
        //           name: 'date_requested',
        //           fieldType: 3,
        //         },
        //         {
        //           name: 'xdate_ordered',
        //           fieldType: 1,
        //           longestString: 9,
        //         },
        //         {
        //           name: 'date_desired_ep',
        //           fieldType: 3,
        //         },
        //         {
        //           name: 'xdate_rcvd',
        //           fieldType: 1,
        //           longestString: 9,
        //         },
        //         {
        //           name: 'total_procurement_time_requirement_created_to_delivery',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'delivery_performance_difference_in_days_between_delivered_and_desired_date',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'requirement_validation_timedifference_in_days_created_to_requested',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'order_processing_time_difference_b_w_requested_and_ordered',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'order_fulfillment_time_difference_b_w_ordered_and_received',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'internal_delivery_time_difference_b_w_received_and_delivered',
        //           fieldType: 0,
        //         },
        //       ],
        //       fileSize: 1772688,
        //     },
        //   ],
        //   viewName: 'glyphx_66b66a4faa83b6d2b3deb8f3_66c781bf2ad1a468ec1446ac_view',
        //   aspectRatio: {
        //     height: 1376,
        //     width: 1722,
        //     id: '66cf2270ec20160bc7386a35',
        //   },
        //   imageHash: '',
        // };
        // const project2 = {
        //   id: '66c781bf2ad1a468ec1446ac',
        //   createdAt: new Date(),
        //   updatedAt: new Date(),
        //   name: '8_22_requirement_validation_time',
        //   docId: 'pTUye-aPBiWzuE6YqfzJO',
        //   description: '',
        //   currentVersion: 0,
        //   workspace: '66b66a4faa83b6d2b3deb8f3',
        //   state: {
        //     properties: {
        //       X: {
        //         axis: 'X',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'mml_type',
        //         dataType: 1,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           keywords: [],
        //         },
        //       },
        //       Y: {
        //         axis: 'Y',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'date_requested',
        //         dataType: 3,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           keywords: [],
        //         },
        //         dateGrouping: 'qualified_day_of_year',
        //       },
        //       Z: {
        //         axis: 'Z',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'requirement_validation_timedifference_in_days_created_to_requested',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 3,
        //         },
        //         accumulatorType: 'AVG',
        //       },
        //       A: {
        //         axis: 'A',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'Column 1',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 0,
        //         },
        //       },
        //       B: {
        //         axis: 'B',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'Column 2',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 0,
        //         },
        //       },
        //       C: {
        //         axis: 'C',
        //         accepts: 'COLUMN_DRAG',
        //         key: 'Column 3',
        //         dataType: 0,
        //         interpolation: 'LIN',
        //         direction: 'ASC',
        //         filter: {
        //           min: 0,
        //           max: 0,
        //         },
        //       },
        //     },
        //   },
        //   stateHistory: ['66c78221f96dc936be9901f2', '66cf226fec20160bc7386a1e'],
        //   members: ['66c781bf2ad1a468ec1446c1'],
        //   tags: [],
        //   files: [
        //     {
        //       fileName: 'cwt_jlt_8_22_mod_2.csv',
        //       tableName: 'cwt_jlt_8_22_mod_2',
        //       numberOfRows: 3025,
        //       numberOfColumns: 13,
        //       columns: [
        //         {
        //           name: 'glyphx_id__',
        //           fieldType: 2,
        //         },
        //         {
        //           name: 's_no',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'mml_type',
        //           fieldType: 1,
        //           longestString: 18,
        //         },
        //         {
        //           name: 'date_created',
        //           fieldType: 3,
        //         },
        //         {
        //           name: 'date_requested',
        //           fieldType: 3,
        //         },
        //         {
        //           name: 'xdate_ordered',
        //           fieldType: 1,
        //           longestString: 9,
        //         },
        //         {
        //           name: 'date_desired_ep',
        //           fieldType: 3,
        //         },
        //         {
        //           name: 'xdate_rcvd',
        //           fieldType: 1,
        //           longestString: 9,
        //         },
        //         {
        //           name: 'total_procurement_time_requirement_created_to_delivery',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'delivery_performance_difference_in_days_between_delivered_and_desired_date',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'requirement_validation_timedifference_in_days_created_to_requested',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'order_processing_time_difference_b_w_requested_and_ordered',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'order_fulfillment_time_difference_b_w_ordered_and_received',
        //           fieldType: 0,
        //         },
        //         {
        //           name: 'internal_delivery_time_difference_b_w_received_and_delivered',
        //           fieldType: 0,
        //         },
        //       ],
        //       fileSize: 1772688,
        //     },
        //   ],
        //   viewName: 'glyphx_66b66a4faa83b6d2b3deb8f3_66c781bf2ad1a468ec1446ac_view',
        //   aspectRatio: {
        //     height: 1376,
        //     width: 1722,
        //     id: '66cf2270ec20160bc7386a35',
        //   },
        //   imageHash: '',
        // };
        // "33bbc1ba093c2096dbe8024827f79f7a" - this is what is actually in s3, it is being produced in glyphengine because the project is updated AFTER the payloadhash is calculated
        // const hash1 = hashPayload(hashFiles(project.files), project as unknown as databaseTypes.IProject);
        // '48e165673514843bf5b32dcb0c4f2d55'; - this is the newHash occording to our logs.
        // conclusion: glyphengine and signDataUrls get pre vs. post filter application payload hashes, resulting in the string filter error
        // const hash2 = hashPayload(hashFiles(project2.files), project2 as unknown as databaseTypes.IProject);
        // assert.isOk(hash1);
        // assert.isOk(hash2);
        // assert.notEqual(hash1, hash2);
      } catch (error) {
        assert.fail();
      }
    });
    it('will fallback to the previous hash strategy if the first one does not exist and still produce a consistent result', async () => {
      try {
        // equivalent states, [clean, clean] = [dirty, dirty]
        const workspaceId = 'wid';
        const projectId = 'pid';
        await s3Connection.init();
        const s3Stub = sandbox.stub().onCall(0).resolves(true);
        // first strategy (none exist)
        s3Stub.onCall(0).resolves(true);
        s3Stub.onCall(1).resolves(true);
        s3Stub.onCall(2).resolves(false);

        // second strategy (all exist)
        s3Stub.onCall(3).resolves(true);
        s3Stub.onCall(4).resolves(true);
        s3Stub.onCall(5).resolves(true);

        // first strategy (none exist)
        s3Stub.onCall(6).resolves(true);
        s3Stub.onCall(7).resolves(true);
        s3Stub.onCall(8).resolves(false);

        // second strategy (all exist)
        s3Stub.onCall(9).resolves(true);
        s3Stub.onCall(10).resolves(true);
        s3Stub.onCall(11).resolves(true);

        const s3 = {fileExists: s3Stub};

        const resolver = new HashResolver(workspaceId, projectId, s3 as any);

        const req1 = {
          type: 'project',
          project: project1,
        };
        const req2 = {
          type: 'project',
          project: project2,
        };

        const retval = await resolver.resolve(req1 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 6);

        const retval2 = await resolver.resolve(req2 as any);
        // called s3 stub appropriately
        assert.strictEqual(s3Stub.callCount, 12);

        assert.strictEqual(retval?.fileHash, retval2?.fileHash);
        assert.strictEqual(retval?.payloadHash, retval2?.payloadHash);
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
