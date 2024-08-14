import fs from 'node:fs';
import readline from 'node:readline';
import stream from 'node:stream';

import 'mocha';
import commandLineArgs from 'command-line-args';
import {BasicCsvParser} from '../fileProcessing/basicCsvParser';
import {BasicFileTransformer} from '../fileProcessing/basicFileTransformer';
import {fileIngestionTypes} from 'types';
import {BasicFieldTypeCalculator} from '../fieldProcessing/basicFieldTypeCalculator';
import {BasicColumnNameCleaner} from '../fileProcessing/basicColumnNameCleaner';
import {BasicParquetProcessor} from '../fileProcessing/basicParquetProcessor';
import {FileReconciliator} from '../fileProcessing';
import {IFileInformation, IJoinTableColumnDefinition, IJoinTableDefinition} from '../interfaces/fileProcessing';

import {BasicHiveTableQueryPlanner, BasicHiveViewQueryPlanner, BasicJoinProcessor} from '../fileProcessing';
import {FILE_STORAGE_TYPES, COMPRESSION_TYPES} from '../util/constants';
const optionsArguments = [
  {name: 'outputDir', type: String, defaultValue: process.cwd() + '/' + new Date().toISOString(), alias: 'o'},
  {name: 'inputFiles', type: String, multiple: true, defaultOption: true},
  {name: 'inputDir', type: String, defaultValue: process.cwd(), alias: 'i'},
  {name: 'dumpCsv', type: Boolean, defaultValue: true},
  {name: 'dumpFileTransformer', type: Boolean, defaultValue: true},
  {name: 'dumpParquetData', type: Boolean, defaultValue: true},
  {name: 'dumpParquetFile', type: Boolean, defaultValue: true},
  {name: 'dumpAthenaQueries', type: Boolean, defaultValue: true},
];

interface IOptions {
  inputFiles: string[] | undefined;
  outputDir: string;
  inputDir: string;
  dumpCsv: boolean;
  dumpFileTransformer: boolean;
  dumpParquetData: boolean;
  dumpParquetFile: boolean;
  [key: string]: any;
}

async function getInputFiles(options: IOptions) {
  let rl = readline.promises.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const fileNames = await rl.question("Please provide input files: one or more seperated by a ';' : \n");
  let files = fileNames.split(';');
  let results = [];
  for (let file of files) {
    let f = file.trim();
    if (f.length > 0) {
      results.push(f);
    }
  }

  if (results.length > 0) {
    options.inputFiles = results;
  } else {
    console.log('No input files provided. Exiting...');
  }
}

async function processArgs(): Promise<IOptions> {
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

  if (!options.inputFiles || options.inputFiles.length === 0) {
    await getInputFiles(options);
  }

  return options;
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

async function getFileStream(file: string) {
  try {
    let inputFile = await fs.promises.open(file, 'r');
    return inputFile.createReadStream();
  } catch (err: any) {
    console.log(`An error occurred while opening the file: ${file}`);
    console.log(err);
    process.exit(1);
  }
}

function getParsedCsvStream(outputDir: string): stream.Transform {
  //This transform stream will write out the parsed csv to a file of json strings.
  // it allows us to see how the data is being parsed by the csv parser.
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).outStream = fs.createWriteStream(`${outputDir}/parsedCsv.json`);
      callback();
    },
    transform(chunk, encoding, callback) {
      let outString = JSON.stringify(chunk) + '\n';
      let outStream = (this as any).outStream as fs.WriteStream;

      // Check if write buffer is full
      if (outStream.write(outString)) {
        this.push(chunk);
        callback();
      } else {
        outStream.once('drain', () => {
          this.push(chunk);
          callback(); // Resume when the stream is ready
        });
      }
    },
  });
}

function getFileTransformer(): BasicFileTransformer {
  return new BasicFileTransformer(
    'thisFileFromATest',
    'thisIsTheOutputFileFromATest',
    'thisIsTheOutputDirectoryFromATest',
    'thisIsTheTableNameFromATest',
    fileIngestionTypes.constants.FILE_OPERATION.ADD,
    () => {},
    () => {},
    BasicFieldTypeCalculator,
    BasicColumnNameCleaner,
    0
  );
}
function dumpFileTransformerData(outputDir: string, data: any) {
  let outStream = fs.createWriteStream(`${outputDir}/fileTransformerData.json`);
  outStream.write(JSON.stringify(data, null, 99) + '\n', () => {
    outStream.end();
  });
}

function getParquetDataStream(outputDir: string): stream.Transform {
  //This transform stream will write out the parsed csv to a file of json strings.
  // it allows us to see how the data is being parsed by the csv parser.
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).schemaStream = fs.createWriteStream(`${outputDir}/parquetSchema.json`);
      (this as any).dataStream = fs.createWriteStream(`${outputDir}/parquetData.json`);
      (this as any).firstRead = true;
      callback();
    },
    transform(chunk, encoding, callback) {
      if ((this as any).firstRead) {
        let schema = JSON.stringify(chunk);
        let schemaStream = (this as any).schemaStream as fs.WriteStream;
        (this as any).firstRead = false;
        if (schemaStream.write(schema + '\n')) {
          this.push(chunk);
          callback();
        } else {
          schemaStream.once('drain', () => {
            this.push(chunk);
            callback(); // Resume when the stream is ready
          });
        }
      } else {
        let data = JSON.stringify(chunk);
        let dataStream = (this as any).dataStream as fs.WriteStream;
        if (dataStream.write(data + '\n')) {
          this.push(chunk);
          callback();
        } else {
          dataStream.once('drain', () => {
            this.push(chunk);
            callback(); // Resume when the stream is ready
          });
        }
      }
    },
  });
}

