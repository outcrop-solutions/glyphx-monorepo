import { PencilIcon, TrashIcon } from '@heroicons/react/outline';
import { useCallback } from 'react';
import { database as databaseTypes, web as webTypes } from '@glyphx/types';
import { projectAtom } from 'state';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { WritableDraft } from 'immer/dist/internal';
import produce from 'immer';
import { _createOpenProject, _getSignedDataUrls, api } from 'lib';
import { useSession } from 'next-auth/react';
import { useUrl } from 'lib/client/hooks';

export const Annotation = ({ item, idx }) => {
  const session = useSession();
  const url = useUrl();
  const project = useRecoilValue(projectAtom);

  const deleteAnnotation = useCallback(async () => {
    await api({
      ..._deleteAnnotation(project._id.toString(), value),
      onSuccess: async (data) => {},
      onError: () => {},
    });
  }, [project]);

  return (
    <li
      key={item.id}
      className="p-2 group-states hover:bg-secondary-midnight hover:text-white last:mb-0 flex items-center justify-between cursor-pointer"
    >
      <div className="flex items-center justify-center h-6 w-6 bg-teal"></div>
      <div className="block group-states-hover:text-white transition duration-150 truncate grow ml-2">
        <span className={`w-full text-left text-light-gray text-sm font-medium`}>{item.name}</span>
      </div>
      <div className="invisible group-states-hover:visible flex gap-x-2 justify-between items-center">
        <PencilIcon onClick={updateAnnotation} className="h-4 w-4" />
        <TrashIcon onClick={deleteAnnotation} className="h-4 w-4" />
      </div>
    </li>
  );
};
