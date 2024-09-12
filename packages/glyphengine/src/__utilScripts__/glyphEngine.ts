import fs from 'node:fs';
import readline from 'node:readline';
import stream from 'node:stream';

import 'mocha';
import commandLineArgs from 'command-line-args';
import {select, input, rawlist, Separator} from '@inquirer/prompts';

import {Initializer, projectService} from 'business';
import {BasicColumnNameCleaner} from 'fileingestion';
import {webTypes, fileIngestionTypes, databaseTypes, glyphEngineTypes} from 'types';
import {GlyphEngine} from '../glyphEngine';
import {SdtParser} from '../io/sdtParser';
import {GlyphStream} from '../io/glyphStream';
import {SgcStream} from 'io/sgcStream';
import {SgnStream} from 'io/sgnStream';
import {QUERY_STATUS} from '../constants/queryStatus';
import {s3Connection, athenaConnection} from 'business';
import {DATE_GROUPING, ACCUMULATOR_TYPE} from 'types/src/glyphEngine/constants';
import {streams} from 'core';
const optionsArguments = [
  {name: 'outputDir', type: String, defaultValue: process.cwd() + '/' + new Date().toISOString(), alias: 'o'},
  {name: 'env', type: String, defaultValue: 'prod', alias: 'e'},
  {name: 'projectId', type: String, alias: 'p'},
  {name: 'dumpSdtTemplate', type: Boolean, defaultValue: true},
  {name: 'dumpColumns', type: Boolean, defaultValue: true},
  {name: 'dumpInputFields', type: Boolean, defaultValue: true},
  {name: 'dumpQueries', type: Boolean, defaultValue: true},
  {name: 'dumpRawData', type: Boolean, defaultValue: true},
  {name: 'dumpGlyphs', type: Boolean, defaultValue: true},
  {name: 'dumpSgc', type: Boolean, defaultValue: true},
  {name: 'dumpSgn', type: Boolean, defaultValue: true},
];

interface IOptions {
  outputDir: string;
  env: string;
  projectId: string | undefined;
  dumpSdtTemplate: boolean;
  dumpColumns: boolean;
  dumpInputFields: boolean;
  dumpQueries: boolean;
  dumpRawData: boolean;
  dumpGlyphs: boolean;
  dumpSgc: boolean;
  dumpSgn: boolean;
}

//NOTE: these functions to generate the filter were taken from the actions package.  I could have pulled them out into core, but there is a dependency on filingestion which would cause a circular dependencyt. For now, I am just going to make a copy here.
/**
 * Generates a query segment from a column name and state property
 * @param name
 * @param prop
 * @returns
 */
export const generateSegment = (name: string, prop: webTypes.Property) => {
  switch (prop.dataType) {
    case fileIngestionTypes.constants.FIELD_TYPE.NUMBER:
      const {min, max} = prop.filter as unknown as webTypes.INumbericFilter;
      if (min === 0 && max === 0) {
        return '';
      } else {
        return `${name || '-'} BETWEEN ${min} AND ${max}`;
      }
    case fileIngestionTypes.constants.FIELD_TYPE.STRING:
      const {keywords} = prop.filter as unknown as webTypes.IStringFilter;
      if (keywords && keywords.length === 0) {
        return '';
      } else {
        const formatted = keywords
          .map((word) => {
            if (typeof word === 'string') {
              return `'${word}'`;
            } else {
              Object.values(word).join('');
            }
          })
          .filter((val) => typeof val !== 'undefined');

        if (formatted.length > 0) {
          return `${name || '-'} IN (${formatted.join(',')})`;
        } else {
          return '';
        }
      }
    // TODO: fileIngestionTypes.constants.FIELD_TYPE.DATE
    default:
      return '';
  }
};

/**
 * Generatesthe filter segment of a Query
 * @param prop
 * @returns
 */
export const generateFilter = (prop: webTypes.Property) => {
  const cleaner = new BasicColumnNameCleaner();
  const name = cleaner.cleanColumnName(prop.key);
  return generateSegment(name, prop);
};

