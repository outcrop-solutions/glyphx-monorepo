import type { NextApiRequest, NextApiResponse } from 'next';
import { dataService } from '@glyphx/business';
import { generalPurposeFunctions as sharedFunctions } from '@glyphx/core';
import { formatGridData } from 'lib/client/files/hashFileStats';

export const getDataByRowId = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { workspaceId, projectId, tableName, rowIds } = req.body;

  if (Array.isArray(workspaceId) || Array.isArray(projectId) || Array.isArray(tableName)) {
    res.status(400).end('Invalid Query parameter');
  }

  const fullTableName = sharedFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName);

  const data = await dataService.getDataByGlyphxIds(fullTableName, rowIds);

  const formattedData = formatGridData(data);

  if (!data.length) {
    res.status(404).json({ errors: { error: { msg: `No data found` } } });
  } else {
    res.status(200).json({ data: formattedData });
  }
};

export const getDataByTableName = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse> => {
  const { workspaceId, projectId, tableName, rowIds } = req.body;

  if (Array.isArray(workspaceId) || Array.isArray(projectId) || Array.isArray(tableName)) {
    res.status(400).end('Invalid Query parameter');
  }

  // const table = generalPurposeFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName as string);
  const data = await dataService.getDataByTableName(
    sharedFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName)
  );

  const formattedData = formatGridData(data);
  if (!data.length) {
    res.status(404).json({ errors: { error: { msg: `No data found` } } });
  } else {
    res.status(200).json({ data: formattedData });
  }
};
