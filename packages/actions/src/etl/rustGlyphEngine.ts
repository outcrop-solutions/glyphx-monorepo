'use server';
import ModuleLoader from '../utils/moduleLoader';
import {error, constants} from 'core';
import {databaseTypes, fileIngestionTypes, glyphEngineTypes, rustGlyphEngineTypes, webTypes} from 'types';
import {generalPurposeFunctions as sharedFunctions} from 'core';
import {hashFileSystem, hashPayload} from 'business/src/util/hashFunctions';
import {s3Connection} from '../../../business/src/lib';
import {generateFilterQuery} from '../utils/generateFilterQuery';

// WASM BINDINGS SETUP
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
      // TODO: parse error as JSON?
      let er = new error.ActionError(
        'An error occurred while running the glyph_engine. See the inner error for additional information',
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

export async function convertNeonValue(value: any): Promise<string> {
  return bindings.convertNeonValue(value);
}

export async function convertJsonValue(value: string): Promise<any> {
  return bindings.convertJsonValue(value);
}

export async function convertGlyphxError(): Promise<any> {
  return bindings.convertGlyphxErrorToJsonObject();
}

// ACTION CODE
/**
 * Main entrypoint to the rust based glyph engine
 * @param project
 * @param properties
 * @returns
 */
export async function runGlyphEngineAction(
  project: databaseTypes.IProject,
  properties: databaseTypes.IProject['state']['properties']
) {
  try {
    // validate input
    if (typeof project?.workspace?.id !== 'string' || project?.workspace?.id?.length === 0) {
      throw new error.InvalidArgumentError('No workspace id provided', 'project.workspace.id', project);
    }
    if (typeof project?.id !== 'string' || project?.workspace?.id?.length === 0) {
      throw new error.InvalidArgumentError('No project id provided', 'project.id', project);
    }
    if (project.files.length === 0) {
      console.log('3');
      throw new error.InvalidArgumentError(
        'No files present, upload a file and drop columns before running glyph engine',
        'project',
        project
      );
    }

    const workspaceId = project.workspace.id;
    const projectId = project.id;
    const payloadHash = hashPayload(hashFileSystem(project.files), project);
    const payload = buildRustPayload(project, properties);

    const result = await runGlyphEngine(payload);
    if (result) {
      // TODO: handle error here
      return await signRustFiles(workspaceId, projectId, payloadHash);
    }
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred running the rust glyphengine',
      'etl',
      {project, properties},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
}

/**
 * Builds the payload sent to the rust glyphengine
 * (we check the params in the calling function once)
 * @param project
 * @param properties
 */
export const buildRustPayload = (
  project: databaseTypes.IProject,
  properties: databaseTypes.IProject['state']['properties']
): rustGlyphEngineTypes.IGlyphEngineArgs => {
  try {
    // we assume that the values exist and then check the payload once it's formed
    // we could also do the reverse and consolidate the above conditional into the check performed before submitting the payload to the wasm module
    const fullTableName = sharedFunctions.fileIngestion.getFullTableName(
      project?.workspace?.id as string,
      project?.id as string,
      project?.files[0].tableName as string
    );
    const payloadHash = hashPayload(hashFileSystem(project.files), project);

    // This is done so that we don't erroneously include undefined dateGrouping members in non date field definitions
    const xDateGrouping =
      properties[webTypes.constants.AXIS.X]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE
        ? {
            dateGrouping:
              properties[webTypes.constants.AXIS.X]['dateGrouping'] ||
              glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR, // defaults to day of year if not present
          }
        : {};
    const yDateGrouping =
      properties[webTypes.constants.AXIS.Y]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE
        ? {
            dateGrouping:
              properties[webTypes.constants.AXIS.Y]['dateGrouping'] ||
              glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR, // defaults to day of year if not present
          }
        : {};
    const zDateGrouping =
      properties[webTypes.constants.AXIS.Z]['dataType'] === fileIngestionTypes.constants.FIELD_TYPE.DATE
        ? {
            dateGrouping:
              properties[webTypes.constants.AXIS.Z]['dateGrouping'] ||
              glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR, // defaults to day of year if not present
          }
        : {};

    // build payload
    const retval = {
      workspace_id: project.workspace.id as string,
      project_id: project.id as string,
      //Should be 'client' for non testing workloads
      output_file_prefix: 'client',
      data_table_name: fullTableName,
      model_hash: payloadHash,
      xAxis: {
        fieldDisplayName: properties[webTypes.constants.AXIS.X]['key'],
        fieldDataType: getModelDataType(properties[webTypes.constants.AXIS.X]['dataType']), //
        fieldDefinition: {
          fieldName: properties[webTypes.constants.AXIS.X]['key'],
          fieldType: getFieldType(webTypes.constants.AXIS.X, properties),
          ...xDateGrouping,
        },
      },
      yAxis: {
        fieldDisplayName: properties[webTypes.constants.AXIS.Y]['key'],
        fieldDataType: getModelDataType(properties[webTypes.constants.AXIS.Y]['dataType']),
        fieldDefinition: {
          fieldName: properties[webTypes.constants.AXIS.Y]['key'],
          fieldType: getFieldType(webTypes.constants.AXIS.Y, properties),
          ...yDateGrouping,
        },
      },
      zAxis: {
        fieldDisplayName: properties[webTypes.constants.AXIS.Z]['key'],
        fieldDataType: getModelDataType(properties[webTypes.constants.AXIS.Z]['dataType']),
        fieldDefinition: {
          // fieldName: properties[webTypes.constants.AXIS.Z]['key'],
          fieldType: 'accumulated',
          accumulatedFieldDefinition: {
            // this is different in the types!
            fieldName: properties[webTypes.constants.AXIS.Z]['key'], // TODO: @jp-burford do accumulated field definitions not ahve field names?
            fieldType: getFieldType(webTypes.constants.AXIS.Z, properties),
            // should this be included in the  IAccumulatedFieldDefinition interface
            ...zDateGrouping,
          },
          accumulator: properties[webTypes.constants.AXIS.Z]['accumulatorType']?.toLowerCase() || 'sum', // convert between accumulatorType casing in rust glyphengine
          // accumulatorType: properties[webTypes.constants.AXIS.Z]['accumulatorType']?.toLowerCase() || 'sum', // convert between accumulatorType casing in rust glyphengine
        },
      },
      // filter: generateFilterQuery(project),
    };

    // checks for validity of naively created payload before returning
    const isValid = checkRustGlyphEnginePayload(retval as unknown as rustGlyphEngineTypes.IGlyphEngineArgs);

    if (isValid) {
      return retval as unknown as rustGlyphEngineTypes.IGlyphEngineArgs;
    } else {
      throw new error.ActionError('Rust glyphengine payload is invalid', 'etl', {project, properties}, {});
    }
  } catch (err) {
    throw new error.ActionError(
      'An unexpected error occurred building the rust glyphengine payload',
      'etl',
      {project, properties},
      err
    );
  }
};

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
  } else {
    return 'standard';
  }
};

