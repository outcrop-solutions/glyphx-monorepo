'use server';
import ModuleLoader from '../utils/moduleLoader';
import {error, constants} from 'core';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, rustGlyphEngineTypes, webTypes} from 'types';
import {generateFilterQuery} from '../utils';

interface IBindings {
  exports: {
    glyph_engine: (args: rustGlyphEngineTypes.IGlyphEngineArgs) => Promise<rustGlyphEngineTypes.IGlyphEngineResults>;
    convertNeonValue: (value: any) => string;
    convertJsonValue: (value: string) => any;
    convertGlyphxErrorToJsonObject: () => any;
  };
}

let internalModule: IBindings = {exports: {}} as IBindings;

class Bindings extends ModuleLoader<IBindings> {
  constructor() {
    super('index.node', internalModule);
  }

  public async runGlyphEngine(
    args: rustGlyphEngineTypes.IGlyphEngineArgs
  ): Promise<rustGlyphEngineTypes.IGlyphEngineResults | error.ActionError> {
    let result: rustGlyphEngineTypes.IGlyphEngineResults;
    try {
      result = await internalModule.exports.glyph_engine(args);
    } catch (e) {
      let er = new error.ActionError(
        'An error occurred while running the glyph_engine.  See the inner error for additional information',
        'glyph_engine',
        args,
        e
      );
      er.publish(constants.ERROR_SEVERITY.ERROR);
      return er;
    }
    return result;
  }
  // public hello(): string {
  //   return internalModule.exports.hello();
  // }

  public convertNeonValue(value: any): string {
    return internalModule.exports.convertNeonValue(value);
  }

  public convertJsonValue(value: string): any {
    return internalModule.exports.convertJsonValue(value);
  }

  public convertGlyphxErrorToJsonObject(): any {
    return internalModule.exports.convertGlyphxErrorToJsonObject();
  }
}

const bindings: Bindings = new Bindings();

export async function runGlyphEngine(
  args: rustGlyphEngineTypes.IGlyphEngineArgs
): Promise<rustGlyphEngineTypes.IGlyphEngineResults | error.ActionError> {
  return bindings.runGlyphEngine(args);
}

// export async function hello() {
//   return bindings.hello();
// }

export async function convertNeonValue(value: any): Promise<string> {
  return bindings.convertNeonValue(value);
}

export async function convertJsonValue(value: string): Promise<any> {
  return bindings.convertJsonValue(value);
}

export async function convertGlyphxError(): Promise<any> {
  return bindings.convertGlyphxErrorToJsonObject();
}

/**
 * Maps old fieldtype definition to string based version in rust types
 * only needed for X and Y for now
 */
export const getFieldType = (
  axis: webTypes.constants.AXIS,
  properties: databaseTypes.IProject['state']['properties']
) => {
  if (properties[axis]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE) {
    return 'date';
  } else if (properties[axis]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.INTEGER) {
    return 'standard';
  }
};

/**
 * Builds the payload send to the rust glyphengine
 * @param project
 * @param properties
 */
