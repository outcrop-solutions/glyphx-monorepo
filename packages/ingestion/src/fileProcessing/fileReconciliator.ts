import {IFileInformation} from '../interfaces/fileProcessing';
import {fileIngestionTypes} from 'types';
import {generalPurposeFunctions} from 'core';

export class FileReconciliator {
  private static getDeletedTables(fileInfo: fileIngestionTypes.IFileInfo[]) {
    return fileInfo
      .filter((d) => d.operation === fileIngestionTypes.constants.FILE_OPERATION.DELETE)
      .map((d) => d.tableName);
  }

  private static processProcessedFiles(
    fileInfo: fileIngestionTypes.IFileInfo[],
    processedFileInformation: IFileInformation[],
    fileStatistics: fileIngestionTypes.IFileStats[],
    fileInfos: IFileInformation[]
  ) {
    fileInfo.forEach((f) => {
      if (f.operation === fileIngestionTypes.constants.FILE_OPERATION.DELETE) return;
      const fileStats = processedFileInformation.find(
        (fi) => fi.tableName === f.tableName && fi.fileName === f.fileName
      ) as unknown as IFileInformation;
      //istanbul ignore else
      if (fileStats) fileInfos.push(fileStats);
    });
  }

  private static processSuppliedFiles(
    fileStatistics: fileIngestionTypes.IFileStats[],
    deletedTableNames: string[],
    fileInfos: IFileInformation[]
  ) {
    fileStatistics.forEach((f) => {
      const fInfo = f as unknown as IFileInformation;
      //we do not want any deleted tables
      if (deletedTableNames.find((d) => d === f.tableName)) return;
      if (
        !fileInfos.find(
          (fi) =>
            fi.tableName === f.tableName &&
            (fi.fileName === f.fileName || fi.fileOperationType === fileIngestionTypes.constants.FILE_OPERATION.REPLACE)
        )
      ) {
        //these are essentially no-ops for the Athena Proceser.  This will make sure that they are included in the view, but the table wwill not be regenerated.
        fInfo.fileOperationType = fileIngestionTypes.constants.FILE_OPERATION.APPEND;
        fileInfos.push(fInfo);
      }
    });
  }

  private static groupTables(fileInfos: IFileInformation[], clientId: string, modelId: string) {
    return fileInfos.reduce(
      (group, fileInfo) => {
        const {tableName} = fileInfo;
        const fullTableName = generalPurposeFunctions.fileIngestion.getFullTableName(clientId, modelId, tableName);
        group[fullTableName] = group[fullTableName] ?? [];
        group[fullTableName].push(fileInfo);
        return group;
      },
      {} as Record<string, IFileInformation[]>
    );
  }

  private static squashFilesToTables(clientId: string, modelId: string, fileInfos: IFileInformation[]) {
    const retval: IFileInformation[] = [];

    const groupedByTable = FileReconciliator.groupTables(fileInfos, clientId, modelId);

    for (const key in groupedByTable) {
      const mappedData = groupedByTable[key].reduce(
        (accum: IFileInformation, g: IFileInformation) => {
          accum.numberOfRows += g.numberOfRows;
          accum.fileSize += g.fileSize;
          if (accum.numberOfColumns === 0 || g.fileOperationType > accum.fileOperationType) {
            accum.numberOfColumns = g.numberOfColumns;
            accum.columns = g.columns;
            accum.fileOperationType = g.fileOperationType;
          }

          if (!accum.outputFileDirecotry) accum.outputFileDirecotry = g.outputFileDirecotry;

          return accum;
        },
        {
          tableName: key,
          fileName: '',
          parquetFileName: '',
          outputFileDirecotry: '',
          numberOfRows: 0,
          numberOfColumns: 0,
          columns: [],
          fileSize: 0,
          fileOperationType: fileIngestionTypes.constants.FILE_OPERATION.DELETE,
        } as IFileInformation
      );

      retval.push(mappedData);
    }
    return retval;
  }

  public static reconcileFileInformation(
    clientId: string,
    modelId: string,
    fileInfo: fileIngestionTypes.IFileInfo[],
    processedFileInformation: IFileInformation[],
    fileStatistics: fileIngestionTypes.IFileStats[]
  ): {
    allFiles: IFileInformation[];
    accumFiles: IFileInformation[];
  } {
    const fileInfos: IFileInformation[] = [];

    const deletedTableNames = FileReconciliator.getDeletedTables(fileInfo);

    FileReconciliator.processProcessedFiles(fileInfo, processedFileInformation, fileStatistics, fileInfos);

    FileReconciliator.processSuppliedFiles(fileStatistics, deletedTableNames, fileInfos);

    const retval: IFileInformation[] = FileReconciliator.squashFilesToTables(clientId, modelId, fileInfos);

    return {allFiles: fileInfos, accumFiles: retval};
  }
}