export const generateFilterQuery = (properties: databaseTypes.IProject['state']['properties']) => {
  const axes = Object.values(webTypes.constants.AXIS);

  const segments: string[] = [];

  for (const axis of axes) {
    const segment = generateFilter(properties[axis]);
    segments.push(segment);
  }

  return segments
    .filter((val) => val !== '')
    .join(' AND ')
    .trimEnd();
};

//NOTE: end of filter genration copy
async function lookupProject(options: IOptions): Promise<databaseTypes.IProject | undefined> {
  const Fuse = require('fuse.js');
  const fuseOptions = {
    keys: ['id', 'name', 'description', 'tags', 'workspace.name'],
  };

  let projects = await projectService.getProjects({
    page: 0,
    pageSize: 10000,
    deletedAt: null,
    'state.properties': {$exists: true},
    //@ts-ignore
    viewName: {$exists: true, $ne: ' ', $ne: ''},
    isTemplate: false,
    workspace: {$ne: null},
  });

  console.clear();
  projects =
    projects?.filter((project) => {
      if (!project.viewName || !project.workspace) {
        return false;
      } else {
        if (project.viewName.trim() === '') {
          return false;
        } else {
          return true;
        }
      }
    }) ?? [];
  const pageSize = 15;

  let fuse = new Fuse(projects, fuseOptions);
  let page = 0;
  let filter = '';
  let selectedValue = null;
  while (!selectedValue) {
    let filteredValues = fuse.search(filter)?.map((value) => value.item);
    if (!filteredValues.length) {
      filteredValues = projects;
    }
    //@ts-ignore
    const choices: any[] = filteredValues.map((value, index) => {
      return {
        name: `Id: ${value.id} Name: ${value.name} Description: ${value.description} Workspace: ${value.workspace.name}`,
        value: value.id,
      };
    });

    choices.unshift(new Separator());
    choices.unshift({name: 'Quit - (q)', value: 'quit', key: 'q'});
    choices.unshift({name: 'Clear Filter - (c)', value: 'clear_filter', key: 'c'});
    choices.unshift({name: 'Filter - (f)', value: 'filter', key: 'f'});
    choices.unshift(new Separator());
    //choices.push({name: 'More', value: 'more', key: 'm'});

    const answer = await select({
      message: 'Select the project',
      choices,
      pageSize,
      loop: false,
    });
    if (answer === 'more') {
      page++;
    } else if (answer === 'filter') {
      filter = await input({message: 'Enter the filter'});
    } else if (answer === 'clear_filter') {
      filter = '';
    } else if (answer === 'quit') {
      console.log('I am sorry that you feel that way.  Goodbye.');
      process.exit(0);
    } else {
      let project = projects.find((project) => project.id === answer) as databaseTypes.IProject;
      console.log(
        `You selected the project: Id: ${project.id} Name: ${project.name} Description: ${project.description}`
      );
      return project;
    }
  }
}

async function processArgs(): Promise<{options: IOptions; project: databaseTypes.IProject}> {
  let args = process.argv.slice(2);
  let file_name = __filename;
  let pos = file_name.lastIndexOf('/');
  let trunc_file_name = file_name.substring(pos + 1);

  let i = 0;
  for (; i < args.length; i++) {
    if (args[i].endsWith(trunc_file_name)) {
      break;
    }
  }

  args = args.slice(i + 1);

  let options: IOptions = commandLineArgs(optionsArguments, {argv: args}) as IOptions;
  let project: databaseTypes.IProject;
  if (!options.projectId) {
    project = (await lookupProject(options)) as databaseTypes.IProject;
    options.projectId = project.id;
  } else {
    project = (await projectService.getProject(options.projectId)) as databaseTypes.IProject;
    if (!project) {
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
      // @ts-ignore
      // return {options, project};
      console.log(`The project with id ${options.projectId} was not found.`);

      process.exit(1);
    }
    if (!project.state.properties) {
      console.log(
        `The project with id ${options.projectId} does not have any state properties and cannot be run through the glyph engine.`
      );
      process.exit(1);
    }
  }

  return {options, project};
}

