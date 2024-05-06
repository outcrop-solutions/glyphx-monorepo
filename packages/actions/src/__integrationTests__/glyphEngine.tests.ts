import 'mocha';
import {assert} from 'chai';

import {runGlyphEngine} from '../etl/rustGlyphEngine';
import {rustGlyphEngineTypes} from 'types';
import {v4} from 'uuid';
import {s3Connection} from '../../../business/src/lib';

describe('GlyphEngine', () => {
  before(async () => {
    await s3Connection.init();
  });
  const workspaceId = v4().toString();
  const projectId = v4().toString();
  const modelHash = v4().toString();
  const tableName = 'glyphx_646fa59785272d19babc2af1_6483770b7fb04babe1412e04_view';
  const outputFilePrefix = 'test';

  let params = {
    workspace_id: workspaceId,
    project_id: projectId,
    data_table_name: tableName,
    output_file_prefix: outputFilePrefix,
    model_hash: modelHash,
    xAxis: {
      fieldDisplayName: 'vendor',
      fieldDataType: 1,
      fieldDefinition: {
        fieldType: 'standard',
        fieldName: 'vendor',
      },
    },
    yAxis: {
      fieldDisplayName: 'last_receipt_date',
      fieldDataType: 0,
      fieldDefinition: {
        fieldType: 'date',
        fieldName: 'last_receipt_date',
        dateGrouping: 'month_of_year',
      },
    },
    zAxis: {
      fieldDisplayName: 'delta',
      fieldDataType: 1,
      fieldDefinition: {
        fieldType: 'accumulated',
        accumulator: 'sum',
        accumulatedFieldDefinition: {
          fieldType: 'standard',
          fieldName: 'delta',
        },
      },
    },
    supportingFields: [],
  } as unknown as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

  // let params = {
  //   workspace_id: '646fa59785272d19babc2af1',
  //   project_id: '6622a797d7aeffcd949e9635',
  //   output_file_prefix: 'client',
  //   data_table_name: 'glyphx_646fa59785272d19babc2af1_6622a797d7aeffcd949e9635_high_z_small_range_test_case',
  //   model_hash: '7594f1436b9d53df280f4f94ecf02b83',
  //   xAxis: {
  //     fieldDisplayName: 'col1',
  //     fieldDataType: 0,
  //     fieldDefinition: {fieldName: 'col1', fieldType: 'standard'},
  //   },
  //   yAxis: {
  //     fieldDisplayName: 'col2',
  //     fieldDataType: 1,
  //     fieldDefinition: {fieldName: 'col2', fieldType: 'standard'},
  //   },
  //   zAxis: {
  //     fieldDisplayName: 'col3',
  //     fieldDataType: 0,
  //     fieldDefinition: {
  //       fieldType: 'accumulated',
  //       accumulatedFieldDefinition: {fieldName: 'col3', fieldType: 'standard'},
  //       accumulator: 'sum',
  //     },
  //   },
  //   // filter: '',
  // } as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;

  it.only('should run glyph engine', async () => {
    const result = (await runGlyphEngine(params)) as rustGlyphEngineTypes.IGlyphEngineResults;
    assert.isDefined(result);
    const s3_manager = s3Connection.s3Manager;
    assert(await s3_manager.fileExists(result.glyphs_file_name));
    assert(await s3_manager.fileExists(result.x_axis_vectors_file_name));
    assert(await s3_manager.fileExists(result.y_axis_vectors_file_name));
    assert(await s3_manager.fileExists(result.statistics_file_name));

    await s3_manager.removeObject(result.glyphs_file_name);
    await s3_manager.removeObject(result.x_axis_vectors_file_name);
    await s3_manager.removeObject(result.y_axis_vectors_file_name);
    await s3_manager.removeObject(result.statistics_file_name);

    assert(!(await s3_manager.fileExists(result.glyphs_file_name)));
    assert(!(await s3_manager.fileExists(result.x_axis_vectors_file_name)));
    assert(!(await s3_manager.fileExists(result.y_axis_vectors_file_name)));
    assert(!(await s3_manager.fileExists(result.statistics_file_name)));
  });
});