/**
 * Converts dates to numbers for model
 * Model casts date fields to a numeric value
 * @param ogType
 * @returns
 */
export const getModelDataType = (ogType: fileIngestionTypes.constants.FIELD_TYPE) => {
  if (ogType === fileIngestionTypes.constants.FIELD_TYPE.DATE) {
    return 0;
  } else {
    return ogType;
  }
};

/**
 * Validates the rust payload throwing helpful errors if payload is malformed
 * TODO: [add validation on filter SQL query]
 * @param payload
 * @returns
 */
export const checkRustGlyphEnginePayload = (payload: rustGlyphEngineTypes.IGlyphEngineArgs) => {
  try {
    let retval = true;

    if (!payload.workspace_id || typeof payload.workspace_id !== 'string') {
      throw new error.InvalidArgumentError('invalid workspace id', 'workspace_id', payload.workspace_id);
    }
    if (!payload.project_id || typeof payload.project_id !== 'string') {
      throw new error.InvalidArgumentError('invalid project id', 'project_id', payload.project_id);
    }
    if (!payload.output_file_prefix || typeof payload.output_file_prefix !== 'string') {
      throw new error.InvalidArgumentError(
        'invalid output file prefix',
        'output_file_prefix',
        payload.output_file_prefix
      );
    }
    if (!payload.data_table_name || typeof payload.data_table_name !== 'string') {
      throw new error.InvalidArgumentError('invalid data table name', 'data_table_name', payload.data_table_name);
    }
    if (!payload.model_hash || typeof payload.model_hash !== 'string') {
      throw new error.InvalidArgumentError('invalid model hash', 'model_hash', payload.model_hash);
    }

    // X, Y, & Z should be one of IStandardFieldDefinition | IDateFieldDefinition | IAccumulatedFieldDefinition
    const axisArray = Object.values(webTypes.constants.AXIS);
    for (const axis of axisArray.slice(0, 3)) {
      const axisDefinition = payload[`${axis.toLowerCase()}Axis`];

      // if not an accumulator (X or Y) check columns are not empty
      if (
        axisDefinition.fieldDefinition.fieldType !== 'accumulated' &&
        (axisDefinition?.fieldDefinition?.fieldName === '' ||
          axisDefinition?.fieldDefinition?.fieldName.includes('Column '))
      ) {
        throw new error.InvalidArgumentError(
          'No empty columns are allowed in the glyphengine payload',
          axis,
          axisDefinition
        );
      }

      // if its a date, it has a dateGrouping
      if (axisDefinition.fieldDefinition.fieldType === 'date' && !axisDefinition.fieldDefinition.dateGrouping) {
        throw new error.InvalidArgumentError('Date column has invalid date grouping', axis, axisDefinition);
      }
      // if its an accumulator (Z) it has the accumulatorType and field
      if (
        axisDefinition.fieldDefinition.fieldType === 'accumulated' &&
        (!axisDefinition.fieldDefinition.accumulator || !axisDefinition.fieldDefinition.accumulatedField)
      ) {
        throw new error.InvalidArgumentError(
          'Accumulated field has invalid accumulator type or field',
          axis,
          axisDefinition
        );
      }
    }

    return retval;
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred checking the rust GlyphEngine payload',
      'etl',
      {payload},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    return {error: e.message};
  }
};