function getParquetFileStream(outputDir: string): stream.Transform {
  //This transform stream will write out the parsed csv to a file of json strings.
  // it allows us to see how the data is being parsed by the csv parser.
  return new stream.Transform({
    objectMode: true,
    construct(callback) {
      (this as any).dataStream = fs.createWriteStream(`${outputDir}/data.parquet`);
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

function getReconciledFileInformation(transformerData: IFileInformation) {
  let fileInfo: fileIngestionTypes.IFileInfo = {
    tableName: transformerData.tableName,
    fileName: transformerData.fileName,
    operation: fileIngestionTypes.constants.FILE_OPERATION.ADD,
    //Just an empty stream to build our object it won't be used
    fileStream: new stream.Readable({}),
  };

  const reconciledInformation = FileReconciliator.reconcileFileInformation(
    'testClientId',
    'testModelId',
    [fileInfo],
    [transformerData],
    []
  );
  return reconciledInformation;
}

function getViewQuery(joinProcessor: BasicJoinProcessor) {
  const viewPlanner = new BasicHiveViewQueryPlanner();
  let viewQuery = viewPlanner.defineView('viewDefinedFromTest', joinProcessor.joinData);
  return viewQuery;
}

function getTableQuery(joinData: IJoinTableDefinition) {
  const tablePlanner = new BasicHiveTableQueryPlanner(
    'testBucketName',
    FILE_STORAGE_TYPES.PARQUET,
    COMPRESSION_TYPES.GZIP
  );
  let tableQuery = tablePlanner.defineQuery(joinData.backingFileName, joinData.tableName, joinData);
  return tableQuery;
}

function cleanupJoinInformation(joinData: IJoinTableDefinition) {
  let newColumns: IJoinTableColumnDefinition[] = [];
  for (let column of joinData.columns) {
    newColumns.push({
      columnName: column.columnName,
      columnType: column.columnType,
      columnIndex: column.columnIndex,
      columnLength: column.columnLength,
      isJoinColumn: column.isJoinColumn,
      isSelectedColumn: column.isSelectedColumn,
    } as IJoinTableColumnDefinition);
  }
  joinData.columns = newColumns;
}

function getJoinData(fileInformation: IFileInformation) {
  const joinProcessor = new BasicJoinProcessor();
  joinProcessor.processColumns(fileInformation.tableName, fileInformation.outputFileDirecotry, fileInformation.columns);
  return joinProcessor;
}

function getAthenaInformation(transformerData: IFileInformation) {
  const reconciledInformation = getReconciledFileInformation(transformerData);

  const fileInformation = reconciledInformation.accumFiles[0];

  const joinProcessor = getJoinData(fileInformation);
  let joinData = joinProcessor.joinData[0];

  cleanupJoinInformation(joinData);

  let tableQuery = getTableQuery(joinData);

  let viewQuery = getViewQuery(joinProcessor);
  return {joinData, tableQuery, viewQuery};
}

function dumpAthenaQueries(outputDir: string, joinData: IJoinTableDefinition, tableQuery: string, viewQuery: string) {
  let outStream = fs.createWriteStream(`${outputDir}/athenaQueries.json`);
  let data = JSON.stringify(joinData, null, 2);

  let outString = `JoinInformation:
${data}

==========================================================================================================

 TableQuery:
${tableQuery}

 ========================================================================================================
  
 ViewQuery:
 ${viewQuery}`;

  outStream.write(outString + '\n', () => {
    outStream.end();
  });
}

async function processFiles(options: IOptions) {
  console.log(`Processing files.  Ouputs can be found in : ${options.outputDir}`);
  await setupParentOutputDirectory(options.outputDir);

  //this has been verified to exist upstream
  let files = options.inputFiles as string[];
  for (let file of files) {
    let outputDir = files.length > 1 ? `${options.outputDir}/${file}` : options.outputDir;
    console.log(`processing file: ${options.inputDir}/${file} to ${outputDir} \n`);
    if (files.length > 1) {
      await setupParentOutputDirectory(outputDir);
    }
    let streamArray: Array<stream.Writable | stream.Readable | stream.Transform> = [];
    streamArray.push(await getFileStream(`${options.inputDir}/${file}`));
    streamArray.push(new BasicCsvParser({}));
    if (options.dumpCsv) {
      streamArray.push(getParsedCsvStream(outputDir));
    }
    const fileTransformer = getFileTransformer();
    streamArray.push(fileTransformer);

    if (options.dumpParquetData) {
      streamArray.push(getParquetDataStream(outputDir));
    }

    streamArray.push(new BasicParquetProcessor());
    if (options.dumpParquetFile) {
      streamArray.push(getParquetFileStream(outputDir));
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

    const transformerData = fileTransformer.getDataForCallback();
    if (options.dumpFileTransformer) {
      dumpFileTransformerData(outputDir, transformerData);
    }

    let {joinData, tableQuery, viewQuery} = getAthenaInformation(transformerData);
    if (options.dumpAthenaQueries) {
      dumpAthenaQueries(outputDir, joinData, tableQuery, viewQuery);
    }
  }
}

describe('fileIngestionTester', () => {
  it('should parse the file', async () => {
    const options = await processArgs();
    console.log(`ingestor is running with args: ${JSON.stringify(options)}`);
    let result = await processFiles(options);
  });
});