async function doesDirectoryExist(dir: string): Promise<boolean> {
  try {
    let stats = await fs.promises.stat(dir);
    if (!stats.isDirectory()) {
      console.log(`The path provided exists but it is not a directory: ${dir}`);
      process.exit(1);
    } else {
      return true;
    }
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      return false;
    } else {
      console.log(`An error occurred while checking for the existence of the directory: ${dir}`);
      console.log(err);
      process.exit(1);
    }
  }
}

async function createDirectory(dir: string) {
  try {
    await fs.promises.mkdir(dir);
  } catch (err: any) {
    console.log(`An error occurred while creating the directory: ${dir}`);
    console.log(err);
    process.exit(1);
  }
}

async function setupParentOutputDirectory(outputDir: string) {
  if (!(await doesDirectoryExist(outputDir))) {
    createDirectory(outputDir);
  } else {
    try {
      await fs.promises.access(outputDir, fs.constants.W_OK | fs.constants.R_OK);
    } catch (err) {
      console.log(`The output directory: ${outputDir} exists but it is not readable or writable`);
      console.log(err);
      process.exit(1);
    }
  }
}
function getArgsMap(project: databaseTypes.IProject): Map<string, string> {
  const data = new Map<string, string>();
  data.set('model_id', project.id as string);
  data.set('client_id', project.workspace.id as string);
  data.set('payload_hash', 'payloadHashFromTest');
  data.set('view_name', project.viewName as string);
  data.set('x_axis', project.state.properties.X.key as string);
  data.set('x_func', project.state.properties.X.interpolation as string);
  data.set('x_direction', project.state.properties.X.direction as string);
  data.set(
    'x_date_grouping',
    (project.state.properties.X.dateGrouping as string) ??
      glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
  );
  data.set('y_axis', project.state.properties.Y.key as string);
  data.set('y_func', project.state.properties.Y.interpolation as string);
  data.set('y_direction', project.state.properties.Y.direction as string);
  data.set(
    'y_date_grouping',
    (project.state.properties.Y.dateGrouping as string) ??
      glyphEngineTypes.constants.DATE_GROUPING.QUALIFIED_DAY_OF_YEAR
  );
  data.set('z_axis', project.state.properties.Z.key as string);
  data.set('z_func', project.state.properties.Z.interpolation as string);
  data.set('z_direction', project.state.properties.Z.direction as string);
  data.set('accumulatorType', project.state.properties.Z.accumulatorType as string);
  data.set('filter', generateFilterQuery(project.state.properties));
  return data;
}
async function buildGlyphEngine(project: databaseTypes.IProject, inputArgs: Map<string, string>) {
  const glyphEngine = new GlyphEngine(
    s3Connection.s3Manager,
    s3Connection.s3Manager,
    athenaConnection.connection,
    'aProcessIdFromATest'
  );
  await glyphEngine.init();
  //@ts-ignore
  await glyphEngine.getDataTypes(project.viewName as string, inputArgs);
  return glyphEngine;
}

async function processSdtTemplate(glyphEngine: GlyphEngine, inputArgs: Map<string, string>, options: IOptions) {
  //@ts-ignore
  let template = await glyphEngine.getTemplateAsString();
  template = glyphEngine.updateSdt(template, inputArgs);
  if (options.dumpSdtTemplate) {
    fs.writeFileSync(options.outputDir + '/file.sdt', template, {flag: 'w'});
  }
  return template;
}

function processColumns(glyphEngine: GlyphEngine, inputArgs: Map<string, string>, options: IOptions) {
  const {xCol, yCol, zCol, isXDate, xDateGrouping, isYDate, yDateGrouping, isZDate, zColName, zAccumulatorType} =
    //@ts-ignore
    glyphEngine.formatCols(inputArgs);
  if (options.dumpColumns) {
    fs.writeFileSync(
      options.outputDir + '/dataDefinitions.json',
      JSON.stringify(
        {
          xCol,
          yCol,
          zCol,
          isXDate,
          xDateGrouping,
          isYDate,
          yDateGrouping,
          isZDate,
          zColName,
          zAccumulatorType,
        },
        null,
        2
      ),
      {flag: 'w'}
    );
  }
  return {xCol, yCol, zCol, isXDate, xDateGrouping, isYDate, yDateGrouping, isZDate, zColName, zAccumulatorType};
}

