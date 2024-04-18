import 'mocha';
import {assert} from 'chai';
import {createSandbox} from 'sinon';
import rewire from 'rewire';
import {error, constants} from 'core';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, rustGlyphEngineTypes, webTypes} from 'types';
import {buildRustPayload, checkRustGlyphEnginePayload, getFieldType} from 'etl/rustGlyphEngine';
import {ActionError} from 'core/src/error';
describe('#etl/rustGlyphEngine', () => {
  context('runGlyphEngine', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it('should return a IGlyphEngineResult when successful', async () => {
      let expectedResult: rustGlyphEngineTypes.IGlyphEngineResults = {
        x_axis_vectors_file_name: 'x_axis_vectors_file_name',
        y_axis_vectors_file_name: 'y_axis_vectors_file_name',
        glyphs_file_name: 'glyphs_file_name',
        statistics_file_name: 'statistics_file_name',
      };
      let GlyphEngine = rewire('../../etl/rustGlyphEngine');
      GlyphEngine.__set__('internalModule', {
        exports: {
          run: (args: any) => {
            return Promise.resolve(expectedResult);
          },
        },
      });
      let runner = GlyphEngine.__get__('bindings');
      let stub = sandbox.stub(error.GlyphxError.prototype, 'publish');

      const result = (await runner.runGlyphEngine({})) as rustGlyphEngineTypes.IGlyphEngineResults;
      assert(stub.notCalled);
      assert.deepEqual(result, expectedResult);
    });

    it('should return an ActionError when glyph_engine fails', async () => {
      let innerError = 'Hi Mom from Rewrire';
      let GlyphEngine = rewire('../../etl/rustGlyphEngine');
      GlyphEngine.__set__('internalModule', {
        exports: {
          run: (args: any) => {
            throw innerError;
          },
        },
      });
      let runner = GlyphEngine.__get__('bindings');
      let stub = sandbox.stub(error.GlyphxError.prototype, 'publish');

      const result = (await runner.runGlyphEngine({})) as error.ActionError;
      assert(stub.calledOnceWith(constants.ERROR_SEVERITY.ERROR));
      assert.instanceOf(result, error.ActionError);
      assert.equal(result.innerError, innerError);
      assert.equal((result.data as any).key, 'glyph_engine');
    });
  });
  context('getFieldType', () => {
    it('should get the appropriate field type for a date', () => {
      try {
        const axis = webTypes.constants.AXIS.X;
        const properties = {
          X: {
            dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
          },
        };
        const retval = getFieldType(axis, properties as unknown as databaseTypes.IProject['state']['properties']);
        assert.strictEqual(retval, 'date');
      } catch (error) {
        assert.fail();
      }
    });
    it('should get the appropriate field type for an integer', () => {
      try {
        const axis = webTypes.constants.AXIS.X;
        const properties = {
          X: {
            dataType: fileIngestionTypes.constants.FIELD_TYPE.INTEGER,
          },
        };
        const retval = getFieldType(axis, properties as unknown as databaseTypes.IProject['state']['properties']);
        assert.strictEqual(retval, 'standard');
      } catch (error) {
        assert.fail();
      }
    });
    it('should get the appropriate field type for a string', () => {
      try {
        const axis = webTypes.constants.AXIS.X;
        const properties = {
          X: {
            dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
          },
        };
        const retval = getFieldType(axis, properties as unknown as databaseTypes.IProject['state']['properties']);
        assert.strictEqual(retval, 'standard');
      } catch (error) {
        assert.fail();
      }
    });
  });
  context('checkRustGlyphEnginePayload', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    // check to see the error only returns the string to the action consumer
    const saneError = 'An unexpected error occurred checking the rust GlyphEngine payload';

    it('should return true if all properties are included', () => {
      const payload = {
        workspace_id: 'workspace_id',
        project_id: 'project_id',
        output_file_prefix: 'output_file_prefix',
        data_table_name: 'data_table_name',
        model_hash: 'model_hash',
        // can handle integer | string
        xAxis: {
          fieldDisplayName: 'Column 1', // can handle different colun display / field names
          fieldDataType: 1, // string
          fieldDefinition: {
            fieldType: 'standard',
            fieldName: 'col1',
          } as rustGlyphEngineTypes.IStandardFieldDefinition,
        },
        // can handle date
        yAxis: {
          fieldDisplayName: 'col2',
          fieldDataType: 3, // from FieldDataType
          fieldDefinition: {
            fieldType: 'date',
            fieldName: 'col2',
            dateGrouping: String(glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR),
          } as rustGlyphEngineTypes.IDateFieldDefinition,
        },
        // can handle correctly formatted zAxis payload
        zAxis: {
          fieldDisplayName: 'col3',
          fieldDataType: 0, // number
          fieldDefinition: {
            fieldType: 'accumulated',
            accumulatorType: 'sum',
            accumulatedField: {
              fieldType: 'standard',
              fieldName: 'col3',
            },
          } as rustGlyphEngineTypes.IAccumulatedFieldDefinition,
        },
      };

      // no error is thrown, true is returned
      const retval = checkRustGlyphEnginePayload(payload);
      assert.isTrue(retval);
    });
    it('should throw an error if workspace_id is missing', () => {
      const errMessage = 'invalid workspace id';
      const err = new error.InvalidArgumentError(errMessage, 'workspace_id', {});
      const payload = {} as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      // no error is thrown, it is returned
      const retval = checkRustGlyphEnginePayload(payload);

      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if project_id is missing', () => {
      const errMessage = 'invalid project id';
      const err = new error.InvalidArgumentError(errMessage, 'project_id', {});
      const payload = {
        workspace_id: '',
      } as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      // no error is thrown, it is returned
      const retval = checkRustGlyphEnginePayload(payload);

      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if output file prefix is missing', () => {
      const errMessage = 'invalid output file prefix';
      const err = new error.InvalidArgumentError(errMessage, 'output_file_prefix', {});
      const payload = {
        workspace_id: '',
      } as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      // no error is thrown, it is returned
      const retval = checkRustGlyphEnginePayload(payload);

      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if table name is missing', () => {
      const errMessage = 'invalid data table name';
      const err = new error.InvalidArgumentError(errMessage, 'data_table_name', {});
      const payload = {
        workspace_id: '',
        project_id: '',
        output_file_prefix: '',
      } as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      // no error is thrown, it is returned
      const retval = checkRustGlyphEnginePayload(payload);

      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if model hash is missing', () => {
      const errMessage = 'invalid model hash';
      const err = new error.InvalidArgumentError(errMessage, 'model_hash', {});

      const payload = {
        workspace_id: '',
        project_id: '',
        output_file_prefix: '',
        data_table_name: '',
      } as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      // no error is thrown, it is returned
      const retval = checkRustGlyphEnginePayload(payload);

      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if empty columns are present', () => {
      const errMessage = 'No empty columns are allowed in the glyphengine payload';
      const err = new error.InvalidArgumentError(errMessage, 'X', {});
      const payload = {
        workspace_id: 'workspace_id',
        project_id: 'project_id',
        output_file_prefix: 'output_file_prefix',
        data_table_name: 'data_table_name',
        model_hash: 'model_hash',
        // can handle integer | string
        xAxis: {
          fieldDisplayName: 'Column 1', // can handle different colun display / field names
          fieldDataType: 1, // string
          fieldDefinition: {
            fieldType: 'standard',
            fieldName: '', // EMPTY COLUMN HERE
          } as rustGlyphEngineTypes.IStandardFieldDefinition,
        },
        // can handle date
        yAxis: {
          fieldDisplayName: 'col2',
          fieldDataType: 3, // from FieldDataType
          fieldDefinition: {
            fieldType: 'date',
            fieldName: 'col2',
            dateGrouping: String(glyphEngineTypes.constants.DATE_GROUPING.DAY_OF_YEAR),
          } as rustGlyphEngineTypes.IDateFieldDefinition,
        },
        // can handle correctly formatted zAxis payload
        zAxis: {
          fieldDisplayName: 'col3',
          fieldDataType: 0, // number
          fieldDefinition: {
            fieldType: 'accumulated',
            accumulatorType: 'sum',
            accumulatedField: {
              fieldType: 'standard',
              fieldName: 'col3',
            },
          } as rustGlyphEngineTypes.IAccumulatedFieldDefinition,
        },
      };
      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const retval = checkRustGlyphEnginePayload(payload);
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if a date column is missing a date grouping', () => {
      const errMessage = 'Date column has invalid date grouping';
      const err = new error.InvalidArgumentError(errMessage, 'X', {});
      const payload = {
        workspace_id: 'workspace_id',
        project_id: 'project_id',
        output_file_prefix: 'output_file_prefix',
        data_table_name: 'data_table_name',
        model_hash: 'model_hash',
        // can handle integer | string
        xAxis: {
          fieldDisplayName: 'Column 1', // can handle different colun display / field names
          fieldDataType: 1, // string
          fieldDefinition: {
            fieldType: 'standard',
            fieldName: 'col1', // EMPTY COLUMN HERE
          } as rustGlyphEngineTypes.IStandardFieldDefinition,
        },
        // can handle date
        yAxis: {
          fieldDisplayName: 'col2',
          fieldDataType: 3, // from FieldDataType
          fieldDefinition: {
            fieldType: 'date',
            fieldName: 'col2',
            dateGrouping: undefined, // ! INVALID DATE GROUPING
          } as unknown as rustGlyphEngineTypes.IDateFieldDefinition,
        },
        // can handle correctly formatted zAxis payload
        zAxis: {
          fieldDisplayName: 'col3',
          fieldDataType: 0, // number
          fieldDefinition: {
            fieldType: 'accumulated',
            accumulatorType: 'sum',
            accumulatedField: {
              fieldType: 'standard',
              fieldName: 'col3',
            },
          } as rustGlyphEngineTypes.IAccumulatedFieldDefinition,
        },
      };
      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const retval = checkRustGlyphEnginePayload(payload);
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
    it('should throw an error if an accumulated field is missing the accumulatorType', () => {
      const errMessage = 'Accumulated field has invalid accumulator type or field';
      const err = new error.InvalidArgumentError(errMessage, 'X', {});
      const payload = {
        workspace_id: 'workspace_id',
        project_id: 'project_id',
        output_file_prefix: 'output_file_prefix',
        data_table_name: 'data_table_name',
        model_hash: 'model_hash',
        // can handle integer | string
        xAxis: {
          fieldDisplayName: 'Column 1', // can handle different colun display / field names
          fieldDataType: 1, // string
          fieldDefinition: {
            fieldType: 'standard',
            fieldName: 'col1', // EMPTY COLUMN HERE
          } as rustGlyphEngineTypes.IStandardFieldDefinition,
        },
        // can handle date
        yAxis: {
          fieldDisplayName: 'col2',
          fieldDataType: 3, // from FieldDataType
          fieldDefinition: {
            fieldType: 'date',
            fieldName: 'col2',
            dateGrouping: undefined, // ! INVALID DATE GROUPING
          } as unknown as rustGlyphEngineTypes.IDateFieldDefinition,
        },
        // can handle correctly formatted zAxis payload
        zAxis: {
          fieldDisplayName: 'col3',
          fieldDataType: 0, // number
          fieldDefinition: {
            fieldType: 'accumulated',
            accumulatorType: undefined,
            accumulatedField: {
              fieldType: 'standard',
              fieldName: 'col3',
            },
          } as unknown as rustGlyphEngineTypes.IAccumulatedFieldDefinition,
        },
      };
      function fakePublish() {
        //@ts-ignore
        assert.instanceOf(this, error.InvalidArgumentError);
        //@ts-ignore
        assert.strictEqual(this.message, errMessage);
      }

      const boundPublish = fakePublish.bind(err);
      const publishOverride = sandbox.stub();
      publishOverride.callsFake(boundPublish);
      sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

      const retval = checkRustGlyphEnginePayload(payload);
      // @ts-ignore
      if (retval?.error) {
        // @ts-ignore
        assert.strictEqual(retval.error, saneError);
        assert.isTrue(publishOverride.calledOnce);
      } else {
        assert.fail();
      }
    });
  });
  context('buildRustPayload', () => {
    const sandbox = createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    const saneError = 'An unexpected error occurred building the rust glyphengine payload';
    it('should build a correct payload', () => {
      try {
        const expected = {
          workspace_id: 'workspaceId',
          project_id: 'projectId',
          output_file_prefix: 'client',
          data_table_name: 'glyphx_workspaceid_projectid_table1',
          model_hash: '9e6ba1aed5de9e444e75bae5d279a94c',
          // can handle integer | string
          xAxis: {
            fieldDisplayName: 'col1', // can handle different colun display / field names
            fieldDataType: 1, // string
            fieldDefinition: {
              fieldType: 'standard',
              fieldName: 'col1',
            } as rustGlyphEngineTypes.IStandardFieldDefinition,
          },
          // can handle date
          yAxis: {
            fieldDisplayName: 'col2',
            fieldDataType: 3, // from FieldDataType
            fieldDefinition: {
              fieldType: 'date',
              fieldName: 'col2',
              dateGrouping: String(glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR),
            } as rustGlyphEngineTypes.IDateFieldDefinition,
          },
          // can handle correctly formatted zAxis payload
          zAxis: {
            fieldDisplayName: 'col3',
            fieldDataType: 0, // number
            fieldDefinition: {
              fieldType: 'accumulated',
              fieldName: 'col3',
              accumulatorType: 'sum',
              accumulatedField: {
                fieldType: 'standard',
                fieldName: 'col3',
              },
            } as rustGlyphEngineTypes.IAccumulatedFieldDefinition,
          },
          filter: '',
        };
        // payload to be transformed
        const project = {
          id: 'projectId',
          workspace: {
            id: 'workspaceId',
          },
          files: [
            {
              fileName: 'table1.csv',
              columns: [
                {name: 'col1', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING},
                {name: 'col2', fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE},
                {name: 'col3', fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER},
              ],
              tableName: 'table1',
            },
          ] as databaseTypes.IProject['files'],
          state: {
            properties: {
              X: {
                key: 'col1',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.X,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Y: {
                key: 'col2',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
                axis: webTypes.constants.AXIS.Y,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Z: {
                key: 'col3',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
                axis: webTypes.constants.AXIS.Z,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM,
                filter: {
                  min: 0,
                  max: 0,
                },
              },
              A: {
                key: 'col4',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.A,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              B: {
                key: 'col5',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.B,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              C: {
                key: 'col6',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.C,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
            } as databaseTypes.IProject['state']['properties'],
          },
        };

        const properties = project.state.properties;

        const retval = buildRustPayload(project as databaseTypes.IProject, properties);
        assert.deepEqual(retval, expected);
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an error when the project has no files', () => {
      try {
        // ts payload to be transformed
        const project = {
          id: 'projectId',
          workspace: {
            id: 'workspaceId',
          },
          files: [] as databaseTypes.IProject['files'],
          state: {
            properties: {
              X: {
                key: 'col1',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.X,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Y: {
                key: 'col2',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
                axis: webTypes.constants.AXIS.Y,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Z: {
                key: 'col3',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
                axis: webTypes.constants.AXIS.Z,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM,
                filter: {
                  min: 0,
                  max: 0,
                },
              },
              A: {
                key: 'col4',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.A,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              B: {
                key: 'col5',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.B,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              C: {
                key: 'col6',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.C,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
            } as databaseTypes.IProject['state']['properties'],
          },
        };

        // expected error
        const errMessage = 'No files present, upload a file and drop columns before running glyph engine';
        const err = new error.InvalidArgumentError(errMessage, 'project', {});

        const properties = project.state.properties;

        function fakePublish() {
          //@ts-ignore
          assert.instanceOf(this, error.InvalidArgumentError);
          //@ts-ignore
          assert.strictEqual(this.message, errMessage);
        }

        const boundPublish = fakePublish.bind(err);
        const publishOverride = sandbox.stub();
        publishOverride.callsFake(boundPublish);
        sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

        const retval = buildRustPayload(project as databaseTypes.IProject, properties);
        // @ts-ignore
        if (retval?.error) {
          // @ts-ignore
          assert.strictEqual(retval.error, saneError);
          assert.isTrue(publishOverride.calledOnce);
        } else {
          assert.fail();
        }
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an error when no project id provided', () => {
      try {
        // ts payload to be transformed
        const project = {
          id: '', // ! NO PROJECT ID !
          workspace: {
            id: 'workspaceId',
          },
          files: [
            {
              fileName: 'table1.csv',
              columns: [
                {name: 'col1', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING},
                {name: 'col2', fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE},
                {name: 'col3', fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER},
              ],
              tableName: 'table1',
            },
          ] as databaseTypes.IProject['files'],
          state: {
            properties: {
              X: {
                key: 'col1',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.X,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Y: {
                key: 'col2',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
                axis: webTypes.constants.AXIS.Y,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Z: {
                key: 'col3',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
                axis: webTypes.constants.AXIS.Z,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM,
                filter: {
                  min: 0,
                  max: 0,
                },
              },
              A: {
                key: 'col4',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.A,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              B: {
                key: 'col5',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.B,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              C: {
                key: 'col6',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.C,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
            } as databaseTypes.IProject['state']['properties'],
          },
        };

        // expected error
        const errMessage = 'No workspace id provided';
        const err = new error.InvalidArgumentError(errMessage, 'project', {});

        const properties = project.state.properties;

        function fakePublish() {
          //@ts-ignore
          assert.instanceOf(this, error.InvalidArgumentError);
          //@ts-ignore
          assert.strictEqual(this.message, errMessage);
        }

        const boundPublish = fakePublish.bind(err);
        const publishOverride = sandbox.stub();
        publishOverride.callsFake(boundPublish);
        sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

        const retval = buildRustPayload(project as unknown as databaseTypes.IProject, properties);
        // @ts-ignore
        if (retval?.error) {
          // @ts-ignore
          assert.strictEqual(retval.error, saneError);
          assert.isTrue(publishOverride.calledOnce);
        } else {
          assert.fail();
        }
      } catch (error) {
        assert.fail();
      }
    });
    it('should throw an error when no workspace id provided', () => {
      try {
        // ts payload to be transformed
        const project = {
          id: 'projectId',
          workspace: {
            id: '', // ! NO WORKSPACE ID !
          },
          files: [
            {
              fileName: 'table1.csv',
              columns: [
                {name: 'col1', fieldType: fileIngestionTypes.constants.FIELD_TYPE.STRING},
                {name: 'col2', fieldType: fileIngestionTypes.constants.FIELD_TYPE.DATE},
                {name: 'col3', fieldType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER},
              ],
              tableName: 'table1',
            },
          ] as databaseTypes.IProject['files'],
          state: {
            properties: {
              X: {
                key: 'col1',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.X,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Y: {
                key: 'col2',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.DATE,
                axis: webTypes.constants.AXIS.Y,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              Z: {
                key: 'col3',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.NUMBER,
                axis: webTypes.constants.AXIS.Z,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                accumulatorType: glyphEngineTypes.constants.ACCUMULATOR_TYPE.SUM,
                filter: {
                  min: 0,
                  max: 0,
                },
              },
              A: {
                key: 'col4',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.A,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              B: {
                key: 'col5',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.B,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
              C: {
                key: 'col6',
                dataType: fileIngestionTypes.constants.FIELD_TYPE.STRING,
                axis: webTypes.constants.AXIS.C,
                accepts: webTypes.constants.ACCEPTS.COLUMN_DRAG,
                interpolation: webTypes.constants.INTERPOLATION_TYPE.LIN,
                direction: webTypes.constants.DIRECTION_TYPE.DESC,
                filter: {
                  keywords: [],
                },
              },
            } as databaseTypes.IProject['state']['properties'],
          },
        };

        // expected error
        const errMessage = 'No workspace id provided';
        const err = new error.InvalidArgumentError(errMessage, 'project', {});

        const properties = project.state.properties;

        function fakePublish() {
          //@ts-ignore
          assert.instanceOf(this, error.InvalidArgumentError);
          //@ts-ignore
          assert.strictEqual(this.message, errMessage);
        }

        const boundPublish = fakePublish.bind(err);
        const publishOverride = sandbox.stub();
        publishOverride.callsFake(boundPublish);
        sandbox.replace(error.GlyphxError.prototype, 'publish', publishOverride);

        const retval = buildRustPayload(project as unknown as databaseTypes.IProject, properties);
        // @ts-ignore
        if (retval?.error) {
          // @ts-ignore
          assert.strictEqual(retval.error, saneError);
          assert.isTrue(publishOverride.calledOnce);
        } else {
          assert.fail();
        }
      } catch (error) {
        assert.fail();
      }
    });
  });
});
