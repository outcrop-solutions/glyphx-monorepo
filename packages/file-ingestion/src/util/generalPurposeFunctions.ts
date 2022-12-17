import {generalPurposeFunctions as coreFunctions} from '@glyphx/core';

export function getFullTableName(
  clientId: string,
  modelId: string,
  tableName: string
): string {
  return `${clientId}_${modelId}_${tableName}`;
}
export function getViewName(clientId: string, modelId: string): string {
  return `${clientId}_${modelId}_view`;
}

export function getTableCsvPath(
  clientId: string,
  modelId: string,
  tableName: string
): string {
  return `client/${clientId}/${modelId}/input/${tableName}/`;
}

export function getTableParquetPath(
  clientId: string,
  modelId: string,
  tableName: string
): string {
  return `client/${clientId}/${modelId}/data/${tableName}/`;
}
export function getArchiveFilePath(
  clientId: string,
  modelId: string,
  key: string,
  timestamp: string
): string {
  const deconstructedFilePath = coreFunctions.string.deconstructFilePath(key);
  const src = deconstructedFilePath.pathParts[2];
  const tableName = deconstructedFilePath.pathParts[3];
  const fileName = deconstructedFilePath.fileName;

  //client/clientId/archive/moedlId/20221213091632/input/table1/table1.csv
  const retval = `client/${clientId}/archive/${modelId}/${timestamp}/${src}/${tableName}/${fileName}`;

  return retval;
}