/**
 * Gets the signed urls to download from s3
 * @param workspaceId
 * @param projectId
 * @param payloadHash
 * @returns
 */
export const signRustFiles = async (
  workspaceId: string,
  projectId: string,
  payloadHash: string
): Promise<{STS_URL: string; GLY_URL: string; X_VEC: string; Y_VEC: string}> => {
  try {
    // init S3 client
    await s3Connection.init();
    const s3Manager = s3Connection.s3Manager;

    const urls = [
      `client/${workspaceId}/${projectId}/output/${payloadHash}-x-axis.vec`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}-y-axis.vec`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}.gly`,
      `client/${workspaceId}/${projectId}/output/${payloadHash}.sts`,
    ];
    // Create an array of promises
    const promises = urls.map((url) => s3Manager.getSignedDataUrlPromise(url));
    // Use Promise.all to fetch all URLs concurrently
    const signedUrls = await Promise.all(promises);

    const stsUrl = signedUrls.find((u: string) => u.includes('.sts'));
    const glyUrl = signedUrls.find((u: string) => u.includes('.gly'));
    const xVec = signedUrls.filter((u: string) => u.includes('x-axis.vec'))[0];
    const yVec = signedUrls.filter((u: string) => u.includes('y-axis.vec'))[0];

    return {
      STS_URL: stsUrl,
      GLY_URL: glyUrl,
      X_VEC: xVec,
      Y_VEC: yVec,
    };
  } catch (err) {
    const e = new error.ActionError(
      'An unexpected error occurred signing rust vector urls',
      'etl',
      {workspaceId, projectId, payloadHash},
      err
    );
    e.publish('etl', constants.ERROR_SEVERITY.ERROR);
    // @ts-ignore
    return {error: e.message};
  }
};
// /**
//  * Ensures that when we add vectors that the data is complete and in correct format
//  * @param url
//  * @param axis
//  * @param modelRunner // dependency injected, not sure if this will work the way we want to
//  */
// export const handleVectorStream = async (url, axis, modelRunner) => {
//   try {
//     const response = await fetch(url);
//     if (response.body) {
//       const reader = response.body.getReader();
//       let buffer = new Uint8Array();

//       while (true) {
//         const {done, value} = await reader.read();
//         if (done) break;

//         // Concatenate new chunk to the buffer
//         buffer = new Uint8Array([...buffer, ...value]);

//         while (buffer.length >= 8) {
//           // Read the length of the next vector
//           const length = new DataView(buffer.buffer).getUint32(0, true);

//           // Check if we have the full vector in the buffer
//           if (buffer.length >= 8 + length) {
//             const vectorData = buffer.slice(8, 8 + length);

//             // Process the complete vector
//             await modelRunner.addVector(axis, vectorData);

//             // Remove processed vector from buffer
//             buffer = buffer.slice(8 + length);
//           } else {
//             // Not enough data to form the next vector, wait for more data
//             break;
//           }
//         }
//       }

//       // Final cleanup: process any remaining data if applicable
//       if (buffer.length > 0) {
//         // Handle any remaining bytes according to your application's needs
//         console.log('Unhandled remaining data:', buffer);
//       }
//     }
//   } catch (error) {}
// };
