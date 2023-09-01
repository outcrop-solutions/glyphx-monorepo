import type { NextApiRequest, NextApiResponse } from 'next';
import { dataService, projectService } from 'business';
import { generalPurposeFunctions as sharedFunctions } from 'core';
import { formatGridData } from 'lib/client/files/transforms/formatGridData';

export const getDataByRowId = async (req: NextApiRequest, res: NextApiResponse): Promise<void | NextApiResponse> => {
  const { workspaceId, projectId, tableName, rowIds, page = 1, pageSize = 50 } = req.body;

  if (Array.isArray(workspaceId) || Array.isArray(projectId) || Array.isArray(tableName)) {
    res.status(400).end('Invalid Query parameter');
  }

  const fullTableName = sharedFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName);
  try {
    const data = await dataService.getDataByGlyphxIds(fullTableName, rowIds);
    const project = await projectService.getProject(projectId);

    if (project) {
      const columns = project.files.filter((file) => file.tableName === tableName)[0].columns;

      const formattedData = formatGridData(data, columns);

      if (!formattedData.rows.length) {
        res.status(404).json({ errors: { error: { msg: `No data found` } } });
      } else {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedRows = formattedData.rows.slice(start, end);

        res.status(200).json({
          data: { ...formattedData, rows: paginatedRows },
          totalPages: Math.ceil(formattedData.rows.length / pageSize),
          currentPage: page,
        });
      }
    }
  } catch (e) {
    res.status(500).send(e.message);
  }
};

export const getDataByTableName = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void | NextApiResponse> => {
  const { workspaceId, projectId, tableName, rowIds, page = 1, pageSize = 50 } = req.body;

  if (Array.isArray(workspaceId) || Array.isArray(projectId) || Array.isArray(tableName)) {
    res.status(400).end('Invalid Query parameter');
  }

  try {
    const table = sharedFunctions.fileIngestion.getFullTableName(workspaceId, projectId, tableName);

    const data = await dataService.getDataByTableName(table);
    const project = await projectService.getProject(projectId);

    if (project) {
      const columns = project.files.filter((file) => file.tableName === tableName)[0].columns;

      const formattedData = formatGridData(data, columns);
      if (!formattedData.rows.length) {
        res.status(404).json({ errors: { error: { msg: `No data found` } } });
      } else {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedRows = formattedData.rows.slice(start, end);

        res.status(200).json({
          data: { ...formattedData, rows: paginatedRows },
          totalPages: Math.ceil(formattedData.rows.length / pageSize),
          currentPage: page,
        });
      }
    }
  } catch (error) {
    res.status(404).json({ errors: { error: { msg: error.message } } });
  }
};