export const buildRustPayload = (
  project: databaseTypes.IProject,
  properties: databaseTypes.IProject['state']['properties']
): rustGlyphEngineTypes.IGlyphEngineArgs | {error: string} => {
  try {
    const retval = {
      workspace_id: project.workspace.id as string,
      project_id: project.id as string,
      //Should be 'client' for non testing workloads
      output_file_prefix: 'client',
      data_table_name: '',
      model_hash: '',
      xAxis: {
        fieldDisplayName: properties[webTypes.constants.AXIS.X]['key'],
        fieldDataType: properties[webTypes.constants.AXIS.X][
          'dataType'
        ] as unknown as rustGlyphEngineTypes.constants.FieldDataType, //
        fieldDefinition: {
          fieldName: properties[webTypes.constants.AXIS.X]['key'],
          fieldType: getFieldType(webTypes.constants.AXIS.X, properties),
          dateGrouping:
            properties[webTypes.constants.AXIS.X]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
            !properties[webTypes.constants.AXIS.X]['dateGrouping']
              ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR // defaults to day of year if not presenty
              : properties[webTypes.constants.AXIS.X]['dateGrouping'], // only on fieldType = 'date'
        },
      },
      yAxis: {
        fieldDisplayName: properties[webTypes.constants.AXIS.Y]['key'],
        fieldDataType: properties[webTypes.constants.AXIS.Y]['dataType'],
        fieldDefinition: {
          fieldName: properties[webTypes.constants.AXIS.Y]['key'],
          fieldType: getFieldType(webTypes.constants.AXIS.Y, properties),
          dateGrouping:
            properties[webTypes.constants.AXIS.Y]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
            !properties[webTypes.constants.AXIS.Y]['dateGrouping']
              ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR // defaults to day of year if not presenty
              : properties[webTypes.constants.AXIS.Y]['dateGrouping'], // only on fieldType = 'date'
        },
      },
      zAxis: {
        fieldDisplayName: properties[webTypes.constants.AXIS.Z]['key'],
        fieldDataType: properties[webTypes.constants.AXIS.Z]['dataType'],
        fieldDefinition: {
          fieldName: properties[webTypes.constants.AXIS.Z]['key'],
          fieldType: 'accumulated',
          // should this be included in the  IAccumulatedFieldDefinition interface
          dateGrouping:
            properties[webTypes.constants.AXIS.Z]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE &&
            !properties[webTypes.constants.AXIS.Z]['dateGrouping']
              ? glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR // defaults to day of year if not presenty
              : properties[webTypes.constants.AXIS.Z]['dateGrouping'], // only on fieldType = 'date'
          accumulatorType: properties[webTypes.constants.AXIS.Z]['accumulatorType'],
        },
      },
      filter: generateFilterQuery(project),
    };

    // checks for validity of payload
    const isValid = checkRustGlyphEnginePayload(retval);
    if (isValid) {
      return retval as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;
    } else {
      throw new error.ActionError('Rust glyphengine payload is invalid', 'etl', {project, properties}, {});
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred running rust glyphengine',
      'etl',
      {project, properties},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Validates the rust payload throwing helpful errors if payload is malformed
 * TODO: [add validation on filter SQL query
 * @param payload
 * @returns
 */
const checkRustGlyphEnginePayload = (payload) => {
  try {
    let retval = true;

    if (!payload.workspace_id || typeof payload.workspace_id !== 'string') {
      throw new Error('invalid workspace id');
    }
    if (!payload.project_id || typeof payload.project_id !== 'string') {
      throw new Error('invalid workspace id');
    }
    if (!payload.output_file_prefix || typeof payload.output_file_prefix !== 'string') {
      throw new Error('invalid output file prefix');
    }
    if (!payload.data_table_name || typeof payload.data_table_name !== 'string') {
      throw new Error('invalid data table name');
    }
    if (!payload.model_hash || typeof payload.model_hash !== 'string') {
      throw new Error('invalid model hash');
    }

    // X, Y, & Z should be one of IStandardFieldDefinition | IDateFieldDefinition | IAccumulatedFieldDefinition
    const axisArray = Object.values(webTypes.constants.AXIS);
    for (const axis of axisArray.slice(0, 3)) {
      // TODO: we have duplicate field definition and axis types in rustglyphengine
      const prop = payload[`${axis.toLowerCase()}Axis`];

      // columns are not empty
      if (prop?.key === '' || prop?.key.includes('Column ')) {
        throw new Error('No empty columns are allowed in the glyphengine payload');
      }

      // if its a date, it has a dateGrouping
      if (prop.fieldDefinition.fieldType === 'date' && !prop.fieldDefinition.dateGrouping) {
        throw new Error('Date column has invalid date grouping');
      }
      // if its an accumulator (Z) it has the accumulatorType and field
      if (
        prop.fieldDefinition.fieldType === 'accumulated' &&
        (!prop.fieldDefinition.accumulatorType || !prop.fieldDefinition.accumulatedField)
      ) {
        throw new Error('Accumulated field has invalid accumulator type or field');
      }
    }

    return retval;
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred cheking the rust GlyphEngine payload',
      'etl',
      {payload},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};
