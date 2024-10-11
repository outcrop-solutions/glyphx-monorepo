'use client';
import {dataGridPayloadSelector, filesOpenSelector} from 'state/files';
import {useRecoilValue} from 'recoil';
import {FileTab} from './FileTab';
import {projectAtom, rowIdsAtom} from 'state';
import {useCallback} from 'react';
import {toCSV} from './to-csv';
import {api} from 'lib';
import {DownloadIcon} from '@heroicons/react/outline';
import {getDataByRowId} from 'actions';

export const GridHeader = () => {
  const filesOpen = useRecoilValue(filesOpenSelector);
  const rowIds = useRecoilValue(rowIdsAtom);
  const project = useRecoilValue(projectAtom);
  const gridPayload = useRecoilValue(dataGridPayloadSelector);

  const exportCsv = useCallback(async () => {
    const retval = await getDataByRowId(
      project.workspace.id,
      project.id,
      gridPayload.tableName,
      (rowIds as any[])?.map((id) => Number(id)) as number[],
      true,
      0,
      0
    );

    if (retval?.data) {
      const csv = toCSV(
        retval.data?.rows,
        retval.data?.columns?.map(({key}) => key),
        ',',
        '"'
      );
    }
  }, [gridPayload.tableName, project.id, project.workspace.id, rowIds]);

  return (
    <div className="bg-secondary-space-blue h-8 border-b border-gray text-white text-xs flex flex-shrink-0 items-center justify-between">
      <div className="flex items-center w-full h-8">
        {filesOpen && filesOpen?.length > 0 && (
          <>
            {filesOpen.map(({tableName, fileIndex}, idx) => (
              <FileTab key={`${tableName}-${idx}`} tableName={tableName} fileIndex={fileIndex} />
            ))}
          </>
        )}
      </div>
      {rowIds && (
        <div
          onClick={() => exportCsv()}
          className="group cursor-pointer flex items-center justify-between px-4 bg-gray hover:bg-yellow border-r border-t border-l border-white hover:text-black h-full"
        >
          <span className="whitespace-nowrap">Export CSV</span>
          <DownloadIcon className="text-white w-6 ml-2 group-hover:text-black" />
        </div>
      )}
    </div>
  );
};
