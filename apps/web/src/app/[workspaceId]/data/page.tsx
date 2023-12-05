import React from 'react';
import {Initializer, workspaceService} from 'business';
import {TablesView} from './_components/Tables';
import {Files} from './_components/Files';

export default async function DataPage({params}) {
  const workspaceId = params?.workspaceId;
  await Initializer.init();
  let tables;
  let files;

  if (workspaceId) {
    const workspace = await workspaceService.getSiteWorkspace(workspaceId);
    files = workspace?.projects?.flatMap((proj) => proj.files) || [];

    const tablesMap = files.reduce((acc, file) => {
      if (!acc[file.tableName]) {
        acc[file.tableName] = {
          tableName: file.tableName,
          files: [],
        };
      }
      acc[file.tableName].files.push(file);
      return acc;
    }, {});
    tables = Object.values(tablesMap);
  }

  console.dir({tables, files}, {depth: null});

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto bg-transparent">
      <div className="flex flex-col grow relative h-full px-4 sm:px-6 lg:px-8 py-2 w-full max-w-9xl mx-auto">
        <div className="text-xl text-light-gray mb-4">Tables</div>
        {tables.length > 0 ? <TablesView tablesData={tables} /> : <div>Empty Tables State</div>}
        <div className="text-xl text-light-gray mb-4">Files</div>
        {files ? <Files files={files} /> : <div>Empty Files State</div>}
      </div>
    </div>
  );
}
