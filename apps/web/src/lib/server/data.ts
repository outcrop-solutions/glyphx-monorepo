import type { NextApiRequest, NextApiResponse } from 'next';
import { dataService } from '@glyphx/business';
import { generalPurposeFunctions } from '@glyphx/core';
import { formatGridData } from 'lib/client/files/transforms';
export const getDataByRowId = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { rowIds, tableName } = req.body;
  const data = await dataService.getDataByGlyphxIds(tableName, rowIds);
  if (!data.length) {
    res.status(404).json({ errors: { error: { msg: `No data found` } } });
  } else {
    res.status(200).json(data);
  }
};

export const getDataByTableName = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse> => {
  const { workspaceId, projectId, tableName } = req.query;

  if (Array.isArray(workspaceId) && Array.isArray(projectId) && Array.isArray(tableName)) {
    res.status(400).end('Invalid Query parameter');
  }

  // const table = generalPurposeFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName as string);

  const data = await dataService.getDataByTableName(
    `glyphx_testclientid02d78bf6f54f485f81295ec510841742_642ae3b1c976ba8cc7ac445e_table1`
  );

  const formattedData = formatGridData(data);
  if (!data.length) {
    res.status(404).json({ errors: { error: { msg: `No data found` } } });
  } else {
    res.status(200).json({ data: formattedData });
  }
};
