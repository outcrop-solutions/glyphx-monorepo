import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Storage } from 'aws-amplify';
import { parse } from 'papaparse';
import { formatGridData } from 'partials';
import { PlusIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { dataGridAtom, filesOpenAtom, fileSystemAtom, selectedFileAtom } from '@/state/files';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { selectedProjectSelector } from '@/state/project';
import { dataGridLoadingAtom, GridModalErrorAtom, progressDetailAtom } from '@/state/globals';
import { postUploadCall } from '@/services/ETLCalls';
import { updateProjectInfo } from '@/services/GraphQLCalls';

import { ProcessInput } from '@/lib/pipeline/types';

export const AddFiles = () => {
  const { query } = useRouter();
  const { projectId } = query;

  const [fileSystem, setFileSystem] = useRecoilState(fileSystemAtom);
  const setSelectedFile = useSetRecoilState(selectedFileAtom);
  const setFilesOpen = useSetRecoilState(filesOpenAtom);
  const setDataGrid = useSetRecoilState(dataGridAtom);
  const setProgress = useSetRecoilState(progressDetailAtom);
  const setGridErrorModal = useSetRecoilState(GridModalErrorAtom);
  const project = useRecoilValue(selectedProjectSelector);

  const setDataGridState = useSetRecoilState(dataGridLoadingAtom);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const input = { files: acceptedFiles, ingestionType: 'BROWSER' };
      //
      processFile(input as ProcessInput);

      setDataGridState(true);
      //update file system state with processed data
      let newData = acceptedFiles.map(({ name, type, size }, idx) => ({
        // @ts-ignore
        id: idx + fileSystem.length + 1,
        parent: 0,
        droppable: false,
        text: name,
        data: {
          fileType: type,
          fileSize: size,
        },
      }));
      console.log({ fileSystem }, { newData });
      setFileSystem([...fileSystem, newData[0]]);

      // format data grid to render
      acceptedFiles.forEach(async (file) => {
        const text = await file.text();
        const { data } = parse(text, { header: true });

        const grid = formatGridData(data);
        setDataGrid(grid);
        setFilesOpen((prev) => [...prev, file.name]);
        setSelectedFile(file.name);
      });

      //send file to s3
      acceptedFiles.forEach((file, idx) => {
        const reader = new FileReader();

        reader.onabort = () => console.log('file reading was aborted');
        reader.onerror = () => console.log('file reading has failed');
        reader.onload = () => {
          // Do whatever you want with the file contents
          const binaryStr = reader.result;
          console.log('inside reader.onLOAD');
          Storage.put(`${projectId}/input/${file.name}`, binaryStr, {
            async progressCallback(progress) {
              setProgress({
                progress: progress.loaded,
                total: progress.total,
              });
              console.log('Inside storage.put');
              if (progress.loaded / progress.total === 1) {
                console.log('upload complete');
                console.log('about to do api call');
                //api call here
                try {
                  const result = await postUploadCall(project.id);
                  console.log({ result });
                  if (result.Error) {
                    // if there is an error
                    setGridErrorModal({
                      show: true,
                      title: 'Fatal Error',
                      message: 'Error Occured When Processing Your Spreadsheet',
                      devError: result.Message,
                    });
                  } else {
                    // TODO: SAVE FILE NAME TO PROJECT
                    console.log({ project });
                    let fileArr = [file.name];
                    if (project?.files !== null) {
                      fileArr = [...fileArr, ...project.files];
                    }
                    const updatedProject = {
                      id: project?.id,
                      filePath: project?.filePath,
                      expiry: new Date().toISOString(),
                      properties: project?.properties,
                      url: project?.url,
                      shared: project.shared,
                      description: project.description,
                      files: fileArr, //adding file to dynamo db
                    };
                    console.log({ updatedProject });
                    let GraphQLresult = await updateProjectInfo(updatedProject);
                    console.log('GraphQL file update:', { GraphQLresult });
                  }
                } catch (error) {
                  setGridErrorModal({
                    show: true,
                    title: 'Fatal Error',
                    message: 'Failed to Call ETL Post File Upload',
                    devError: error?.message,
                  });
                  console.log({ error });
                  setDataGridState(false);
                }
                setDataGridState(false);
              } else {
                console.log('upload incomplete');
              }
              console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
            },
          });

          console.log(`sent ${file.name} to S3`);
        };
        reader.readAsArrayBuffer(file);
      });

      // add to filesystem state
      // upload files to S3
    },
    [setFileSystem, project, fileSystem, setDataGrid]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,

    // accept: [".csv"],
    accept: ['.csv', 'application/vnd.ms-excel', 'text/csv', 'text/plain'],
    multiple: false,
  });

  useEffect(() => {
    console.log({ fileSystem });
  }, [fileSystem]);

  return (
    <div {...getRootProps()} className="text-center h-full flex flex-col justify-center">
      <svg
        className="mx-auto h-12 w-12 text-gray"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-white">No files loaded...</h3>
      <p className="mt-1 text-sm text-gray">
        Add a new CSV file to your project or open an existing file form the Files drawer.
      </p>
      <div className="mt-6">
        <input {...getInputProps()} />
        {isDragActive ? (
          <div className="text-gray hover:text-slate-300 cursor-pointer m-4">Drop the files here ...</div>
        ) : (
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-yellow hover:bg-yellow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Add CSV
          </button>
        )}
      </div>
    </div>
  );
};