function getInputFieldsData(axis: 'x' | 'y' | 'z', sdtParser: SdtParser) {
  let retval: any = {};
  let inputField = sdtParser.getInputFields()[axis];
  retval['name'] = inputField.name;
  retval['field'] = inputField.field;
  retval['min'] = inputField.min;
  retval['max'] = inputField.max;
  if (inputField.text_to_num) {
    let values: any[] = [];
    // @ts-ignore
    for (const [key, value] of inputField.text_to_num.convertedFields) {
      values.push({key, value});
    }
    retval['text_to_num'] = values;
  }
  return retval;
}

function dumpInputFields(sdtParser: SdtParser, options: IOptions) {
  const values = {
    x: getInputFieldsData('x', sdtParser),
    y: getInputFieldsData('y', sdtParser),
    z: getInputFieldsData('z', sdtParser),
  };
  fs.writeFileSync(options.outputDir + '/inputFields.json', JSON.stringify(values, null, 2), {flag: 'w'});
}

async function buildSdtParser(
  isXDate: boolean,
  xDateGrouping: DATE_GROUPING,
  isYDate: boolean,
  yDateGrouping: DATE_GROUPING,
  isZDate: boolean,
  xCol: string,
  yCol: string,
  zCol: string,
  zColName: string,
  zAccumulatorType: ACCUMULATOR_TYPE,
  template: string,
  project: databaseTypes.IProject,
  inputArgs: Map<string, string>,
  options: IOptions
) {
  let sdtParser = new SdtParser(
    isXDate,
    xDateGrouping,
    isYDate,
    yDateGrouping,
    isZDate,
    xCol,
    yCol,
    zCol,
    zColName,
    zAccumulatorType
  );

  sdtParser = await sdtParser.parseSdtString(
    template,
    project.viewName as string,
    inputArgs,
    athenaConnection.connection
  );
  if (options.dumpInputFields) {
    dumpInputFields(sdtParser, options);
  }
  return sdtParser;
}

async function processGlyphEngineOperations(
  project: databaseTypes.IProject,
  inputArgs: Map<string, string>,
  options: IOptions
): Promise<{glyphEngine: GlyphEngine; sdtParser: SdtParser}> {
  const glyphEngine = await buildGlyphEngine(project, inputArgs);
  //@ts-ignore
  await glyphEngine.startQuery(inputArgs, project.viewName as string);
  //@ts-ignore
  let template = await processSdtTemplate(glyphEngine, inputArgs, options);
  const {xCol, yCol, zCol, isXDate, xDateGrouping, isYDate, yDateGrouping, isZDate, zColName, zAccumulatorType} =
    processColumns(glyphEngine, inputArgs, options);

  let sdtParser = await buildSdtParser(
    isXDate,
    xDateGrouping,
    isYDate,
    yDateGrouping,
    isZDate,
    xCol,
    yCol,
    zCol,
    zColName,
    zAccumulatorType,
    template,
    project,
    inputArgs,
    options
  );

  //@ts-ignore
  const status = await glyphEngine.getQueryResponse();
  if (status.status === QUERY_STATUS.FAILED) {
    console.log(`The query failed with the following error: ${status.error}`);
    process.exit(1);
  }
  return {glyphEngine, sdtParser};
}

function dumpQueries(glyphEngine: GlyphEngine, sdtParser: SdtParser, options: IOptions) {
  //@ts-ignore
  let dataQuery = glyphEngine.query;
  //@ts-ignore
  let minMaxQuery = sdtParser.minMaxCalculator.query;

  let output = `
Data Query: 
${dataQuery}

==================================================================

MinMax Query:
${minMaxQuery}

`;

  fs.writeFileSync(options.outputDir + '/queries.sql', output, {
    flag: 'w',
  });
}

