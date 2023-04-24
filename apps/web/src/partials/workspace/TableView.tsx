import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { useRecoilValue } from 'recoil';
import relativeTime from 'dayjs/plugin/relativeTime';
import { fileIngestion as fileIngestionTypes } from '@glyphx/types';

import { workspaceAtom } from 'state';

import TableItemInfoIcon from 'public/svg/table-item-info.svg';
import DeleteProjectIcon from 'public/svg/delete-project-icon.svg';

const dateOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

export const TableView = () => {
  dayjs.extend(relativeTime);

  const router = useRouter();
  const { workspaceSlug } = router.query;

  const workspace = useRecoilValue(workspaceAtom);

  function sumFileSizes(fileStats: fileIngestionTypes.IFileStats[]): number {
    return fileStats.reduce((totalSize, file) => totalSize + file.fileSize, 0);
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return bytes + ' bytes';
    } else if (bytes < 1048576) {
      return (bytes / 1024).toFixed(2) + ' KB';
    } else if (bytes < 1073741824) {
      return (bytes / 1048576).toFixed(2) + ' MB';
    } else {
      return (bytes / 1073741824).toFixed(2) + ' GB';
    }
  }

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
              {workspace.projects
                .filter((proj) => !proj.deletedAt)
                .map((project) => (
                  <tr
                    onClick={() => {
                      router.push(`/account/${workspaceSlug}/${project._id.toString()}`);
                    }}
                    className="bg-secondary-space-blue rounded py-2 px-6 border border-transparent hover:border-white hover:bg-secondary-midnight hover:cursor-pointer font-roboto font-normal text-[14px] leading-[16px] tracking-[0.01em] text-light-gray hover:text-white"
                  >
                    <td title="Project Name" className="pl-2">
                      {project?.name}
                    </td>
                    <td title="Last Updated" className="p-2">
                      {/* @ts-ignore */}
                      {new Date(project?.updatedAt).toLocaleDateString('en-US', dateOptions)}
                    </td>
                    <td title="Data Used" className="p-2">
                      {`${formatFileSize(sumFileSizes(project.files))}`}
                    </td>
                    <td className="pr-2 py-2 flex flex-row items-center justify-end space-x-1">
                      {/* info button */}
                      <TableItemInfoIcon />
                      {/* delete button */}
                      <DeleteProjectIcon />
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
