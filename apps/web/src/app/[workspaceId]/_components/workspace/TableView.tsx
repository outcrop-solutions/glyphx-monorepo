'use client';
import dayjs from 'dayjs';
import {useRouter, useParams} from 'next/navigation';
import {useRecoilValue, useSetRecoilState} from 'recoil';
import relativeTime from 'dayjs/plugin/relativeTime';
import {fileIngestionTypes, webTypes} from 'types';
import {modalsAtom, rightSidebarControlAtom, workspaceAtom} from 'state';
import TableItemInfoIcon from 'public/svg/table-item-info.svg';
import DeleteProjectIcon from 'public/svg/delete-project-icon.svg';
import produce from 'immer';
import {useCallback} from 'react';
import {WritableDraft} from 'immer/dist/internal';
import {Route} from 'next';
import {formatFileSize} from 'lib/utils/formatFileSize';

const dateOptions = {
  weekday: 'short',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
};

export const TableView = ({projects}) => {
  dayjs.extend(relativeTime);
  const router = useRouter();
  const params = useParams();
  const {workspaceId} = params as {workspaceId: string};
  const workspace = useRecoilValue(workspaceAtom);
  const setModals = useSetRecoilState(modalsAtom);
  const setRightSidebarControl = useSetRecoilState(rightSidebarControlAtom);

  function sumFileSizes(fileStats: fileIngestionTypes.IFileStats[]): number {
    return fileStats.reduce((totalSize, file) => totalSize + file.fileSize, 0);
  }

  const handleControl = (ctrl: webTypes.constants.RIGHT_SIDEBAR_CONTROL, data) => {
    setRightSidebarControl(
      produce((draft: WritableDraft<webTypes.IRightSidebarAtom>) => {
        draft.type = ctrl;
        draft.data = data;
      })
    );
  };

  const deleteProject = useCallback(
    (project) => {
      setModals(
        produce((draft: WritableDraft<webTypes.IModalsAtom>) => {
          draft.modals.push({
            type: webTypes.constants.MODAL_CONTENT_TYPE.DELETE_PROJECT,
            isSubmitting: false,
            data: {projectId: project.id, projectName: project.name},
          });
        })
      );
    },
    [setModals]
  );

  return (
    <div className="text-white rounded-sm relative">
      <div className="px-0">
        {/* Table */}
        <div className="overflow-x-auto">
          <p className="font-rubik font-light text-[18px] leading-[21px] tracking-[0.01em] text-white">
            Recently Viewed Projects
          </p>
          <div className="my-4">
            <table className="border-collapse w-full">
              <thead className="pb-4">
                <tr>
                  <th className="text-left">Project Name</th>
                  <th className="text-left">Last Updated</th>
                  <th className="text-left">Data Used</th>
                  <th className="text-right pr-2">Actions</th>
                </tr>
              </thead>
              {projects.map((project) => (
                <tr className="bg-secondary-space-blue rounded py-2 px-6 border border-transparent hover:border-white hover:bg-secondary-midnight hover:cursor-pointer font-roboto font-normal text-[14px] leading-[16px] tracking-[0.01em] text-light-gray hover:text-white">
                  <td
                    onClick={() => {
                      router.push(`/${workspaceId}/${project.id!}` as Route);
                    }}
                    title="Project Name"
                    className="pl-2"
                  >
                    {project?.name}
                  </td>
                  <td
                    onClick={() => {
                      router.push(`/${workspaceId}/${project.id!}` as Route);
                    }}
                    title="Last Updated"
                    className="p-2"
                  >
                    {new Date(project?.updatedAt).toLocaleDateString('en-US', dateOptions as any)}
                  </td>
                  <td
                    onClick={() => {
                      router.push(`/${workspaceId}/${project.id!}` as Route);
                    }}
                    title="Data Used"
                    className="p-2"
                  >
                    {`${formatFileSize(sumFileSizes(project.files))}`}
                  </td>
                  <td className="pr-2 py-2 flex flex-row items-center justify-end space-x-1">
                    {/* info button */}
                    <TableItemInfoIcon
                      onClick={() => handleControl(webTypes.constants.RIGHT_SIDEBAR_CONTROL.INFO, project)}
                    />
                    {/* delete button */}
                    <DeleteProjectIcon onClick={() => deleteProject(project)} />
                  </td>
                </tr>
              ))}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