function createRawDataStream(outputDir: string): stream.Transform {
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).dataStream = fs.createWriteStream(`${outputDir}/rawdata.json`);
      callback();
    },

    transform(chunk, encoding, callback) {
      let dataStream = (this as any).dataStream as fs.WriteStream;
      if (dataStream.write(JSON.stringify(chunk, null, 2) + '\n')) {
        this.push(chunk);
        callback();
      } else {
        dataStream.once('drain', () => {
          this.push(chunk);
          callback(); // Resume when the stream is ready
        });
      }
    },
  });
}

function createGlyphDumpStream(outputDir: string): stream.Transform {
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).dataStream = fs.createWriteStream(`${outputDir}/glyphs.json`);
      callback();
    },

    transform(chunk, encoding, callback) {
      let dataStream = (this as any).dataStream as fs.WriteStream;
      if (dataStream.write(JSON.stringify(chunk, null, 2) + '\n')) {
        this.push(chunk);
        callback();
      } else {
        dataStream.once('drain', () => {
          this.push(chunk);
          callback(); // Resume when the stream is ready
        });
      }
    },
  });
}

function createSgcDumpStream(outputDir: string): stream.Transform {
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).dataStream = fs.createWriteStream(`${outputDir}/output.sgc`);
      callback();
    },

    transform(chunk, encoding, callback) {
      let dataStream = (this as any).dataStream as fs.WriteStream;
      if (chunk) {
        this.push(dataStream.write(chunk));
        callback();
      } else {
        dataStream.once('drain', () => {
          this.push(chunk);
          callback(); // Resume when the stream is ready
        });
      }
    },
  });
}

function createSgnDumpStream(outputDir: string): stream.Transform {
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).dataStream = fs.createWriteStream(`${outputDir}/output.sgn`);
      callback();
    },

    transform(chunk, encoding, callback) {
      let dataStream = (this as any).dataStream as fs.WriteStream;
      if (dataStream.write(chunk)) {
        this.push(chunk);
        callback();
      } else {
        dataStream.once('drain', () => {
          this.push(chunk);
          callback(); // Resume when the stream is ready
        });
      }
    },
  });
}
async function processData(options: IOptions, project: databaseTypes.IProject) {
  await setupParentOutputDirectory(options.outputDir);
  const inputArgs: Map<string, string> = getArgsMap(project);
  var {glyphEngine, sdtParser} = await processGlyphEngineOperations(project, inputArgs, options);
  if (options.dumpQueries) {
    dumpQueries(glyphEngine, sdtParser, options);
  }
  let streamArray: Array<stream.Writable | stream.Readable | stream.Transform> = [];

  //@ts-ignore
  streamArray.push(new streams.AthenaQueryReadStream(athenaConnection.connection, glyphEngine.queryId as string, 1000));

  if (options.dumpRawData) {
    streamArray.push(createRawDataStream(options.outputDir));
  }

  streamArray.push(new GlyphStream(sdtParser));
  if (options.dumpGlyphs) {
    streamArray.push(createGlyphDumpStream(options.outputDir));
  }

  streamArray.push(new SgcStream());

  if (options.dumpSgc) {
    streamArray.push(createSgcDumpStream(options.outputDir));
  }

  streamArray.push(new SgnStream());
  if (options.dumpSgn) {
    streamArray.push(createSgnDumpStream(options.outputDir));
  }

  //NOTE: the last stream in the pipeline must be a writable stream
  streamArray.push(
    new stream.Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        callback();
      },
    })
  );

  const pipeline = stream.promises.pipeline(streamArray);
  await pipeline;
}

describe('glyphengineTester', () => {
  it('should parse the file', async () => {
    await Initializer.init();
    const {options, project} = await processArgs();
    console.log(`glyphengine is running with args: ${JSON.stringify(options)}`);

    await processData(options, project);
  });
});
