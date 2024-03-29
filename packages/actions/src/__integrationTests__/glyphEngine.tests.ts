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
  it('should run glyph engine', async () => {
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
